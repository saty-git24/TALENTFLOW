import Dexie from 'dexie';
import { seedDatabase } from './seedData.js';

export const db = new Dexie('TalentFlowDB');

// Define schemas
db.version(1).stores({
  jobs: '++id, title, slug, status, createdAt, updatedAt, order',
  candidates: '++id, name, email, jobId, stage, createdAt, updatedAt',
  candidateTimeline: '++id, candidateId, stage, changedAt, changedBy, notes',
  candidateNotes: '++id, candidateId, content, authorId, createdAt, mentions',
  assessments: '++id, jobId, title, createdAt, updatedAt',
  assessmentResponses: '++id, assessmentId, candidateId, responses, submittedAt'
});

// Artificial latency and error simulation
const simulateLatencyAndErrors = async (operation = 'write') => {
  // Disable database-level latency since we have it in Mock API layer
  // const latency = Math.floor(Math.random() * 1000) + 200;
  // await new Promise(resolve => setTimeout(resolve, latency));
  
  // Temporarily disable error simulation to test UI flow
  // Keep error simulation for write operations (5-10% error rate)
  if (false && operation === 'write') { // Disabled for now
    const errorRate = Math.random();
    if (errorRate < 0.075) { // 7.5% error rate (middle of 5-10%)
      const errorMessages = [
        'Network timeout occurred',
        'Database connection lost',
        'Validation failed: Invalid data format',
        'Server temporarily unavailable',
        'Resource conflict detected',
        'Permission denied'
      ];
      const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      throw new Error(`Simulated Error: ${randomError}`);
    }
  }
};

// Enhanced hooks with latency and error simulation - DISABLED FOR DEVELOPMENT
db.jobs.hook('creating', function (primKey, obj, trans) {
  // Removed async since we're not doing any async operations
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});

db.jobs.hook('updating', function (modifications, primKey, obj, trans) {
  // Removed async since we're not doing any async operations
  modifications.updatedAt = new Date();
});

db.candidates.hook('creating', function (primKey, obj, trans) {
  // Removed async since we're not doing any async operations
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});

db.candidates.hook('updating', function (modifications, primKey, obj, trans) {
  // Removed async since we're not doing any async operations
  modifications.updatedAt = new Date();
});

db.assessments.hook('creating', function (primKey, obj, trans) {
  // await simulateLatencyAndErrors(); // DISABLED
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});

db.assessments.hook('updating', function (modifications, primKey, obj, trans) {
  // await simulateLatencyAndErrors(); // DISABLED
  modifications.updatedAt = new Date();
});

db.candidateNotes.hook('creating', function (primKey, obj, trans) {
  // await simulateLatencyAndErrors(); // DISABLED
  obj.createdAt = new Date();
});

db.candidateTimeline.hook('creating', function (primKey, obj, trans) {
  // await simulateLatencyAndErrors(); // DISABLED
  obj.changedAt = new Date();
});

db.assessmentResponses.hook('creating', function (primKey, obj, trans) {
  // await simulateLatencyAndErrors(); // DISABLED
  obj.submittedAt = obj.submittedAt || new Date();
});

export const initializeDatabase = async () => {
  try {
    await db.open();
    
    // Check if we need to seed the database
    const jobCount = await db.jobs.count();
    if (jobCount === 0) {
      await seedDatabase();
    }
    
  } catch (error) {
    throw error;
  }
};

export const clearDatabase = async () => {
  try {
    
    // Clear all tables with simulated latency
    // await simulateLatencyAndErrors(); // DISABLED
    await db.transaction('rw', db.jobs, db.candidates, db.candidateTimeline, db.candidateNotes, db.assessments, db.assessmentResponses, async () => {
      await db.jobs.clear();
      await db.candidates.clear();
      await db.candidateTimeline.clear();
      await db.candidateNotes.clear();
      await db.assessments.clear();
      await db.assessmentResponses.clear();
    });
    
    // Also clear localStorage to remove any Zustand persisted data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('assessment') || key.includes('candidates') || key.includes('jobs')) {
        localStorage.removeItem(key);
      }
    });
    
    
    // Reseed the database
    await seedDatabase();
  } catch (error) {
    throw error;
  }
};

export const exportData = async () => {
  try {
    // Add latency for read operation (lighter latency)
    const latency = Math.floor(Math.random() * 300) + 100;
    await new Promise(resolve => setTimeout(resolve, latency));
    
    const data = {
      jobs: await db.jobs.toArray(),
      candidates: await db.candidates.toArray(),
      candidateTimeline: await db.candidateTimeline.toArray(),
      candidateNotes: await db.candidateNotes.toArray(),
      assessments: await db.assessments.toArray(),
      assessmentResponses: await db.assessmentResponses.toArray(),
      exportedAt: new Date().toISOString()
    };
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const importData = async (data) => {
  try {
    // await simulateLatencyAndErrors(); // DISABLED
    
    await db.transaction('rw', db.jobs, db.candidates, db.candidateTimeline, db.candidateNotes, db.assessments, db.assessmentResponses, async () => {
      // Clear existing data
      await db.jobs.clear();
      await db.candidates.clear();
      await db.candidateTimeline.clear();
      await db.candidateNotes.clear();
      await db.assessments.clear();
      await db.assessmentResponses.clear();
      
      // Import new data
      if (data.jobs?.length) await db.jobs.bulkAdd(data.jobs);
      if (data.candidates?.length) await db.candidates.bulkAdd(data.candidates);
      if (data.candidateTimeline?.length) await db.candidateTimeline.bulkAdd(data.candidateTimeline);
      if (data.candidateNotes?.length) await db.candidateNotes.bulkAdd(data.candidateNotes);
      if (data.assessments?.length) await db.assessments.bulkAdd(data.assessments);
      if (data.assessmentResponses?.length) await db.assessmentResponses.bulkAdd(data.assessmentResponses);
    });
    
  } catch (error) {
    throw error;
  }
};

// Enhanced API methods with latency and error simulation
export const dbAPI = {
  // Jobs API
  createJob(jobData) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.jobs.add(jobData);
  },
  
  updateJob(id, updates) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.jobs.update(id, updates);
  },
  
  deleteJob(id) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.jobs.delete(id);
  },
  
  getJobs() {
    // Latency simulation moved to mock API layer
    return db.jobs.toArray();
  },
  
  // Candidates API
  createCandidate(candidateData) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.candidates.add(candidateData);
  },
  
  updateCandidate(id, updates) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.candidates.update(id, updates);
  },
  
  deleteCandidate(id) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.candidates.delete(id);
  },
  
  getCandidates() {
    // Latency simulation moved to mock API layer
    return db.candidates.toArray();
  },
  
  // Assessments API
  createAssessment(assessmentData) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.assessments.add(assessmentData);
  },
  
  updateAssessment(id, updates) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.assessments.update(id, updates);
  },
  
  deleteAssessment(id) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.assessments.delete(id);
  },
  
  getAssessments() {
    // Latency simulation moved to mock API layer
    return db.assessments.toArray();
  },
  
  // Notes API
  createNote(noteData) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.candidateNotes.add(noteData);
  },
  
  updateNote(id, updates) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.candidateNotes.update(id, updates);
  },
  
  deleteNote(id) {
    // await simulateLatencyAndErrors(); // DISABLED
    return db.candidateNotes.delete(id);
  }
};
