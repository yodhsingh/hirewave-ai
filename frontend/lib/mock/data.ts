import { faker } from '@faker-js/faker';
import type {
  Job,
  Candidate,
  Question,
  CandidateStatus,
  JobStatus,
  RoleType,
  InterviewResponse,
  Score,
  Invite,
  User,
  Role,
} from '@/types';

// Set seed for consistent data during development
faker.seed(123);

// Helper function to generate IDs
const generateId = () => faker.string.uuid();

// Generate mock users
export const generateUser = (role: Role = 'hr'): User => ({
  id: generateId(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role,
  companyId: role === 'hr' ? generateId() : undefined,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

// Generate mock questions
const generateQuestions = (count: number = 5): Question[] => {
  const questionTemplates = [
    {
      type: 'phone' as const,
      prompts: [
        'AI will conduct a comprehensive technical screening call covering your experience and skills',
        'AI phone interview to assess your problem-solving abilities and technical knowledge',
        'Automated phone screening to discuss your background and project experience',
      ],
      timeLimit: 900, // 15 minutes for phone interviews
    },
    {
      type: 'video' as const,
      prompts: [
        'Tell us about yourself and your experience',
        'Why are you interested in this position?',
        'Describe a challenging project you worked on',
        'What are your greatest strengths?',
        'Where do you see yourself in 5 years?',
      ],
      timeLimit: 120,
    },
    {
      type: 'text' as const,
      prompts: [
        'What makes you a good fit for this role?',
        'Describe your ideal work environment',
        'How do you handle tight deadlines?',
        'What motivates you in your work?',
      ],
      maxLength: 500,
    },
    {
      type: 'multiple_choice' as const,
      prompts: [
        'What is your preferred work style?',
        'How many years of relevant experience do you have?',
      ],
    },
  ];

  const questions: Question[] = [];

  // Always add a phone interview as the first question
  const phoneTemplate = questionTemplates.find(t => t.type === 'phone')!;
  questions.push({
    id: generateId(),
    type: 'phone',
    question: faker.helpers.arrayElement(phoneTemplate.prompts),
    description: 'AI-powered technical screening call',
    timeLimit: phoneTemplate.timeLimit,
    required: true,
    order: 0,
    scoreWeight: 10,
  });

  // Add remaining questions
  for (let i = 1; i < count; i++) {
    const template = faker.helpers.arrayElement(questionTemplates);
    const prompt = faker.helpers.arrayElement(template.prompts);

    questions.push({
      id: generateId(),
      type: template.type,
      question: prompt,
      description: faker.lorem.sentence(),
      timeLimit: template.type === 'video' ? template.timeLimit : undefined,
      maxLength: template.type === 'text' ? template.maxLength : undefined,
      options: template.type === 'multiple_choice'
        ? ['Option A', 'Option B', 'Option C', 'Option D']
        : undefined,
      required: i <= 3, // First few questions are required
      order: i,
      scoreWeight: faker.number.int({ min: 1, max: 10 }),
    });
  }

  return questions;
};

// Tech job titles relevant to data science and software engineering
const JOB_TITLES = [
  // Software Engineering
  'Senior Software Engineer',
  'Full Stack Developer',
  'Backend Engineer',
  'Frontend Developer',
  'DevOps Engineer',
  'Site Reliability Engineer (SRE)',
  'Cloud Solutions Architect',
  'Mobile App Developer',
  'Software Development Manager',

  // Data Science & AI
  'Data Scientist',
  'Senior Data Scientist',
  'Machine Learning Engineer',
  'AI/ML Research Engineer',
  'Data Analyst',
  'Business Intelligence Analyst',
  'Data Engineer',
  'MLOps Engineer',
  'Computer Vision Engineer',
  'NLP Engineer',

  // Data & Analytics
  'Data Architect',
  'Big Data Engineer',
  'Analytics Lead',
  'Quantitative Analyst',
  'Data Platform Engineer',

  // Management & Leadership
  'Technical Project Manager',
  'Product Manager - AI/ML',
  'Engineering Manager',
  'Technical Program Manager',
  'Scrum Master',
  'Agile Coach',

  // Specialized Roles
  'Blockchain Developer',
  'Security Engineer',
  'QA Automation Engineer',
  'Performance Engineer',
  'Research Scientist',
];

// Generate mock jobs
export const generateJob = (status: JobStatus = 'active'): Job => {
  const createdDate = faker.date.past({ years: 1 });
  const totalCandidates = faker.number.int({ min: 50, max: 500 });

  const stats = {
    total: totalCandidates,
    invited: totalCandidates,
    started: Math.floor(totalCandidates * 0.8),
    inProgress: Math.floor(totalCandidates * 0.1),
    submitted: Math.floor(totalCandidates * 0.6),
    scored: Math.floor(totalCandidates * 0.5),
    shortlisted: Math.floor(totalCandidates * 0.15),
    rejected: Math.floor(totalCandidates * 0.35),
  };

  const indianCities = ['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Remote', 'Gurugram', 'Noida'];

  const selectedTitle = faker.helpers.arrayElement(JOB_TITLES);

  // Generate relevant job descriptions based on title
  const jobDescriptions: Record<string, string> = {
    'Data Scientist': 'We are looking for a talented Data Scientist to join our team. You will be responsible for collecting, analyzing, and interpreting large datasets to help drive business decisions. You will work closely with cross-functional teams to implement machine learning models and create data-driven solutions.',
    'Senior Software Engineer': 'Join our engineering team as a Senior Software Engineer where you will design, develop, and maintain scalable software solutions. You will mentor junior developers, participate in architecture decisions, and ensure code quality through best practices.',
    'Machine Learning Engineer': 'We seek an ML Engineer to build and deploy production-ready machine learning systems. You will work on developing algorithms, optimizing model performance, and creating end-to-end ML pipelines using modern MLOps practices.',
    'DevOps Engineer': 'As a DevOps Engineer, you will be responsible for building and maintaining CI/CD pipelines, managing cloud infrastructure, and ensuring system reliability. Experience with Docker, Kubernetes, and cloud platforms is essential.',
    'Data Engineer': 'We need a Data Engineer to design and build robust data pipelines. You will work with big data technologies, create ETL processes, and ensure data quality and availability for analytics teams.',
    'Product Manager - AI/ML': 'Lead our AI/ML product initiatives as a Product Manager. You will define product strategy, work with data science teams, and drive the development of innovative AI-powered features.',
  };

  // Generate relevant requirements based on role type
  const techRequirements = [
    '3+ years of experience in software development',
    'Strong problem-solving and analytical skills',
    'Experience with cloud platforms (AWS/Azure/GCP)',
    'Proficiency in Python, Java, or similar languages',
    'Understanding of data structures and algorithms',
    'Experience with Agile/Scrum methodologies',
    'Strong communication and collaboration skills',
    'Bachelor\'s degree in Computer Science or related field',
    'Experience with version control systems (Git)',
    'Knowledge of microservices architecture',
  ];

  const dataRequirements = [
    'Strong background in statistics and mathematics',
    'Experience with machine learning frameworks (TensorFlow/PyTorch)',
    'Proficiency in SQL and data manipulation',
    'Experience with big data tools (Spark, Hadoop)',
    'Knowledge of data visualization tools',
    'Understanding of A/B testing and experimentation',
  ];

  const description = jobDescriptions[selectedTitle] ||
    `We are seeking a talented ${selectedTitle} to join our growing team. This role involves working on cutting-edge technology projects, collaborating with cross-functional teams, and contributing to innovative solutions. You will have the opportunity to work with modern tech stack and make a significant impact on our products.`;

  const requirements = selectedTitle.includes('Data') || selectedTitle.includes('ML') || selectedTitle.includes('AI')
    ? faker.helpers.arrayElements([...techRequirements, ...dataRequirements], faker.number.int({ min: 4, max: 7 }))
    : faker.helpers.arrayElements(techRequirements, faker.number.int({ min: 4, max: 6 }));

  return {
    id: generateId(),
    title: selectedTitle,
    description,
    department: faker.helpers.arrayElement(['Engineering', 'Data Science', 'Product', 'Operations', 'Research']),
    location: faker.helpers.arrayElement(indianCities),
    roleType: faker.helpers.arrayElement<RoleType>(['Engineering', 'Design', 'Sales', 'Marketing', 'Operations', 'Other']),
    companyId: generateId(),
    createdBy: generateId(),
    questions: generateQuestions(faker.number.int({ min: 3, max: 8 })),
    requirements,
    status,
    createdAt: createdDate,
    updatedAt: faker.date.between({ from: createdDate, to: new Date() }),
    closedAt: status === 'closed' ? faker.date.recent() : undefined,
    stats,
  };
};

// Core team members and additional Indian names
const CANDIDATE_NAMES = [
  // Core team members (IIT Madras students)
  { name: 'Hiya Syal', email: '23f3003216@ds.study.iitm.ac.in' },
  { name: 'Parmeet Singh', email: '22f1000535@ds.study.iitm.ac.in' },
  { name: 'Shubham Tiwari', email: '22f1001934@ds.study.iitm.ac.in' },
  { name: 'Akshit Mittal', email: '23f2004636@ds.study.iitm.ac.in' },
  { name: 'Ravina', email: '21f2001128@ds.study.iitm.ac.in' },
  { name: 'Sidhaarth Shree', email: '22f3001480@ds.study.iitm.ac.in' },
  { name: 'Dalyodh Singh', email: '22f3001166@ds.study.iitm.ac.in' },
  { name: 'Akash Kumar', email: '22f2000946@ds.study.iitm.ac.in' },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com' },
  { name: 'Rohit Verma', email: 'rohit.verma@example.com' },
  { name: 'Ananya Gupta', email: 'ananya.gupta@example.com' },
  { name: 'Arjun Reddy', email: 'arjun.reddy@example.com' },
  { name: 'Neha Patel', email: 'neha.patel@example.com' },
  { name: 'Vikram Singh', email: 'vikram.singh@example.com' },
  { name: 'Deepika Nair', email: 'deepika.nair@example.com' },
  { name: 'Aditya Joshi', email: 'aditya.joshi@example.com' },
  { name: 'Kavya Rao', email: 'kavya.rao@example.com' },
  { name: 'Suresh Kumar', email: 'suresh.kumar@example.com' },
  { name: 'Anjali Mehta', email: 'anjali.mehta@example.com' },
  { name: 'Rahul Kapoor', email: 'rahul.kapoor@example.com' },
  // Mix with some international names
  { name: 'Sarah Johnson', email: 'sarah.johnson@example.com' },
  { name: 'Mike Chen', email: 'mike.chen@example.com' },
  { name: 'Emma Wilson', email: 'emma.wilson@example.com' },
  { name: 'David Kim', email: 'david.kim@example.com' },
];

let candidateIndex = 0;

// Generate mock candidates
export const generateCandidate = (jobId: string, status?: CandidateStatus): Candidate => {
  const invitedDate = faker.date.past({ years: 0.5 });
  const startedDate = status && status !== 'invited'
    ? faker.date.between({ from: invitedDate, to: new Date() })
    : undefined;
  const submittedDate = status && ['submitted', 'scored', 'shortlisted', 'rejected', 'hired'].includes(status)
    ? faker.date.between({ from: startedDate || invitedDate, to: new Date() })
    : undefined;

  const candidateStatus = status || faker.helpers.arrayElement<CandidateStatus>([
    'invited',
    'started',
    'in_progress',
    'submitted',
    'scored',
    'shortlisted',
    'rejected',
  ]);

  // Generate score if candidate is scored or beyond
  const hasScore = ['scored', 'shortlisted', 'rejected', 'hired'].includes(candidateStatus);
  const score: Score = hasScore ? {
    overall: faker.number.int({ min: 40, max: 95 }),
    aiScore: faker.number.int({ min: 40, max: 95 }),
    humanScore: faker.number.int({ min: 40, max: 95 }),
    breakdown: {
      communication: faker.number.int({ min: 40, max: 100 }),
      technicalSkills: faker.number.int({ min: 40, max: 100 }),
      problemSolving: faker.number.int({ min: 40, max: 100 }),
      cultureFit: faker.number.int({ min: 40, max: 100 }),
      experience: faker.number.int({ min: 40, max: 100 }),
    },
    scoredAt: submittedDate,
    scoredBy: generateId(),
  } : {};

  // Use predefined names, cycling through them
  const candidateInfo = CANDIDATE_NAMES[candidateIndex % CANDIDATE_NAMES.length];
  candidateIndex++;

  return {
    id: generateId(),
    email: candidateInfo.email,
    name: candidateInfo.name,
    phone: faker.phone.number(),
    resumeUrl: faker.internet.url(),
    linkedinUrl: `https://linkedin.com/in/${faker.internet.username()}`,
    jobId,
    inviteToken: faker.string.alphanumeric(32),
    status: candidateStatus,
    invitedAt: invitedDate,
    startedAt: startedDate,
    submittedAt: submittedDate,
    lastActivityAt: faker.date.recent(),
    responses: [],
    scores: score,
    notes: faker.lorem.sentences(2),
    tags: faker.helpers.arrayElements(['Strong Technical', 'Good Communication', 'Leadership', 'Team Player'], 2),
  };
};

// Generate mock interview responses
export const generateInterviewResponses = (candidateId: string, questions: Question[]): InterviewResponse[] => {
  return questions.map(question => ({
    id: generateId(),
    candidateId,
    questionId: question.id,
    type: question.type,
    content: question.type === 'video' || question.type === 'phone'
      ? faker.internet.url()
      : faker.lorem.paragraph(),
    duration: question.type === 'video' || question.type === 'phone'
      ? faker.number.int({ min: 30, max: question.timeLimit || 120 })
      : undefined,
    retries: faker.number.int({ min: 0, max: 2 }),
    submittedAt: faker.date.recent(),
    score: {
      score: faker.number.int({ min: 40, max: 100 }),
      maxScore: 100,
      feedback: faker.lorem.sentence(),
      keywords: faker.helpers.arrayElements(['teamwork', 'leadership', 'problem-solving', 'innovation'], 3),
      sentiment: faker.helpers.arrayElement(['positive', 'neutral', 'negative']),
    },
  }));
};

// Generate mock invites
export const generateInvite = (jobId: string, email?: string): Invite => {
  const sentDate = faker.date.recent({ days: 7 });
  const status = faker.helpers.arrayElement<Invite['status']>(['pending', 'sent', 'opened', 'started', 'completed']);

  return {
    id: generateId(),
    jobId,
    email: email || faker.internet.email(),
    token: faker.string.alphanumeric(32),
    status,
    sentAt: status !== 'pending' ? sentDate : undefined,
    openedAt: ['opened', 'started', 'completed'].includes(status)
      ? faker.date.between({ from: sentDate, to: new Date() })
      : undefined,
    expiresAt: faker.date.future({ years: 0.1 }),
    reminderCount: faker.number.int({ min: 0, max: 3 }),
    lastReminderAt: faker.date.recent({ days: 2 }),
  };
};

// Generate complete mock data set
export const generateMockData = () => {
  // Generate HR users
  const hrUsers = Array.from({ length: 3 }, () => generateUser('hr'));

  // Generate jobs
  const jobs: Job[] = [
    generateJob('active'),
    generateJob('active'),
    generateJob('closed'),
    generateJob('draft'),
  ];

  // Generate candidates for each job
  const candidates: Candidate[] = [];
  const invites: Invite[] = [];

  jobs.forEach(job => {
    if (job.status === 'active' || job.status === 'closed') {
      // Generate various candidates in different stages
      const statuses: CandidateStatus[] = [
        'invited', 'invited', 'started',
        'in_progress', 'submitted', 'submitted',
        'scored', 'scored', 'shortlisted',
        'rejected',
      ];

      statuses.forEach(status => {
        const candidate = generateCandidate(job.id, status);
        candidates.push(candidate);

        // Generate responses if candidate has submitted
        if (['submitted', 'scored', 'shortlisted', 'rejected'].includes(status)) {
          candidate.responses = generateInterviewResponses(candidate.id, job.questions);
        }

        // Generate invite for candidate
        invites.push(generateInvite(job.id, candidate.email));
      });
    }
  });

  return {
    users: hrUsers,
    jobs,
    candidates,
    invites,
  };
};

// Singleton mock data instance
let mockDataInstance: ReturnType<typeof generateMockData> | null = null;

export const getMockData = () => {
  // Force regeneration to use new job titles
  mockDataInstance = generateMockData();
  return mockDataInstance;
};

// Helper functions for filtering and searching
export const filterCandidatesByStatus = (candidates: Candidate[], status?: CandidateStatus) => {
  if (!status) return candidates;
  return candidates.filter(c => c.status === status);
};

export const searchCandidates = (candidates: Candidate[], query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return candidates.filter(c =>
    c.name.toLowerCase().includes(lowercaseQuery) ||
    c.email.toLowerCase().includes(lowercaseQuery)
  );
};

export const getJobById = (id: string) => {
  const { jobs } = getMockData();
  return jobs.find(job => job.id === id);
};

export const getCandidateById = (id: string) => {
  const { candidates } = getMockData();
  return candidates.find(candidate => candidate.id === id);
};

export const getCandidatesByJobId = (jobId: string) => {
  const { candidates } = getMockData();
  return candidates.filter(candidate => candidate.jobId === jobId);
};

export const getInviteByToken = (token: string) => {
  const { invites } = getMockData();
  return invites.find(invite => invite.token === token);
};