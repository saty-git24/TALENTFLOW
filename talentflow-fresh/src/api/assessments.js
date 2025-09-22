import { parseResponse } from './fetchHelper.js';

const BASE_URL = '/api/assessments';

export const assessmentsApi = {
  // Get assessment for a specific job
  getAssessment: async (jobId) => {
    const response = await fetch(`${BASE_URL}/${jobId}`);
    return parseResponse(response);
  },

  // Create or update assessment for a job
  saveAssessment: async (jobId, assessmentData) => {
    const response = await fetch(`${BASE_URL}/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentData),
    });

    return parseResponse(response);
  },

  // Submit assessment response
  submitAssessmentResponse: async (assessmentId, responseData) => {
    const response = await fetch(`${BASE_URL}/${assessmentId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData),
    });

    return parseResponse(response);
  },

  // Get assessment responses for a candidate
  getAssessmentResponses: async (assessmentId, candidateId) => {
    const response = await fetch(`${BASE_URL}/${assessmentId}/responses/${candidateId}`);
    return parseResponse(response);
  }
};