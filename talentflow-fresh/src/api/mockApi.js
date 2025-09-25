import { http } from 'msw';
import { setupWorker } from 'msw/browser';
import { db } from '../db/index.js';
import { isValidStageTransition } from '../utils/helpers.js';
import { simulateNetworkDelay, simulateKanbanDelay, simulateNetworkError, buildQueryString, paginateArray } from '../utils/helpers.js';

// Configurable MSW simulation settings (use Vite env variable VITE_MSW_ERROR_RATE)
const MSW_ERROR_RATE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MSW_ERROR_RATE
  ? Number(import.meta.env.VITE_MSW_ERROR_RATE)
  : 0; // Temporarily disabled error simulation (was 0.08 / 8%)

// API response with random latency (200-1200ms) and random error (5-10%)
const createApiResponse = async (handler) => {
  // Random error: 5-10% chance
  const errorChance = 0.05 + Math.random() * 0.05; // 0.05 to 0.10
  if (Math.random() < errorChance) {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 1000));
    throw new Error('Simulated network error');
  }
  // Random latency: 200-1200ms
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 1000));
  return await handler();
};


// Kanban operations - same as regular but dedicated for clarity
const createKanbanApiResponse = async (handler) => {
  // No delays for Kanban operations - immediate response
  if (simulateNetworkError(MSW_ERROR_RATE)) {
    throw new Error('Simulated network error');
  }
  
  return await handler();
};

