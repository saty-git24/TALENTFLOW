import { http } from 'msw';
import { setupWorker } from 'msw/browser';
import { db } from '../db/index.js';
import { simulateNetworkDelay, simulateNetworkError, buildQueryString, paginateArray } from '../utils/helpers.js';

// Configurable MSW simulation settings (use Vite env variable VITE_MSW_ERROR_RATE)
const MSW_ERROR_RATE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MSW_ERROR_RATE
  ? Number(import.meta.env.VITE_MSW_ERROR_RATE)
  : 0.08; // default 8%

// Helper function to simulate API response with delay and potential errors
const createApiResponse = async (handler) => {
  await simulateNetworkDelay();
  
  if (simulateNetworkError(MSW_ERROR_RATE)) {
    throw new Error('Simulated network error');
  }
  
  return handler();
};

// Jobs API handlers
const jobsHandlers = [
  // GET /api/jobs - List jobs with pagination and filtering
  http.get('/api/jobs', async ({ request }) => {
    try {
      const result = await createApiResponse(async () => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const status = url.searchParams.get('status') || '';
        const tagsParam = url.searchParams.get('tags') || '';
        const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
        const page = parseInt(url.searchParams.get('page')) || 1;
        const pageSize = parseInt(url.searchParams.get('pageSize')) || 10;
        const sort = url.searchParams.get('sort') || 'createdAt';
        const order = url.searchParams.get('order') || 'desc';

        let jobs = await db.jobs.orderBy(sort).toArray();
        
        if (order === 'desc') {
          jobs.reverse();
        }

        // Apply filters
        if (search) {
          jobs = jobs.filter(job => 
            job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.description?.toLowerCase().includes(search.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
          );
        }

        if (status) {
          jobs = jobs.filter(job => job.status === status);
        }

        // Filter by tags (OR logic - job must have at least one of the selected tags)
        if (tags.length > 0) {
          jobs = jobs.filter(job => {
            if (!job.tags || !Array.isArray(job.tags)) return false;
            return tags.some(tag => 
              job.tags.some(jobTag => 
                jobTag.toLowerCase() === tag.toLowerCase()
              )
            );
          });
        }

        const result = paginateArray(jobs, page, pageSize);
        
        return {
          jobs: result.items,
          pagination: {
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalItems: result.totalItems,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage
          }
        };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch jobs' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // GET /api/jobs/:id - Get single job
  http.get('/api/jobs/:id', async ({ params }) => {
    try {
      const result = await createApiResponse(async () => {
        const id = parseParam(params.id);
        let job;
        if (typeof id === 'number') {
          job = await db.jobs.get(id);
        } else {
          job = await db.jobs.where('id').equals(id).first();
        }

        if (!job) {
          throw new Error('Job not found');
        }

        return { job };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // POST /api/jobs - Create new job
  http.post('/api/jobs', async ({ request }) => {
    try {
      const result = await createApiResponse(async () => {
        const jobData = await request.json();
        
        // Get the highest order value and increment
        const maxOrder = await db.jobs.orderBy('order').reverse().first();
        jobData.order = maxOrder ? maxOrder.order + 1 : 0;
        
        const id = await db.jobs.add(jobData);
        const job = await db.jobs.get(id);
        return { job };
      });

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to create job' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // PATCH /api/jobs/:id - Update job
  http.patch('/api/jobs/:id', async ({ request, params }) => {
    try {
      const result = await createApiResponse(async () => {
        const updates = await request.json();
        const id = parseParam(params.id);
        if (typeof id === 'number') {
          await db.jobs.update(id, updates);
          const job = await db.jobs.get(id);
          return { job };
        }

        const existing = await db.jobs.where('id').equals(id).first();
        if (!existing) throw new Error('Job not found');
        await db.jobs.update(existing.id, updates);
        const job = await db.jobs.get(existing.id);
        return { job };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to update job' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // DELETE /api/jobs/:id - Delete job
  http.delete('/api/jobs/:id', async ({ params }) => {
    try {
      const result = await createApiResponse(async () => {
        const id = parseParam(params.id);
        if (typeof id === 'number') {
          await db.jobs.delete(id);
        } else {
          const existing = await db.jobs.where('id').equals(id).first();
          if (existing) await db.jobs.delete(existing.id);
        }

        return { success: true };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to delete job' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // PATCH /api/jobs/:id/reorder - Reorder jobs
  http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
    try {
      const result = await createApiResponse(async () => {
        const { fromOrder, toOrder } = await request.json();
        
        // Get all jobs ordered by order field
        const jobs = await db.jobs.orderBy('order').toArray();
        
        // Find the job being moved
        const jobToMove = jobs.find(job => job.order === fromOrder);
        if (!jobToMove) {
          throw new Error('Job not found');
        }

        // Update orders
        if (fromOrder < toOrder) {
          // Moving down - decrement jobs between fromOrder and toOrder
          for (const job of jobs) {
            if (job.order > fromOrder && job.order <= toOrder) {
              await db.jobs.update(job.id, { order: job.order - 1 });
            }
          }
        } else {
          // Moving up - increment jobs between toOrder and fromOrder
          for (const job of jobs) {
            if (job.order >= toOrder && job.order < fromOrder) {
              await db.jobs.update(job.id, { order: job.order + 1 });
            }
          }
        }
        
        // Update the moved job's order
  await db.jobs.update(jobToMove.id, { order: toOrder });
        
        return { success: true };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to reorder jobs' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  })
];

// Candidates API handlers
const candidatesHandlers = [
  // GET /api/candidates - List candidates
  http.get('/api/candidates', async ({ request }) => {
    try {
      const result = await createApiResponse(async () => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const stage = url.searchParams.get('stage') || '';
        const jobIdRaw = url.searchParams.get('jobId');
        const jobId = jobIdRaw !== null && jobIdRaw !== '' ? Number(jobIdRaw) : '';
        const page = parseInt(url.searchParams.get('page')) || 1;
        const pageSize = parseInt(url.searchParams.get('pageSize')) || 10;

        let candidates = await db.candidates.toArray();

        // Apply filters
        if (search) {
          candidates = candidates.filter(candidate => 
            candidate.name.toLowerCase().includes(search.toLowerCase()) ||
            candidate.email.toLowerCase().includes(search.toLowerCase())
          );
        }

        if (stage) {
          candidates = candidates.filter(candidate => candidate.stage === stage);
        }

        if (jobId !== '') {
          candidates = candidates.filter(candidate => candidate.jobId === jobId);
        }

        // Sort by most recent first
        candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const result = paginateArray(candidates, page, pageSize);
        
        return {
          candidates: result.items,
          pagination: {
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalItems: result.totalItems,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage
          }
        };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch candidates' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // PATCH /api/candidates/:id - Update candidate
  http.patch('/api/candidates/:id', async ({ request, params }) => {
    try {
      const result = await createApiResponse(async () => {
        const updates = await request.json();
        const id = Number(params.id);
        const oldCandidate = await db.candidates.get(id);

        await db.candidates.update(id, updates);
        const candidate = await db.candidates.get(id);
        
        // If stage changed, add timeline entry
        if (updates.stage && updates.stage !== oldCandidate.stage) {
          await db.candidateTimeline.add({
            candidateId: candidate.id,
            stage: updates.stage,
            changedBy: updates.changedBy || 'user',
            notes: `Stage changed from ${oldCandidate.stage} to ${updates.stage}`
          });
        }
        
        return { candidate };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to update candidate' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  })
];

// Assessments API handlers
const assessmentsHandlers = [
  // GET /api/assessments/:jobId - Get assessment for job
  http.get('/api/assessments/:jobId', async ({ params }) => {
    try {
      const result = await createApiResponse(async () => {
        const jobId = Number(params.jobId);
        const assessment = await db.assessments
          .where('jobId')
          .equals(jobId)
          .first();
        
        return { assessment };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch assessment' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // PUT /api/assessments/:jobId - Save assessment
  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    try {
      const result = await createApiResponse(async () => {
        const assessmentData = await request.json();
        assessmentData.jobId = Number(params.jobId);
        
        // Check if assessment exists
        const existing = await db.assessments
          .where('jobId')
          .equals(assessmentData.jobId)
          .first();
        
        let assessment;
        if (existing) {
          await db.assessments.update(existing.id, assessmentData);
          assessment = await db.assessments.get(existing.id);
        } else {
          const id = await db.assessments.add(assessmentData);
          assessment = await db.assessments.get(id);
        }
        
        return { assessment };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to save assessment' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  })
];

// Combine all handlers
const handlers = [
  ...jobsHandlers,
  ...candidatesHandlers,
  ...assessmentsHandlers
];

// Create worker
export const worker = setupWorker(...handlers);

export const initializeMockApi = async () => {
  if (typeof window !== 'undefined') {
    await worker.start({
      onUnhandledRequest: 'warn'
    });
    console.log('Mock API initialized');
  }
};

// Helper to parse a route param into a number when possible, otherwise return the original string
const parseParam = (p) => {
  if (p === undefined || p === null) return p;
  const n = Number(p);
  return Number.isNaN(n) ? p : n;
};