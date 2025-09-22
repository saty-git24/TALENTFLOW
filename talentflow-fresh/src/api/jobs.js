import { buildQueryString } from '../utils/helpers.js';
import { parseResponse } from './fetchHelper.js';

const BASE_URL = '/api/jobs';

export const jobsApi = {
  // Get all jobs with pagination and filters
  getJobs: async (params = {}) => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
    
    const response = await fetch(url);
    return parseResponse(response);
  },

  // Get single job by ID
  getJob: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    return parseResponse(response);
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

    return parseResponse(response);
  },

  // Update existing job
  updateJob: async (id, updates) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const parsed = await parseResponse(response);
      // Helpful debug log for dev: show what the API returned for updates
      // eslint-disable-next-line no-console
      console.debug('[jobsApi] updateJob response for id', id, parsed);
      return parsed;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[jobsApi] updateJob failed for id', id, err);
      throw err;
    }
  },

  // Delete job
  deleteJob: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    return parseResponse(response);
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

    return parseResponse(response);
  },

  // Archive job
  archiveJob: async (id) => {
    // eslint-disable-next-line no-console
    console.debug('[jobsApi] archiveJob called for id', id);
    return jobsApi.updateJob(id, { status: 'archived' });
  },

  // Unarchive job
  unarchiveJob: async (id) => {
    // eslint-disable-next-line no-console
    console.debug('[jobsApi] unarchiveJob called for id', id);
    return jobsApi.updateJob(id, { status: 'active' });
  }
};