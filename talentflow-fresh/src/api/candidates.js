import { buildQueryString } from '../utils/helpers.js';
import { parseResponse } from './fetchHelper.js';

const BASE_URL = '/api/candidates';

export const candidatesApi = {
  // Get all candidates with pagination and filters
  getCandidates: async (params = {}) => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
    
    const response = await fetch(url);
    return parseResponse(response);
  },

  // Get single candidate by ID
  getCandidate: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    return parseResponse(response);
  },

  // Create new candidate
  createCandidate: async (candidateData) => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateData),
    });

    return parseResponse(response);
  },

  // Update existing candidate
  updateCandidate: async (id, updates) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    return parseResponse(response);
  },

  // Delete candidate
  deleteCandidate: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    return parseResponse(response);
  },

  // Get candidate timeline
  getCandidateTimeline: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/timeline`);
    return parseResponse(response);
  },

  // Get candidate notes
  getCandidateNotes: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/notes`);
    return parseResponse(response);
  },

  // Add note to candidate
  addCandidateNote: async (id, noteData) => {
    const response = await fetch(`${BASE_URL}/${id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    return parseResponse(response);
  },

  // Move candidate to different stage
  moveCandidateStage: async (id, stage, changedBy = 'user') => {
    return candidatesApi.updateCandidate(id, { stage, changedBy });
  }
};