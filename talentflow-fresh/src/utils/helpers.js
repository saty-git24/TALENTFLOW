import { format, formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { CANDIDATE_STAGES, HIRING_PROCESS_ORDER, STAGE_TRANSITIONS, TERMINAL_STAGES } from './constants';

export const cn = clsx;

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const truncateText = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const parseQueryString = (search) => {
  const params = new URLSearchParams(search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // Handle arrays by joining with commas
        if (value.length > 0) {
          searchParams.append(key, value.join(','));
        }
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  return searchParams.toString();
};

export const groupBy = (array, keyFn) => {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
};

export const sortBy = (array, keyFn, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = keyFn(a);
    const bValue = keyFn(b);
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterArray = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      const itemValue = item[key];
      if (typeof value === 'string') {
        return itemValue?.toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      return itemValue === value;
    });
  });
};

export const paginateArray = (array, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: array.slice(startIndex, endIndex),
    totalItems: array.length,
    currentPage: page,
    totalPages: Math.ceil(array.length / pageSize),
    hasNextPage: endIndex < array.length,
    hasPrevPage: page > 1
  };
};

export const reorderArray = (array, startIndex, endIndex) => {
  const result = Array.from(array);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Simplified network delay - no promises, just immediate execution with optional setTimeout
export const simulateNetworkDelay = (callback, min = 50, max = 200) => {
  // For development, execute immediately most of the time
  if (Math.random() < 0.9) { // 90% immediate execution
    callback();
  } else {
    // 10% chance of small delay for testing
    const delay = Math.random() * (max - min) + min;
    setTimeout(callback, delay);
  }
};

export const simulateKanbanDelay = (callback) => {
  // Kanban operations should always be immediate for best UX
  callback();
};

export const simulateNetworkError = (errorRate = 0.1) => {
  return Math.random() < errorRate;
};

export const createMention = (text, users) => {
  if (!text || !users?.length) return text;
  
  return text.replace(/@(\w+)/g, (match, username) => {
    const user = users.find(u => 
      u.name.toLowerCase().includes(username.toLowerCase()) ||
      u.email.toLowerCase().includes(username.toLowerCase())
    );
    
    if (user) {
      return `<span class="mention" data-user-id="${user.id}">@${user.name}</span>`;
    }
    
    return match;
  });
};

export const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

// Hiring Process Validation Functions

/**
 * Check if a stage transition is valid according to hiring process rules
 */
export const isValidStageTransition = (fromStage, toStage) => {
  // Can't transition from terminal stages
  if (TERMINAL_STAGES.includes(fromStage)) {
    return false;
  }
  
  // Check if transition is allowed
  const allowedTransitions = STAGE_TRANSITIONS[fromStage] || [];
  return allowedTransitions.includes(toStage);
};

/**
 * Get the next possible stages for a given current stage
 */
export const getNextPossibleStages = (currentStage) => {
  return STAGE_TRANSITIONS[currentStage] || [];
};

/**
 * Check if a stage can only move forward (not backward) in the hiring process
 */
export const isProgressiveStage = (fromStage, toStage) => {
  const fromIndex = HIRING_PROCESS_ORDER.indexOf(fromStage);
  const toIndex = HIRING_PROCESS_ORDER.indexOf(toStage);
  
  // Special case: can always reject from any stage
  if (toStage === CANDIDATE_STAGES.REJECTED) {
    return true;
  }
  
  // Normal progression should be forward only
  return toIndex > fromIndex;
};

/**
 * Get the stage order index for timeline sorting
 */
export const getStageOrderIndex = (stage) => {
  const index = HIRING_PROCESS_ORDER.indexOf(stage);
  // Rejected can happen at any stage, so we put it at the end for sorting
  if (stage === CANDIDATE_STAGES.REJECTED) {
    return HIRING_PROCESS_ORDER.length;
  }
  return index !== -1 ? index : 999;
};

/**
 * Sort timeline entries according to proper hiring process order
 */
export const sortTimelineByHiringProcess = (timelineEntries) => {
  return [...timelineEntries].sort((a, b) => {
    const aOrder = getStageOrderIndex(a.stage);
    const bOrder = getStageOrderIndex(b.stage);
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // If same stage order, sort by timestamp
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
};

/**
 * Validate candidate state consistency
 */
export const validateCandidateState = (candidate) => {
  const errors = [];
  
  // Check for impossible state combinations
  if (candidate.stage === CANDIDATE_STAGES.HIRED && 
      candidate.timeline?.some(entry => entry.stage === CANDIDATE_STAGES.REJECTED)) {
    errors.push("Candidate cannot be both hired and rejected");
  }
  
  if (candidate.stage === CANDIDATE_STAGES.REJECTED && 
      candidate.timeline?.some(entry => entry.stage === CANDIDATE_STAGES.HIRED)) {
    errors.push("Candidate cannot be both rejected and hired");
  }
  
  // Check timeline progression
  if (candidate.timeline) {
    const sortedTimeline = sortTimelineByHiringProcess(candidate.timeline);
    for (let i = 1; i < sortedTimeline.length; i++) {
      const prevStage = sortedTimeline[i - 1].stage;
      const currStage = sortedTimeline[i].stage;
      
      if (!isValidStageTransition(prevStage, currStage)) {
        errors.push(`Invalid stage transition from ${prevStage} to ${currStage}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};