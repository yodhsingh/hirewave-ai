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
  ApplicantProfile,
  PracticeSession,
  PracticeQuestion,
  PracticeResponse,
  InterviewTip,
} from '@/types';

faker.seed(123);

const generateId = () => faker.string.uuid();

export const generateUser = (role: Role = 'hr'): User => ({
  id: generateId(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role,
  companyId: role === 'hr' ? generateId() : undefined,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

const generateQuestions = (count: number = 5): Question[] => {
  const questionTemplates = [
    {
      type: 'phone' as const,
      prompts: [
        'AI will conduct a comprehensive technical screening call covering your experience and skills',
        'AI phone interview to assess your problem-solving abilities and technical knowledge',
        'Automated phone screening to discuss your background and project experience',
      ],
      timeLimit: 900, 
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
      required: i <= 3, 
      order: i,
      scoreWeight: faker.number.int({ min: 1, max: 10 }),
    });
  }

  return questions;
};

const JOB_TITLES = [
  
  'Senior Software Engineer',
  'Full Stack Developer',
  'Backend Engineer',
  'Frontend Developer',
  'DevOps Engineer',
  'Site Reliability Engineer (SRE)',
  'Cloud Solutions Architect',
  'Mobile App Developer',
  'Software Development Manager',

  
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

  
  'Data Architect',
  'Big Data Engineer',
  'Analytics Lead',
  'Quantitative Analyst',
  'Data Platform Engineer',

  
  'Technical Project Manager',
  'Product Manager - AI/ML',
  'Engineering Manager',
  'Technical Program Manager',
  'Scrum Master',
  'Agile Coach',

  
  'Blockchain Developer',
  'Security Engineer',
  'QA Automation Engineer',
  'Performance Engineer',
  'Research Scientist',
];

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

  
  const jobDescriptions: Record<string, string> = {
    'Data Scientist': 'We are looking for a talented Data Scientist to join our team. You will be responsible for collecting, analyzing, and interpreting large datasets to help drive business decisions. You will work closely with cross-functional teams to implement machine learning models and create data-driven solutions.',
    'Senior Software Engineer': 'Join our engineering team as a Senior Software Engineer where you will design, develop, and maintain scalable software solutions. You will mentor junior developers, participate in architecture decisions, and ensure code quality through best practices.',
    'Machine Learning Engineer': 'We seek an ML Engineer to build and deploy production-ready machine learning systems. You will work on developing algorithms, optimizing model performance, and creating end-to-end ML pipelines using modern MLOps practices.',
    'DevOps Engineer': 'As a DevOps Engineer, you will be responsible for building and maintaining CI/CD pipelines, managing cloud infrastructure, and ensuring system reliability. Experience with Docker, Kubernetes, and cloud platforms is essential.',
    'Data Engineer': 'We need a Data Engineer to design and build robust data pipelines. You will work with big data technologies, create ETL processes, and ensure data quality and availability for analytics teams.',
    'Product Manager - AI/ML': 'Lead our AI/ML product initiatives as a Product Manager. You will define product strategy, work with data science teams, and drive the development of innovative AI-powered features.',
  };

  
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
    roleType: faker.helpers.arrayElement<RoleType>(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY']),
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

const CANDIDATE_NAMES = [
  
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
  
  { name: 'Sarah Johnson', email: 'sarah.johnson@example.com' },
  { name: 'Mike Chen', email: 'mike.chen@example.com' },
  { name: 'Emma Wilson', email: 'emma.wilson@example.com' },
  { name: 'David Kim', email: 'david.kim@example.com' },
];

let candidateIndex = 0;

export const generateCandidate = (jobId: string, status?: CandidateStatus): Candidate => {
  const invitedDate = faker.date.past({ years: 0.5 });
  const startedDate = status && status !== 'INVITED'
    ? faker.date.between({ from: invitedDate, to: new Date() })
    : undefined;
  const submittedDate = status && ['SUBMITTED', 'SCORED', 'SHORTLISTED', 'REJECTED', 'HIRED'].includes(status)
    ? faker.date.between({ from: startedDate || invitedDate, to: new Date() })
    : undefined;

  const candidateStatus = status || faker.helpers.arrayElement<CandidateStatus>([
    'INVITED',
    'STARTED',
    'IN_PROGRESS',
    'SUBMITTED',
    'SCORED',
    'SHORTLISTED',
    'REJECTED',
  ]);


  const hasScore = ['SCORED', 'SHORTLISTED', 'REJECTED', 'HIRED'].includes(candidateStatus);

  const overallScore = faker.number.int({ min: 40, max: 95 });
  const technicalScore = faker.number.int({ min: 40, max: 100 });
  const communicationScore = faker.number.int({ min: 40, max: 100 });
  const problemSolvingScore = faker.number.int({ min: 40, max: 100 });

  const score: Score = hasScore ? {
    overall: overallScore,
    aiScore: faker.number.int({ min: 40, max: 95 }),
    humanScore: faker.number.int({ min: 40, max: 95 }),
    breakdown: {
      communication: communicationScore,
      technicalSkills: technicalScore,
      problemSolving: problemSolvingScore,
      cultureFit: faker.number.int({ min: 40, max: 100 }),
      experience: faker.number.int({ min: 40, max: 100 }),
    },
    scoredAt: submittedDate,
    scoredBy: generateId(),
    
    aiInsights: {
      summary: faker.helpers.arrayElement([
        'Strong technical candidate with excellent problem-solving skills and solid communication abilities.',
        'Highly proficient developer with deep expertise in modern frameworks and cloud technologies.',
        'Well-rounded candidate with good balance of technical skills and soft skills.',
        'Experienced professional with proven track record in delivering complex projects.',
        'Promising candidate with strong fundamentals and eagerness to learn.',
      ]),
      strengths: faker.helpers.arrayElements([
        'Excellent problem-solving approach',
        'Strong technical fundamentals',
        'Clear and articulate communication',
        'Experience with modern tech stack',
        'Demonstrated leadership skills',
        'Quick learner with adaptability',
        'Strong architectural thinking',
        'Good code quality and best practices',
      ], 3),
      weaknesses: faker.helpers.arrayElements([
        'Limited experience with cloud platforms',
        'Could improve system design knowledge',
        'Less exposure to large-scale systems',
        'Communication could be more concise',
        'Limited testing experience',
        'Needs more experience with CI/CD',
      ], 2),
      redFlags: overallScore < 60 ? faker.helpers.arrayElements([
        'Struggled with basic algorithmic questions',
        'Inconsistent responses across interviews',
        'Limited depth in claimed expertise areas',
      ], 1) : undefined,
      recommendations: faker.helpers.arrayElements([
        'Strong hire - proceed with offer',
        'Schedule final round with team lead',
        'Good fit for mid-level position',
        'Consider for fast-track onboarding',
        'Recommend additional technical round',
        'Suitable for junior-to-mid level role',
      ], 2),
      confidenceLevel: faker.number.int({ min: 75, max: 98 }),
    },
    
    skillsExtracted: [
      { name: 'React', category: 'technical', proficiency: 'advanced', yearsOfExperience: 3, matchesJobRequirement: true, mentionedIn: ['q1', 'q3'] },
      { name: 'Node.js', category: 'technical', proficiency: faker.helpers.arrayElement(['intermediate', 'advanced', 'expert']), yearsOfExperience: 2, matchesJobRequirement: true, mentionedIn: ['q2'] },
      { name: 'TypeScript', category: 'technical', proficiency: faker.helpers.arrayElement(['intermediate', 'advanced']), matchesJobRequirement: true, mentionedIn: ['q1'] },
      { name: 'AWS', category: 'technical', proficiency: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']), yearsOfExperience: 1, matchesJobRequirement: true, mentionedIn: ['q3'] },
      { name: 'Problem Solving', category: 'soft', proficiency: 'advanced', matchesJobRequirement: true, mentionedIn: ['q1', 'q2'] },
      { name: 'Team Collaboration', category: 'soft', proficiency: faker.helpers.arrayElement(['intermediate', 'advanced']), matchesJobRequirement: true, mentionedIn: ['q4'] },
      { name: faker.helpers.arrayElement(['Docker', 'Kubernetes', 'GraphQL', 'PostgreSQL']), category: 'technical', proficiency: faker.helpers.arrayElement(['beginner', 'intermediate']), matchesJobRequirement: false, mentionedIn: ['q2'] },
    ],
    
    competencyRanking: {
      percentile: Math.round((overallScore / 95) * 100),
      rank: faker.number.int({ min: 1, max: 20 }),
      totalCandidates: faker.number.int({ min: 30, max: 100 }),
      topCompetencies: [
        technicalScore >= 80 ? 'Technical Skills' : undefined,
        communicationScore >= 80 ? 'Communication' : undefined,
        problemSolvingScore >= 80 ? 'Problem Solving' : undefined,
      ].filter(Boolean) as string[],
      comparisonText: overallScore >= 85
        ? 'Top 15% across all candidates'
        : overallScore >= 75
        ? 'Top 30% for technical competencies'
        : overallScore >= 65
        ? 'Above average performer'
        : 'Meets minimum requirements',
    },
  } : {};

  
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

export const generateApplicantProfile = (): ApplicantProfile => {
  const skills = faker.helpers.arrayElements([
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker',
    'Kubernetes', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Git', 'CI/CD',
    'Agile', 'Scrum', 'Problem Solving', 'Communication', 'Leadership'
  ], faker.number.int({ min: 5, max: 12 }));

  return {
    id: generateId(),
    email: '22f2000946@ds.study.iitm.ac.in',
    name: 'Akash Kumar',
    phone: faker.phone.number(),
    resumeUrl: faker.internet.url(),
    resumeText: faker.lorem.paragraphs(3),
    linkedinUrl: `https://linkedin.com/in/${faker.internet.username()}`,
    githubUrl: `https://github.com/${faker.internet.username()}`,
    portfolioUrl: faker.internet.url(),
    skills,
    experience: faker.number.int({ min: 0, max: 15 }),
    currentRole: faker.person.jobTitle(),
    desiredRoles: faker.helpers.arrayElements([
      'Software Engineer', 'Senior Developer', 'Full Stack Engineer', 'Frontend Developer',
      'Backend Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager'
    ], faker.number.int({ min: 1, max: 3 })),
    location: faker.location.city(),
    willingToRelocate: faker.datatype.boolean(),
    expectedSalary: {
      min: faker.number.int({ min: 60000, max: 120000 }),
      max: faker.number.int({ min: 120000, max: 200000 }),
      currency: 'USD'
    },
    availability: faker.helpers.arrayElement(['immediate', '2_weeks', '1_month', '2_months', 'other']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    practiceSessions: [],
    applications: []
  };
};

export const generatePracticeQuestions = (count: number = 5): PracticeQuestion[] => {
  const behavioralQuestions = [
    'Tell me about yourself and your background',
    'Why are you interested in this position?',
    'Describe a time you faced a challenging situation',
    'How do you handle conflicts with team members?',
    'What are your greatest strengths and weaknesses?'
  ];

  const technicalQuestions = [
    'Explain the concept of closure in JavaScript',
    'What is the difference between REST and GraphQL?',
    'How would you optimize a slow database query?',
    'Describe your experience with cloud platforms',
    'Walk me through your approach to debugging'
  ];

  const situationalQuestions = [
    'How would you handle a tight deadline?',
    'What would you do if you disagreed with your manager?',
    'How do you prioritize multiple tasks?',
    'Describe how you would onboard to a new codebase',
    'How would you mentor a junior developer?'
  ];

  const questions: PracticeQuestion[] = [];
  const sessionId = generateId();

  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(['behavioral', 'technical', 'situational', 'competency'] as const);
    let questionText = '';

    if (category === 'behavioral') {
      questionText = faker.helpers.arrayElement(behavioralQuestions);
    } else if (category === 'technical') {
      questionText = faker.helpers.arrayElement(technicalQuestions);
    } else {
      questionText = faker.helpers.arrayElement(situationalQuestions);
    }

    questions.push({
      id: generateId(),
      sessionId,
      question: questionText,
      category,
      difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard']),
      expectedAnswerPoints: faker.helpers.arrayElements([
        'Clear communication', 'Specific examples', 'Technical accuracy',
        'Problem-solving approach', 'Results-oriented', 'Team collaboration'
      ], 3),
      timeLimit: faker.number.int({ min: 60, max: 180 }),
      order: i,
      tips: faker.helpers.arrayElements([
        'Use the STAR method', 'Be specific', 'Stay focused',
        'Provide examples', 'Keep it concise'
      ], 2)
    });
  }

  return questions;
};

export const generatePracticeSession = (applicantId: string, jobId?: string): PracticeSession => {
  const questions = generatePracticeQuestions();
  const responses: PracticeResponse[] = [];
  const sessionId = generateId();

  // Generate responses for each question
  questions.forEach(question => {
    responses.push({
      id: generateId(),
      sessionId,
      questionId: question.id,
      content: faker.lorem.paragraphs(2),
      duration: faker.number.int({ min: 30, max: question.timeLimit || 120 }),
      retries: 0,
      confidence: faker.number.int({ min: 60, max: 95 }),
      pace: faker.helpers.arrayElement(['too_slow', 'good', 'too_fast']),
      fillerWords: faker.helpers.arrayElements(['um', 'uh', 'like', 'you know'], faker.number.int({ min: 0, max: 4 })),
      timestamp: faker.date.recent()
    });
  });

  const overallScore = faker.number.int({ min: 65, max: 95 });

  return {
    id: sessionId,
    applicantId,
    jobId,
    sessionType: jobId ? 'job_specific' : 'general',
    status: 'completed',
    startedAt: faker.date.recent(),
    completedAt: faker.date.recent(),
    duration: faker.number.int({ min: 900, max: 2700 }), // 15-45 minutes
    questions,
    responses,
    feedback: {
      id: generateId(),
      sessionId,
      overall: 'Good performance overall with strong technical knowledge and communication skills. Areas for improvement include reducing filler words and providing more structured responses.',
      strengths: [
        {
          category: 'technical',
          title: 'Strong Technical Knowledge',
          description: 'Demonstrated solid understanding of core concepts',
          priority: 'low',
          examples: ['Clear explanation of closure', 'Good database optimization approach']
        },
        {
          category: 'communication',
          title: 'Clear Communication',
          description: 'Articulated thoughts clearly and logically',
          priority: 'low',
          examples: undefined
        }
      ],
      improvements: [
        {
          category: 'communication',
          title: 'Reduce Filler Words',
          description: 'Work on eliminating "um", "uh" from responses',
          priority: 'medium',
          examples: ['Used "um" 8 times in technical explanation']
        },
        {
          category: 'behavioral',
          title: 'Use STAR Method',
          description: 'Structure behavioral responses with Situation, Task, Action, Result',
          priority: 'high',
          examples: undefined
        }
      ],
      specificFeedback: questions.map(q => ({
        questionId: q.id,
        score: faker.number.int({ min: 60, max: 95 }),
        maxScore: 100,
        feedback: 'Good response with clear examples. Could be more concise.',
        keyPointsCovered: faker.helpers.arrayElements(q.expectedAnswerPoints || [], 2),
        keyPointsMissed: faker.helpers.arrayElements(q.expectedAnswerPoints || [], 1),
        improvement: 'Focus on being more concise while maintaining clarity',
        modelAnswer: faker.lorem.paragraph()
      })),
      communicationAnalysis: {
        clarity: faker.number.int({ min: 70, max: 95 }),
        pace: faker.helpers.arrayElement(['too_slow', 'good', 'too_fast']),
        volume: 'good',
        fillerWordCount: faker.number.int({ min: 0, max: 15 }),
        vocabularyLevel: faker.helpers.arrayElement(['basic', 'intermediate', 'advanced']),
        sentenceStructure: faker.helpers.arrayElement(['simple', 'varied', 'complex'])
      },
      technicalAnalysis: {
        accuracy: faker.number.int({ min: 75, max: 95 }),
        depth: faker.helpers.arrayElement(['surface', 'moderate', 'deep']),
        problemSolvingApproach: faker.helpers.arrayElement(['unclear', 'structured', 'excellent']),
        technicalTermsUsed: ['closure', 'REST', 'GraphQL', 'optimization', 'debugging'],
        conceptsExplained: ['JavaScript closures', 'API design', 'Database optimization'],
        examplesProvided: true
      },
      behavioralAnalysis: {
        starMethodUsed: faker.datatype.boolean(),
        specificityLevel: faker.helpers.arrayElement(['vague', 'moderate', 'specific']),
        outcomesFocused: faker.datatype.boolean(),
        leadershipShown: faker.datatype.boolean(),
        teamworkShown: true,
        conflictResolution: faker.datatype.boolean()
      },
      aiCoachTips: [
        'Practice the STAR method for behavioral questions',
        'Work on eliminating filler words through mock interviews',
        'Prepare 2-3 strong examples for common scenarios',
        'Time yourself to ensure concise responses'
      ],
      nextSteps: [
        'Complete practice exercises for behavioral questions',
        'Review technical concepts mentioned in the session',
        'Schedule another practice session in 2-3 days'
      ]
    },
    score: {
      overall: overallScore,
      breakdown: {
        communication: faker.number.int({ min: 65, max: 95 }),
        content: faker.number.int({ min: 70, max: 95 }),
        confidence: faker.number.int({ min: 60, max: 90 }),
        structure: faker.number.int({ min: 65, max: 90 }),
        relevance: faker.number.int({ min: 75, max: 95 })
      },
      percentile: Math.round((overallScore / 95) * 100),
      grade: overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : 'D',
      readinessLevel: overallScore >= 85 ? 'interview_ready' : overallScore >= 75 ? 'almost_ready' : 'needs_practice'
    },
    improvementPlan: undefined,
    recordingUrls: undefined
  };
};

export const generateInterviewTips = (): InterviewTip[] => [
  {
    id: generateId(),
    category: 'general',
    title: 'First Impressions Matter',
    content: 'The first 30 seconds set the tone for the entire interview. Make eye contact, smile, and give a firm handshake.',
    examples: ['Start with a warm greeting', 'Thank the interviewer for their time'],
    doList: ['Dress appropriately', 'Arrive 10 minutes early', 'Bring multiple copies of resume'],
    dontList: ['Check your phone', 'Arrive late', 'Forget interviewer names'],
    relatedQuestions: ['Tell me about yourself']
  },
  {
    id: generateId(),
    category: 'behavioral',
    title: 'Master the STAR Method',
    content: 'Structure your behavioral responses using Situation, Task, Action, and Result for clear, impactful answers.',
    examples: ['When describing a project challenge, explain the situation, your specific task, actions taken, and measurable results'],
    doList: ['Be specific with numbers and outcomes', 'Keep it under 2 minutes', 'Practice common scenarios'],
    dontList: ['Be vague about your role', 'Blame others for failures', 'Ramble without structure'],
    relatedQuestions: ['Describe a challenging situation', 'Tell me about a time you failed']
  },
  {
    id: generateId(),
    category: 'technical',
    title: 'Think Out Loud',
    content: 'When solving technical problems, verbalize your thought process. Interviewers value your approach as much as the solution.',
    examples: ['Explain your reasoning for choosing an algorithm', 'Discuss trade-offs between different approaches'],
    doList: ['Ask clarifying questions', 'Consider edge cases', 'Optimize after getting a working solution'],
    dontList: ['Jump to coding immediately', 'Ignore hints from interviewer', 'Give up without trying'],
    relatedQuestions: ['Implement a binary search', 'Design a system']
  }
];

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

export const generateMockData = () => {
  
  const hrUsers = Array.from({ length: 3 }, () => generateUser('hr'));

  
  const jobs: Job[] = [
    generateJob('active'),
    generateJob('active'),
    generateJob('closed'),
    generateJob('draft'),
  ];

  
  const candidates: Candidate[] = [];
  const invites: Invite[] = [];

  jobs.forEach(job => {
    if (job.status === 'active' || job.status === 'closed') {

      const statuses: CandidateStatus[] = [
        'INVITED', 'INVITED', 'STARTED',
        'IN_PROGRESS', 'SUBMITTED', 'SUBMITTED',
        'SCORED', 'SCORED', 'SHORTLISTED',
        'REJECTED',
      ];

      statuses.forEach(status => {
        const candidate = generateCandidate(job.id, status);
        candidates.push(candidate);


        if (['SUBMITTED', 'SCORED', 'SHORTLISTED', 'REJECTED'].includes(status)) {
          candidate.responses = generateInterviewResponses(candidate.id, job.questions);
        }

        
        invites.push(generateInvite(job.id, candidate.email));
      });
    }
  });

  // Generate applicant profiles with practice sessions
  const applicants: ApplicantProfile[] = [];
  const practiceSessions: PracticeSession[] = [];

  // Generate 5 applicants with various practice sessions
  for (let i = 0; i < 5; i++) {
    const applicant = generateApplicantProfile();
    applicants.push(applicant);

    // Generate 1-3 practice sessions per applicant
    const sessionCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < sessionCount; j++) {
      // Some sessions are job-specific, others are general practice
      const jobId = faker.datatype.boolean() && jobs.length > 0 ?
        faker.helpers.arrayElement(jobs.filter(j => j.status === 'active')).id :
        undefined;

      const session = generatePracticeSession(applicant.id, jobId);
      practiceSessions.push(session);
      applicant.practiceSessions.push(session);
    }

    
    if (faker.datatype.boolean() && jobs.length > 0) {
      const appliedJobs = faker.helpers.arrayElements(
        jobs.filter(j => j.status === 'active'),
        faker.number.int({ min: 1, max: 2 })
      );

      appliedJobs.forEach(job => {
        applicant.applications.push({
          id: generateId(),
          applicantId: applicant.id,
          jobId: job.id,
          appliedAt: faker.date.recent(),
          status: faker.helpers.arrayElement(['applied', 'screening', 'interview']),
          coverLetter: faker.lorem.paragraphs(2),
          source: faker.helpers.arrayElement(['direct', 'linkedin', 'indeed'])
        });
      });
    }
  }

  
  const interviewTips = generateInterviewTips();

  return {
    users: hrUsers,
    jobs,
    candidates,
    invites,
    applicants,
    practiceSessions,
    interviewTips,
  };
};

let mockDataInstance: ReturnType<typeof generateMockData> | null = null;

export const getMockData = () => {
  
  if (!mockDataInstance) {
    mockDataInstance = generateMockData();
  }
  return mockDataInstance;
};

export const resetMockData = () => {
  mockDataInstance = null;
  return getMockData();
};

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