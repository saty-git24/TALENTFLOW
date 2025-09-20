const BASE_URL = '/api/assessments';

export const assessmentsApi = {
  // Get assessment for a specific job
  getAssessment: async (jobId) => {
    const response = await fetch(`${BASE_URL}/${jobId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch assessment');
    }
    
    return response.json();
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
    
    if (!response.ok) {
      throw new Error('Failed to save assessment');
    }
    
    return response.json();
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
    
    if (!response.ok) {
      throw new Error('Failed to submit assessment response');
    }
    
    return response.json();
  },

  // Get assessment responses for a candidate
  getAssessmentResponses: async (assessmentId, candidateId) => {
    const response = await fetch(`${BASE_URL}/${assessmentId}/responses/${candidateId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch assessment responses');
    }
    
    return response.json();
  }
};