// Jobs API handlers
const jobsHandlers = [
  // GET /api/jobs - List jobs with pagination and filtering
  http.get('/api/jobs', async ({ request }) => {
    console.log('[MSW] Intercepted GET /api/jobs', request.url);
    try {
      const result = await createApiResponse(async () => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const status = url.searchParams.get('status') || '';
        const tagsParam = url.searchParams.get('tags') || '';
        const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
        const page = parseInt(url.searchParams.get('page')) || 1;
        const pageSize = parseInt(url.searchParams.get('pageSize')) || 10;
        const sort = url.searchParams.get('sort') || 'order'; // Use order field instead of createdAt for more reliable sorting
        const order = url.searchParams.get('order') || 'asc';  // Use ascending order so first jobs (order: 0, 1, 2) appear first

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

  // GET /jobs - List jobs (no /api prefix, for frontend requests to /jobs)
  http.get('/jobs', async ({ request }) => {
    console.log('[MSW] Intercepted GET /jobs', request.url);
    // Reuse the same logic as /api/jobs
    try {
      const result = await createApiResponse(async () => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const status = url.searchParams.get('status') || '';
        const tagsParam = url.searchParams.get('tags') || '';
        const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
        const page = parseInt(url.searchParams.get('page')) || 1;
        const pageSize = parseInt(url.searchParams.get('pageSize')) || 10;
        const sort = url.searchParams.get('sort') || 'order';
        const order = url.searchParams.get('order') || 'asc';

        let jobs = await db.jobs.orderBy(sort).toArray();
        if (order === 'desc') jobs.reverse();
        if (search) {
          jobs = jobs.filter(job =>
            job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.description?.toLowerCase().includes(search.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
          );
        }
        if (status) jobs = jobs.filter(job => job.status === status);
        if (tags.length > 0) {
          jobs = jobs.filter(job => {
            if (!job.tags || !Array.isArray(job.tags)) return false;
            return tags.some(tag =>
              job.tags.some(jobTag => jobTag.toLowerCase() === tag.toLowerCase())
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
        const id = params.id;
        const job = await db.jobs.where('id').equals(id).first();
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
      const jobData = await request.json();
      
      // Add required fields if missing
      if (!jobData.createdAt) {
        jobData.createdAt = new Date().toISOString();
      }
      if (!jobData.updatedAt) {
        jobData.updatedAt = new Date().toISOString();
      }
      if (typeof jobData.order === 'undefined') {
        // Get the highest order value and increment
        const maxOrder = await db.jobs.orderBy('order').reverse().first();
        jobData.order = maxOrder ? maxOrder.order + 1 : 0;
      }
      
      const id = await db.jobs.add(jobData);
      const job = await db.jobs.get(id);
      
      const result = { job };

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to create job', details: error.message }), {
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
        const id = params.id;
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
        const id = params.id;
        const existing = await db.jobs.where('id').equals(id).first();
        if (existing) await db.jobs.delete(existing.id);
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
          for (const job of jobs) {
            if (job.order > fromOrder && job.order <= toOrder) {
              await db.jobs.update(job.id, { order: job.order - 1 });
            }
          }
        } else {
          for (const job of jobs) {
            if (job.order >= toOrder && job.order < fromOrder) {
              await db.jobs.update(job.id, { order: job.order + 1 });
            }
          }
        }
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
    console.log('[MSW] Intercepted GET /api/candidates', request.url);
    try {
      const result = await createApiResponse(async () => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const stage = url.searchParams.get('stage') || '';
  const jobIdRaw = url.searchParams.get('jobId');
  const jobId = jobIdRaw !== null && jobIdRaw !== '' ? String(jobIdRaw) : '';
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
          candidates = candidates.filter(candidate => String(candidate.jobId) === jobId);
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

  // GET /api/candidates/:id - Get single candidate
  http.get('/api/candidates/:id', async ({ params }) => {
    try {
      const result = await createApiResponse(async () => {
        const id = params.id;
        
        let candidate;
        
        // Try numeric ID first
        if (!isNaN(id)) {
          candidate = await db.candidates.get(Number(id));
        }
        
        // If not found, try string ID lookup
        if (!candidate) {
          candidate = await db.candidates.where('id').equals(id).first();
        }
        
        // If still not found, try string comparison
        if (!candidate) {
          candidate = await db.candidates.where('id').equals(String(id)).first();
        }
        
        if (!candidate) {
          throw new Error('Candidate not found');
        }
        
        return { candidate };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Candidate not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // PATCH /api/candidates/:id - Update candidate
  http.patch('/api/candidates/:id', async ({ request, params }) => {
    try {
      const result = await createKanbanApiResponse(async () => {
        const updates = await request.json();
        const id = params.id;
        
        // Try to find candidate by both string and numeric ID
        let oldCandidate;
        
        // First try as numeric ID
        if (!isNaN(id)) {
          oldCandidate = await db.candidates.get(Number(id));
        }
        
        // If not found, try as string ID
        if (!oldCandidate) {
          oldCandidate = await db.candidates.where('id').equals(id).first();
        }
        
        // If still not found, try string conversion
        if (!oldCandidate) {
          oldCandidate = await db.candidates.where('id').equals(String(id)).first();
        }

        if (!oldCandidate) {
          throw new Error('Candidate not found');
        }

        // If stage changed, validate the transition
        if (updates.stage && updates.stage !== oldCandidate.stage) {
          if (!isValidStageTransition(oldCandidate.stage, updates.stage)) {
            throw new Error(`Invalid stage transition from ${oldCandidate.stage} to ${updates.stage}`);
          }
        }

        // Update using the actual database ID (which is numeric)
        await db.candidates.update(oldCandidate.id, updates);
        const candidate = await db.candidates.get(oldCandidate.id);
        
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
      return new Response(JSON.stringify({ error: error.message || 'Failed to update candidate' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // DELETE /api/candidates/:id - Delete candidate
  http.delete('/api/candidates/:id', async ({ params }) => {
    try {
      const result = await createApiResponse(async () => {
        const candidateId = params.id;
        
        // Try to find and delete candidate by both string and numeric ID
        let deleted = false;
        
        // First try as numeric ID
        if (!isNaN(candidateId)) {
          const numericId = Number(candidateId);
          const candidate = await db.candidates.get(numericId);
          if (candidate) {
            await db.candidates.delete(numericId);
            deleted = true;
            
            // Also delete related timeline entries
            await db.candidateTimeline
              .where('candidateId')
              .equals(numericId)
              .delete();
          }
        }
        
        // If not deleted yet, try as string
        if (!deleted) {
          await db.candidates.where('id').equals(candidateId).delete();
          
          // Also delete related timeline entries
          await db.candidateTimeline
            .where('candidateId')
            .equals(candidateId)
            .delete();
        }
        
        return { success: true };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to delete candidate' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // GET /api/candidates/:id/timeline - Get candidate timeline
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    try {
      const result = await createApiResponse(async () => {
        const candidateId = params.id;
        let timeline = await db.candidateTimeline
          .where('candidateId')
          .equals(candidateId)
          .reverse()
          .sortBy('changedAt');
          
        // If no timeline found with string ID, try numeric
        if (timeline.length === 0 && !isNaN(candidateId)) {
          timeline = await db.candidateTimeline
            .where('candidateId')
            .equals(Number(candidateId))
            .reverse()
            .sortBy('changedAt');
        }
        
        return { timeline };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch timeline' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // GET /api/candidates/:id/notes - Get candidate notes
  http.get('/api/candidates/:id/notes', async ({ params }) => {
    try {
      const result = await createApiResponse(async () => {
        const candidateId = params.id;
        let notes = await db.candidateNotes
          .where('candidateId')
          .equals(candidateId)
          .reverse()
          .sortBy('createdAt');
          
        // If no notes found with string ID, try numeric
        if (notes.length === 0 && !isNaN(candidateId)) {
          notes = await db.candidateNotes
            .where('candidateId')
            .equals(Number(candidateId))
            .reverse()
            .sortBy('createdAt');
        }
        
        return { notes };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch notes' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // POST /api/candidates/:id/notes - Add candidate note
  http.post('/api/candidates/:id/notes', async ({ request, params }) => {
    try {
      const result = await createApiResponse(async () => {
        const noteData = await request.json();
        noteData.candidateId = params.id;
        
        const id = await db.candidateNotes.add(noteData);
        const note = await db.candidateNotes.get(id);
        
        return { note };
      });

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to add note' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  })
];

// Assessments API handlers
const assessmentsHandlers = [
  // GET /api/debug/database - Debug endpoint to check database status
  http.get('/api/debug/database', async () => {
    try {
      const result = await createApiResponse(async () => {
        const jobsCount = await db.jobs.count();
        const candidatesCount = await db.candidates.count();
        const timelineCount = await db.candidateTimeline.count();
        const notesCount = await db.candidateNotes.count();
        
        const sampleCandidate = await db.candidates.limit(1).first();
        
        return {
          counts: {
            jobs: jobsCount,
            candidates: candidatesCount,
            timeline: timelineCount,
            notes: notesCount
          },
          sampleCandidate: sampleCandidate
        };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to check database' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // POST /api/debug/reset - Reset database
  http.post('/api/debug/reset', async () => {
    try {
      const result = await createApiResponse(async () => {
        const { clearDatabase } = await import('../db/index.js');
        await clearDatabase();
        return { success: true, message: 'Database cleared and reseeded' };
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to reset database' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }),

  // GET /api/assessments/:jobId - Get assessment for job
  http.get('/api/assessments/:jobId', async ({ params }) => {
    try {
      const result = await createApiResponse(async () => {
        const jobId = params.jobId;
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
        assessmentData.jobId = params.jobId;
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
  }
};

// Helper to parse a route param into a number when possible, otherwise return the original string
const parseParam = (p) => {
  if (p === undefined || p === null) return p;
  const n = Number(p);
  return Number.isNaN(n) ? p : n;
};