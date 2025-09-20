export const JOB_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
};

export const CANDIDATE_STAGES = {
  APPLIED: 'applied',
  SCREEN: 'screen', 
  TECH: 'tech',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected'
};

export const CANDIDATE_STAGE_LABELS = {
  [CANDIDATE_STAGES.APPLIED]: 'Applied',
  [CANDIDATE_STAGES.SCREEN]: 'Screening',
  [CANDIDATE_STAGES.TECH]: 'Technical',
  [CANDIDATE_STAGES.OFFER]: 'Offer',
  [CANDIDATE_STAGES.HIRED]: 'Hired',
  [CANDIDATE_STAGES.REJECTED]: 'Rejected'
};

export const CANDIDATE_STAGE_COLORS = {
  [CANDIDATE_STAGES.APPLIED]: 'bg-blue-100 text-blue-800',
  [CANDIDATE_STAGES.SCREEN]: 'bg-yellow-100 text-yellow-800',
  [CANDIDATE_STAGES.TECH]: 'bg-purple-100 text-purple-800',
  [CANDIDATE_STAGES.OFFER]: 'bg-orange-100 text-orange-800',
  [CANDIDATE_STAGES.HIRED]: 'bg-green-100 text-green-800',
  [CANDIDATE_STAGES.REJECTED]: 'bg-red-100 text-red-800'
};

export const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  MULTI_CHOICE: 'multi_choice',
  SHORT_TEXT: 'short_text',
  LONG_TEXT: 'long_text',
  NUMERIC: 'numeric',
  FILE_UPLOAD: 'file_upload'
};

export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.SINGLE_CHOICE]: 'Single Choice',
  [QUESTION_TYPES.MULTI_CHOICE]: 'Multiple Choice',
  [QUESTION_TYPES.SHORT_TEXT]: 'Short Text',
  [QUESTION_TYPES.LONG_TEXT]: 'Long Text',
  [QUESTION_TYPES.NUMERIC]: 'Numeric',
  [QUESTION_TYPES.FILE_UPLOAD]: 'File Upload'
};

export const API_ENDPOINTS = {
  JOBS: '/api/jobs',
  CANDIDATES: '/api/candidates',
  ASSESSMENTS: '/api/assessments'
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
};

export const MOCK_USERS = [
  { id: 1, name: 'John Smith', email: 'john@company.com' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com' },
  { id: 3, name: 'Mike Davis', email: 'mike@company.com' },
  { id: 4, name: 'Emma Wilson', email: 'emma@company.com' },
  { id: 5, name: 'David Brown', email: 'david@company.com' }
];

export const JOB_TAGS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 
  'Java', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
  'Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps',
  'Senior', 'Mid-level', 'Junior', 'Remote', 'On-site'
];

export const DRAG_TYPES = {
  JOB: 'job',
  CANDIDATE: 'candidate'
};