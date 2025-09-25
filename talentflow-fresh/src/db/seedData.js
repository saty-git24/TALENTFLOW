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
  // For first 3 jobs, use completely deterministic data
  if (index < 3) {
    const firstThreeJobs = [
      {
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        status: 'active',
        location: 'San Francisco, CA',
        type: 'full-time',
        salary: { min: 120000, max: 160000, currency: 'USD' },
        tags: ['React', 'JavaScript', 'Frontend']
      },
      {
        title: 'Python Developer',
        department: 'Engineering', 
        status: 'active',
        location: 'Remote',
        type: 'full-time',
        salary: { min: 110000, max: 150000, currency: 'USD' },
        tags: ['Python', 'Backend', 'API']
      },
      {
        title: 'React Developer',
        department: 'Engineering',
        status: 'active', 
        location: 'New York, NY',
        type: 'full-time',
        salary: { min: 115000, max: 155000, currency: 'USD' },
        tags: ['React', 'JavaScript', 'Frontend']
      }
    ];
    
    const jobData = firstThreeJobs[index];
    
    return {
      id: generateId(),
      title: jobData.title,
      slug: generateSlug(jobData.title) + '-' + Date.now() + '-' + index,
      description: jobDescriptions[0], // Use first description consistently
      requirements: requirements.slice(0, 3).join('\n• '),
      status: jobData.status,
      tags: jobData.tags,
      location: jobData.location,
      department: jobData.department,
      type: jobData.type,
      salary: jobData.salary,
      order: index,
      createdAt: new Date(Date.now() - index * 60 * 1000), // Sequential timestamps
      updatedAt: new Date()
    };
  }
  
  // For remaining jobs, use random generation as before
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
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000), // Random dates for non-priority jobs
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
    id: generateId(),
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

const generateComprehensiveAssessment = (jobId, jobTitle, index) => {
  // Use the actual job title for each assessment
  const assessmentTitle = `${jobTitle} - Technical Assessment`;
  
  // Create timestamp with offset to ensure proper ordering (index * 1000ms apart)
  const baseTime = new Date();
  const createdAt = new Date(baseTime.getTime() + (index * 1000));
  const updatedAt = new Date(createdAt.getTime());
  
  // Generate 10+ questions across multiple sections
  const sections = [
    {
      id: generateId(),
      title: 'Technical Skills & Experience',
      description: 'Assess technical knowledge and professional background',
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
            { id: generateId(), label: 'TypeScript', value: 'typescript' },
            { id: generateId(), label: 'Other', value: 'other' }
          ]
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.MULTI_CHOICE,
          title: 'Which frameworks and technologies have you worked with? (Select all that apply)',
          required: true,
          options: [
            { id: generateId(), label: 'React', value: 'react' },
            { id: generateId(), label: 'Angular', value: 'angular' },
            { id: generateId(), label: 'Vue.js', value: 'vue' },
            { id: generateId(), label: 'Node.js', value: 'nodejs' },
            { id: generateId(), label: 'Express.js', value: 'express' },
            { id: generateId(), label: 'Django', value: 'django' },
            { id: generateId(), label: 'Spring Boot', value: 'spring' },
            { id: generateId(), label: 'Laravel', value: 'laravel' }
          ]
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.NUMERIC,
          title: 'How many years of professional development experience do you have?',
          required: true,
          validation: { min: 0, max: 50 }
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'What is your experience level with cloud platforms?',
          required: true,
          options: [
            { id: generateId(), label: 'Expert - 5+ years', value: 'expert' },
            { id: generateId(), label: 'Intermediate - 2-5 years', value: 'intermediate' },
            { id: generateId(), label: 'Beginner - Less than 2 years', value: 'beginner' },
            { id: generateId(), label: 'No experience', value: 'none' }
          ]
        }
      ]
    },
    {
      id: generateId(),
      title: 'Problem Solving & Analysis',
      description: 'Evaluate analytical and problem-solving capabilities',
      questions: [
        {
          id: generateId(),
          type: QUESTION_TYPES.LONG_TEXT,
          title: 'Describe a challenging technical problem you solved recently and your approach to solving it. Include the technologies used and the outcome.',
          required: true,
          validation: { minLength: 100, maxLength: 1000 }
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.SHORT_TEXT,
          title: 'What is your preferred debugging methodology when facing complex issues?',
          required: true,
          validation: { maxLength: 300 }
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'When working on a team project, how do you typically approach code reviews?',
          required: true,
          options: [
            { id: generateId(), label: 'Focus on functionality and bugs', value: 'functionality' },
            { id: generateId(), label: 'Emphasize code quality and standards', value: 'quality' },
            { id: generateId(), label: 'Balance between functionality and maintainability', value: 'balanced' },
            { id: generateId(), label: 'Minimal review, trust team members', value: 'minimal' }
          ]
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.MULTI_CHOICE,
          title: 'Which testing approaches do you regularly use? (Select all that apply)',
          required: false,
          options: [
            { id: generateId(), label: 'Unit Testing', value: 'unit' },
            { id: generateId(), label: 'Integration Testing', value: 'integration' },
            { id: generateId(), label: 'End-to-End Testing', value: 'e2e' },
            { id: generateId(), label: 'Test-Driven Development (TDD)', value: 'tdd' },
            { id: generateId(), label: 'Behavior-Driven Development (BDD)', value: 'bdd' },
            { id: generateId(), label: 'Manual Testing', value: 'manual' }
          ]
        }
      ]
    },
    {
      id: generateId(),
      title: 'Communication & Team Collaboration',
      description: 'Assess soft skills and team dynamics',
      questions: [
        {
          id: generateId(),
          type: QUESTION_TYPES.LONG_TEXT,
          title: 'Describe a situation where you had to explain a complex technical concept to a non-technical stakeholder. How did you approach it?',
          required: true,
          validation: { minLength: 80, maxLength: 600 }
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'How do you prefer to receive feedback on your work?',
          required: true,
          options: [
            { id: generateId(), label: 'Regular one-on-one meetings', value: 'meetings' },
            { id: generateId(), label: 'Written feedback via email/slack', value: 'written' },
            { id: generateId(), label: 'Real-time during code reviews', value: 'realtime' },
            { id: generateId(), label: 'Formal quarterly reviews', value: 'formal' }
          ]
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.SHORT_TEXT,
          title: 'What motivates you most in your professional work?',
          required: true,
          validation: { maxLength: 250 }
        }
      ]
    },
    {
      id: generateId(),
      title: 'Role-Specific & Additional Information',
      description: 'Position-specific questions and final details',
      questions: [
        {
          id: generateId(),
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'What is your preferred work arrangement?',
          required: true,
          options: [
            { id: generateId(), label: 'Fully remote', value: 'remote' },
            { id: generateId(), label: 'Hybrid (2-3 days in office)', value: 'hybrid' },
            { id: generateId(), label: 'Mostly in-office with occasional remote', value: 'office-flexible' },
            { id: generateId(), label: 'Fully in-office', value: 'office' }
          ]
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.LONG_TEXT,
          title: 'Why are you interested in this specific position and our company? What attracts you to this opportunity?',
          required: true,
          validation: { minLength: 100, maxLength: 800 }
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.NUMERIC,
          title: 'What is your expected salary range (in USD thousands)? Please enter the minimum you would accept.',
          required: false,
          validation: { min: 30, max: 500 }
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.SINGLE_CHOICE,
          title: 'How soon would you be available to start if selected?',
          required: true,
          options: [
            { id: generateId(), label: 'Immediately', value: 'immediate' },
            { id: generateId(), label: 'Within 2 weeks', value: '2weeks' },
            { id: generateId(), label: '1 month notice period', value: '1month' },
            { id: generateId(), label: '2 months or more', value: '2months' }
          ]
        },
        {
          id: generateId(),
          type: QUESTION_TYPES.FILE_UPLOAD,
          title: 'Please upload your portfolio, code samples, or any relevant work examples (optional)',
          required: false
        }
      ]
    }
  ];

  return {
    id: generateId(),
    jobId,
    title: assessmentTitle, // Use the specific job title
    description: `Complete this comprehensive assessment to help us evaluate your qualifications for the ${jobTitle} position. This assessment covers technical skills, problem-solving abilities, and team collaboration.`,
    timeLimit: 90, // minutes
    sections,
    settings: {
      allowRetake: false,
      randomizeQuestions: true,
      showResults: false,
      passingScore: 75,
      questionsPerSection: sections.map(s => s.questions.length),
      totalQuestions: sections.reduce((total, section) => total + section.questions.length, 0)
    },
    createdAt: createdAt,
    updatedAt: updatedAt
  };
};

