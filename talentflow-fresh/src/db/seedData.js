import { db } from './index.js';
import { generateId, generateSlug } from '../utils/helpers.js';
import { JOB_TAGS, CANDIDATE_STAGES, QUESTION_TYPES } from '../utils/constants.js';

const jobTitles = [
  'Senior Frontend Developer',
  'Backend Engineer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'Mobile Developer',
  'Quality Assurance Engineer',
  'Technical Lead',
  'Software Architect',
  'Cloud Engineer',
  'Machine Learning Engineer',
  'Cybersecurity Specialist',
  'Database Administrator',
  'Frontend Developer',
  'Python Developer',
  'React Developer',
  'Node.js Developer',
  'Java Developer',
  'Marketing Manager',
  'Sales Representative',
  'HR Specialist',
  'Business Analyst',
  'Project Manager'
];

const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
  'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah',
  'Timothy', 'Dorothy', 'Ronald', 'Lisa', 'Jason', 'Nancy', 'Edward', 'Karen',
  'Jeffrey', 'Betty', 'Ryan', 'Helen', 'Jacob', 'Sandra', 'Gary', 'Donna',
  'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon', 'Stephen', 'Michelle',
  'Larry', 'Laura', 'Justin', 'Sarah', 'Scott', 'Kimberly', 'Brandon', 'Deborah'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'
];

const companies = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', '@company.com'];

const jobDescriptions = [
  'We are looking for an experienced professional to join our dynamic team and contribute to exciting projects.',
  'Join our growing company and help us build the next generation of innovative solutions.',
  'Seeking a passionate individual with strong technical skills and a collaborative mindset.',
  'Excellent opportunity to work with cutting-edge technologies and make a real impact.',
  'Be part of a team that values creativity, innovation, and professional growth.'
];

const requirements = [
  'Bachelor\'s degree in Computer Science or related field',
  '3+ years of relevant experience',
  'Strong problem-solving skills',
  'Excellent communication abilities',
  'Experience with modern development practices',
  'Team player with leadership potential'
];

const generateRandomJob = (index) => {
  const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
  const isArchived = Math.random() < 0.2; // 20% chance of being archived
  
  const randomTags = JOB_TAGS
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 5) + 2);
  
  return {
    id: generateId(),
    title,
    slug: generateSlug(title) + '-' + Date.now() + '-' + index,
    description: jobDescriptions[Math.floor(Math.random() * jobDescriptions.length)],
    requirements: requirements.slice(0, Math.floor(Math.random() * 4) + 2).join('\n• '),
    status: isArchived ? 'archived' : 'active',
    tags: randomTags,
    location: Math.random() > 0.5 ? 'Remote' : ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA'][Math.floor(Math.random() * 4)],
    department: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'][Math.floor(Math.random() * 5)],
    type: ['full-time', 'part-time', 'contract'][Math.floor(Math.random() * 3)],
    salary: {
      min: 60000 + Math.floor(Math.random() * 80000),
      max: 100000 + Math.floor(Math.random() * 100000),
      currency: 'USD'
    },
    order: index,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000), // Random date within last 90 days
    updatedAt: new Date()
  };
};

