import { z } from 'zod';

// Job validation schemas
export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
  tags: z.array(z.string()).default([]),
  location: z.string().optional(),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD')
  }).optional(),
  department: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'intern']).default('full-time')
});

// Candidate validation schemas
export const candidateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  resume: z.string().optional(),
  jobId: z.string().min(1, 'Job ID is required'),
  stage: z.enum(['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']).default('applied'),
  notes: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.number().min(0).optional(),
  location: z.string().optional()
});

export const candidateNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  authorId: z.string().min(1, 'Author ID is required'),
  mentions: z.array(z.string()).default([])
});

// Assessment validation schemas
export const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['single_choice', 'multi_choice', 'short_text', 'long_text', 'numeric', 'file_upload']),
  title: z.string().min(1, 'Question title is required'),
  description: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.string()
  })).optional(),
  validation: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional()
  }).optional(),
  conditionalLogic: z.object({
    dependsOn: z.string().optional(),
    condition: z.enum(['equals', 'not_equals', 'contains', 'not_contains']).optional(),
    value: z.string().optional()
  }).optional()
});

export const assessmentSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Section title is required'),
  description: z.string().optional(),
  questions: z.array(questionSchema).default([])
});

export const assessmentSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  title: z.string().min(1, 'Assessment title is required'),
  description: z.string().optional(),
  timeLimit: z.number().min(1).optional(),
  sections: z.array(assessmentSectionSchema).default([]),
  settings: z.object({
    allowRetake: z.boolean().default(false),
    randomizeQuestions: z.boolean().default(false),
    showResults: z.boolean().default(false),
    passingScore: z.number().min(0).max(100).optional()
  }).default({})
});

export const assessmentResponseSchema = z.object({
  questionId: z.string().min(1),
  value: z.union([
    z.string(),
    z.array(z.string()),
    z.number()
  ]),
  timeSpent: z.number().min(0).optional()
});

export const assessmentSubmissionSchema = z.object({
  assessmentId: z.string().min(1),
  candidateId: z.string().min(1),
  responses: z.array(assessmentResponseSchema),
  startedAt: z.date(),
  submittedAt: z.date(),
  timeSpent: z.number().min(0)
});

// Validation helper functions
export const validateJob = (data) => {
  try {
    return { success: true, data: jobSchema.parse(data), errors: null };
  } catch (error) {
    return { success: false, data: null, errors: error.errors };
  }
};

export const validateCandidate = (data) => {
  try {
    return { success: true, data: candidateSchema.parse(data), errors: null };
  } catch (error) {
    return { success: false, data: null, errors: error.errors };
  }
};

export const validateAssessment = (data) => {
  try {
    return { success: true, data: assessmentSchema.parse(data), errors: null };
  } catch (error) {
    return { success: false, data: null, errors: error.errors };
  }
};

export const validateQuestion = (data) => {
  try {
    return { success: true, data: questionSchema.parse(data), errors: null };
  } catch (error) {
    return { success: false, data: null, errors: error.errors };
  }
};

export const validateAssessmentResponse = (questionType, value, validation = {}) => {
  const errors = [];

  if (!value && validation.required) {
    errors.push('This field is required');
    return errors;
  }

  if (!value) return errors;

  switch (questionType) {
    case 'short_text':
    case 'long_text':
      if (typeof value !== 'string') {
        errors.push('Value must be a string');
        break;
      }
      
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`Minimum length is ${validation.minLength} characters`);
      }
      
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`Maximum length is ${validation.maxLength} characters`);
      }
      
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push('Value does not match required format');
        }
      }
      break;

    case 'numeric':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push('Value must be a number');
        break;
      }
      
      if (validation.min !== undefined && numValue < validation.min) {
        errors.push(`Minimum value is ${validation.min}`);
      }
      
      if (validation.max !== undefined && numValue > validation.max) {
        errors.push(`Maximum value is ${validation.max}`);
      }
      break;

    case 'single_choice':
      if (typeof value !== 'string') {
        errors.push('Please select one option');
      }
      break;

    case 'multi_choice':
      if (!Array.isArray(value)) {
        errors.push('Please select at least one option');
      } else if (value.length === 0 && validation.required) {
        errors.push('Please select at least one option');
      }
      break;

    case 'file_upload':
      // For now, just check if a filename is provided
      if (typeof value !== 'string' || !value.trim()) {
        errors.push('Please upload a file');
      }
      break;
  }

  return errors;
};

export const checkConditionalLogic = (question, allResponses) => {
  if (!question.conditionalLogic?.dependsOn) {
    return true; // Always show if no conditions
  }

  const dependentResponse = allResponses[question.conditionalLogic.dependsOn];
  if (!dependentResponse) {
    return false; // Hide if dependent question not answered
  }

  const { condition, value: conditionValue } = question.conditionalLogic;
  const responseValue = dependentResponse.value;

  switch (condition) {
    case 'equals':
      return responseValue === conditionValue;
    case 'not_equals':
      return responseValue !== conditionValue;
    case 'contains':
      if (Array.isArray(responseValue)) {
        return responseValue.includes(conditionValue);
      }
      return String(responseValue).toLowerCase().includes(String(conditionValue).toLowerCase());
    case 'not_contains':
      if (Array.isArray(responseValue)) {
        return !responseValue.includes(conditionValue);
      }
      return !String(responseValue).toLowerCase().includes(String(conditionValue).toLowerCase());
    default:
      return true;
  }
};