export const seedDatabase = async () => {
  try {
    
    // Clear existing data first (with proper transaction handling)
    await db.transaction('rw', db.jobs, db.candidates, db.candidateTimeline, db.candidateNotes, db.assessments, db.assessmentResponses, async () => {
      await db.jobs.clear();
      await db.candidates.clear();
      await db.candidateTimeline.clear();
      await db.candidateNotes.clear();
      await db.assessments.clear();
      await db.assessmentResponses.clear();
    });
    
    // Generate and insert 50 jobs (mixed active/archived)
    const jobs = Array.from({ length: 50 }, (_, index) => generateRandomJob(index));
    await db.jobs.bulkAdd(jobs);
    
    // Generate 1,000 candidates with guaranteed candidates for first 3 jobs
    const allCandidates = [];
    const allTimeline = [];
    
    // First, ensure each of the first 3 jobs gets at least 5-10 candidates
    for (let jobIndex = 0; jobIndex < 3; jobIndex++) {
      const job = jobs[jobIndex];
      const candidatesForThisJob = 5 + Math.floor(Math.random() * 6); // 5-10 candidates
      
      for (let c = 0; c < candidatesForThisJob; c++) {
        const candidate = generateRandomCandidate(job.id, allCandidates.length);
        allCandidates.push(candidate);
        
        // Generate timeline for this candidate
        const timeline = generateCandidateTimeline(candidate.id, candidate.stage);
        allTimeline.push(...timeline);
      }
    }
    
    // Then generate remaining candidates for all jobs (including the first 3)
    const remainingCandidates = 1000 - allCandidates.length;
    for (let i = 0; i < remainingCandidates; i++) {
      const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
      const candidate = generateRandomCandidate(randomJob.id, allCandidates.length);
      allCandidates.push(candidate);
      
      // Generate timeline for this candidate
      const timeline = generateCandidateTimeline(candidate.id, candidate.stage);
      allTimeline.push(...timeline);
    }
    
    await db.candidates.bulkAdd(allCandidates);
    await db.candidateTimeline.bulkAdd(allTimeline);
    
    // Select first 3 jobs and create comprehensive assessments for them
    const selectedJobs = jobs.slice(0, 3); // Take first 3 jobs instead of random selection
    
    const assessments = [];
    for (let i = 0; i < 3; i++) {
      const job = selectedJobs[i];
      const assessment = generateComprehensiveAssessment(job.id, job.title, i);
      assessments.push(assessment);
    }
    
    await db.assessments.bulkAdd(assessments);
  } catch (error) {
    throw error;
  }
};
    
    