const generateRandomCandidate = (jobId, index) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${companies[Math.floor(Math.random() * companies.length)]}`;
  
  const stages = Object.values(CANDIDATE_STAGES);
  const stage = stages[Math.floor(Math.random() * stages.length)];
  
  const skills = JOB_TAGS
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 8) + 3);
  
  return {
    name,
    email,
    phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    jobId,
    stage,
    skills,
    experience: Math.floor(Math.random() * 15) + 1,
    location: ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA', 'Remote'][Math.floor(Math.random() * 5)],
    resume: `resume-${firstName.toLowerCase()}-${lastName.toLowerCase()}.pdf`,
    notes: Math.random() > 0.7 ? 'Initial screening completed. Strong technical background.' : '',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000), // Random date within last 60 days
    updatedAt: new Date()
  };
};

const generateCandidateTimeline = (candidateId, currentStage) => {
  const stages = Object.values(CANDIDATE_STAGES);
  const currentStageIndex = stages.indexOf(currentStage);
  const timeline = [];
  
  // Add initial application
  timeline.push({
    id: generateId(),
    candidateId,
    stage: CANDIDATE_STAGES.APPLIED,
    changedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    changedBy: 'system',
    notes: 'Application submitted'
  });
  
  // Add progression through stages
  for (let i = 1; i <= currentStageIndex && i < stages.length; i++) {
    timeline.push({
      id: generateId(),
      candidateId,
      stage: stages[i],
      changedAt: new Date(timeline[timeline.length - 1].changedAt.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
      changedBy: `user-${Math.floor(Math.random() * 5) + 1}`,
      notes: `Moved to ${stages[i]} stage`
    });
  }
  
  return timeline;
};

const generateAssessment = (jobId, assessmentTitle) => {
  const sections = [
    {
      id: generateId(),
      title: 'Technical Skills',
      description: 'Assess technical knowledge and problem-solving abilities',
      questions: [
        {
          id: generateId(),
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'What is your primary programming language?',
          required: true,
          options: [
            { id: generateId(), label: 'JavaScript', value: 'javascript' },
            { id: generateId(), label: 'Python', value: 'python' },
            { id: generateId(), label: 'Java', value: 'java' },
            { id: generateId(), label: 'C#', value: 'csharp' },
            { id: generateId(), label: 'Other', value: 'other' }
          ]
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.MULTI_CHOICE,
          title: 'Which of the following frameworks have you worked with?',
          required: true,
          options: [
            { id: generateId(), label: 'React', value: 'react' },
            { id: generateId(), label: 'Angular', value: 'angular' },
            { id: generateId(), label: 'Vue.js', value: 'vue' },
            { id: generateId(), label: 'Node.js', value: 'nodejs' },
            { id: generateId(), label: 'Express.js', value: 'express' }
          ]
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.NUMERIC,
          title: 'How many years of professional development experience do you have?',
          required: true,
          validation: { min: 0, max: 50 }
        }
      ]
    },
    {
      id: generateId(),
      title: 'Problem Solving',
      description: 'Evaluate analytical and problem-solving capabilities',
      questions: [
        {
          id: generateId(),
          type: QUESTION_TYPES.LONG_TEXT,
          title: 'Describe a challenging technical problem you solved recently and your approach to solving it.',
          required: true,
          validation: { minLength: 100, maxLength: 1000 }
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.SHORT_TEXT,
          title: 'What is your preferred debugging methodology?',
          required: false,
          validation: { maxLength: 200 }
        }
      ]
    },
    {
      id: generateId(),
      title: 'Additional Information',
      description: 'Tell us more about yourself',
      questions: [
        {
          id: generateId(),
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'Are you available for remote work?',
          required: true,
          options: [
            { id: generateId(), label: 'Yes, fully remote', value: 'yes' },
            { id: generateId(), label: 'Hybrid (remote + office)', value: 'hybrid' },
            { id: generateId(), label: 'No, office only', value: 'no' }
          ]
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.LONG_TEXT,
          title: 'Why are you interested in this position?',
          required: true,
          validation: { minLength: 50, maxLength: 500 },
          conditionalLogic: {
            dependsOn: 'availability', // This would need to be properly linked
            condition: 'equals',
            value: 'yes'
          }
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.FILE_UPLOAD,
          title: 'Please upload your portfolio or code samples (optional)',
          required: false
        }
      ]
    }
  ];

  return {
    id: generateId(),
    jobId,
    title: assessmentTitle,
    description: 'Complete this assessment to help us evaluate your qualifications for this position.',
    timeLimit: 60, // minutes
    sections,
    settings: {
      allowRetake: false,
      randomizeQuestions: false,
      showResults: false,
      passingScore: 70
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const seedDatabase = async () => {
  try {
    // Generate jobs
    console.log('Generating jobs...');
    const jobs = Array.from({ length: 25 }, (_, index) => generateRandomJob(index));
    await db.jobs.bulkAdd(jobs);
    
    // Generate candidates (40 per job on average, totaling 1000)
    console.log('Generating candidates...');
    const allCandidates = [];
    const allTimeline = [];
    
    for (const job of jobs) {
      const candidateCount = Math.floor(Math.random() * 30) + 25; // 25-55 candidates per job
      
      for (let i = 0; i < candidateCount; i++) {
        const candidate = generateRandomCandidate(job.id, allCandidates.length);
        allCandidates.push(candidate);
        
        // Generate timeline for this candidate
        const timeline = generateCandidateTimeline(candidate.id, candidate.stage);
        allTimeline.push(...timeline);
      }
    }
    
    // Ensure we have at least 1000 candidates
    while (allCandidates.length < 1000) {
      const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
      const candidate = generateRandomCandidate(randomJob.id, allCandidates.length);
      allCandidates.push(candidate);
      
      const timeline = generateCandidateTimeline(candidate.id, candidate.stage);
      allTimeline.push(...timeline);
    }
    
    await db.candidates.bulkAdd(allCandidates);
    await db.candidateTimeline.bulkAdd(allTimeline);
    
    // Generate assessments (3 per job type, focusing on first few jobs)
    console.log('Generating assessments...');
    const assessments = [];
    
    // Create 3 comprehensive assessments for the first 3 jobs
    for (let i = 0; i < 3; i++) {
      const job = jobs[i];
      const assessment = generateAssessment(job.id, `${job.title} Assessment`);
      assessments.push(assessment);
    }
    
    await db.assessments.bulkAdd(assessments);
    
    console.log(`Seeded database with:
      - ${jobs.length} jobs
      - ${allCandidates.length} candidates  
      - ${allTimeline.length} timeline entries
      - ${assessments.length} assessments`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};