import { buildQueryString } from '../utils/helpers.js';

const BASE_URL = '/api/candidates';

export const candidatesApi = {
  // Get all candidates with pagination and filters
  getCandidates: async (params = {}) => {
    const queryString = buildQueryString(params);
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch candidates');
    }
    
    return response.json();
  },

  // Get single candidate by ID
  getCandidate: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch candidate');
    }
    
    return response.json();
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
    
    if (!response.ok) {
      throw new Error('Failed to create candidate');
    }
    
    return response.json();
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
    
    if (!response.ok) {
      throw new Error('Failed to update candidate');
    }
    
    return response.json();
  },

  // Delete candidate
  deleteCandidate: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete candidate');
    }
    
    return response.json();
  },

  // Get candidate timeline
  getCandidateTimeline: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/timeline`);
    if (!response.ok) {
      throw new Error('Failed to fetch candidate timeline');
    }
    
    return response.json();
  },

  // Get candidate notes
  getCandidateNotes: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/notes`);
    if (!response.ok) {
      throw new Error('Failed to fetch candidate notes');
    }
    
    return response.json();
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
    
    if (!response.ok) {
      throw new Error('Failed to add candidate note');
    }
    
    return response.json();
  },

  // Move candidate to different stage
  moveCandidateStage: async (id, stage, changedBy = 'user') => {
    return candidatesApi.updateCandidate(id, { stage, changedBy });
  }
};