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

// Hooks for automatic timestamps
db.jobs.hook('creating', function (primKey, obj, trans) {
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});

db.jobs.hook('updating', function (modifications, primKey, obj, trans) {
  modifications.updatedAt = new Date();
});

db.candidates.hook('creating', function (primKey, obj, trans) {
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});

db.candidates.hook('updating', function (modifications, primKey, obj, trans) {
  modifications.updatedAt = new Date();
});

db.assessments.hook('creating', function (primKey, obj, trans) {
  obj.createdAt = new Date();
  obj.updatedAt = new Date();
});

db.assessments.hook('updating', function (modifications, primKey, obj, trans) {
  modifications.updatedAt = new Date();
});

db.candidateNotes.hook('creating', function (primKey, obj, trans) {
  obj.createdAt = new Date();
});

db.candidateTimeline.hook('creating', function (primKey, obj, trans) {
  obj.changedAt = new Date();
});

export const initializeDatabase = async () => {
  try {
    await db.open();
    
    // Check if we need to seed the database
    const jobCount = await db.jobs.count();
    if (jobCount === 0) {
      console.log('Seeding database with initial data...');
      await seedDatabase();
      console.log('Database seeded successfully');
    }
    
    console.log('Database initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const clearDatabase = async () => {
  try {
    await db.delete();
    await db.open();
    await seedDatabase();
    console.log('Database cleared and reseeded');
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw error;
  }
};

export const exportData = async () => {
  try {
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
    console.error('Failed to export data:', error);
    throw error;
  }
};

export const importData = async (data) => {
  try {
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
    
    console.log('Data imported successfully');
  } catch (error) {
    console.error('Failed to import data:', error);
    throw error;
  }
};