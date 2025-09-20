import { buildQueryString } from '../utils/helpers.js';

const BASE_URL = '/api/jobs';

export const jobsApi = {
  // Get all jobs with pagination and filters
  getJobs: async (params = {}) => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    
    return response.json();
  },

  // Get single job by ID
  getJob: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }
    
    return response.json();
  },

  // Create new job
  createJob: async (jobData) => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create job');
    }
    
    return response.json();
  },

  // Update existing job
  updateJob: async (id, updates) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update job');
    }
    
    return response.json();
  },

  // Delete job
  deleteJob: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete job');
    }
    
    return response.json();
  },

  // Reorder jobs
  reorderJobs: async (id, { fromOrder, toOrder }) => {
    const response = await fetch(`${BASE_URL}/${id}/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fromOrder, toOrder }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reorder jobs');
    }
    
    return response.json();
  },

  // Archive job
  archiveJob: async (id) => {
    return jobsApi.updateJob(id, { status: 'archived' });
  },

  // Unarchive job
  unarchiveJob: async (id) => {
    return jobsApi.updateJob(id, { status: 'active' });
  }
};