import { http } from 'msw';
import { setupWorker } from 'msw/browser';
import { db } from '../db/index.js';
import { simulateNetworkDelay, simulateNetworkError, buildQueryString, paginateArray } from '../utils/helpers.js';

// Helper function to simulate API response with delay and potential errors
const createApiResponse = async (handler) => {
  await simulateNetworkDelay();
  
  if (simulateNetworkError(0.08)) { // 8% error rate
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
        const job = await db.jobs.get(params.id);
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
        const jobId = url.searchParams.get('jobId') || '';
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

        if (jobId) {
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
  })
];

// Assessments API handlers
const assessmentsHandlers = [
  // GET /api/assessments/:jobId - Get assessment for job
  http.get('/api/assessments/:jobId', async ({ params }) => {
    try {
      const result = await createApiResponse(async () => {
        const assessment = await db.assessments
          .where('jobId')
          .equals(params.jobId)
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