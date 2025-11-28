
export type ID = number;

export type Role = 'HR' | 'CANDIDATE' | 'ADMIN';

export interface User {
  id: ID;
  email: string;
  name: string;
  role: Role;
  companyId?: ID;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

export type JobStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type RoleType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE' | 'TEMPORARY';

export interface Job {
  id: ID;
  title: string;
  description: string;
  department: string;
  location: string;
  roleType: RoleType;
  companyId?: ID;
  createdBy: ID;
  questions: Question[];
  requirements?: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  stats: JobStats;
}

export interface JobStats {
  invited: number;
  started: number;
  inProgress: number;
  submitted: number;
  scored: number;
  shortlisted: number;
  rejected: number;
  total: number;
}

export interface JobCreate {
  title: string;
  description: string;
  department: string;
  location: string;
  roleType: RoleType;
  questions: QuestionCreate[];
  requirements?: string;
  status?: JobStatus;
}

export type QuestionType = 'PHONE' | 'VIDEO' | 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';

export interface Question {
  id: ID;
  jobId: ID;
  type: QuestionType;
  question: string;
  timeLimit?: number;
  options?: string[];
  codeTemplate?: string;
  correctAnswer?: string;
  required: boolean;
  order: number;
  createdAt: Date;
}

export interface QuestionCreate {
  type: QuestionType;
  question: string;
  timeLimit?: number;
  options?: string[];
  codeTemplate?: string;
  correctAnswer?: string;
  required: boolean;
  order?: number;
}

export type CandidateStatus =
  | 'invited'
  | 'started'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'scored'
  | 'shortlisted'
  | 'rejected'
  | 'hired';

export interface Candidate {
  id: ID;
  email: string;
  name: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  jobId: ID;
  inviteToken: string;
  status: CandidateStatus;
  invitedAt: Date;
  startedAt?: Date;
  submittedAt?: Date;
  lastActivityAt?: Date;
  responses: InterviewResponse[];
  score?: Score;  // Changed from 'scores' to match backend
  notes?: string;
  tags?: string[];
}

export interface CandidateRow {
  id: ID;
  name: string;
  email: string;
  stage: CandidateStatus;
  score?: number;
  submittedAt?: string;
  updatedAt: string;
  selected?: boolean;
}

export interface CandidateDetail extends Candidate {
  job: Job;
  transcript?: Transcript[];
  reviewNotes?: ReviewNote[];
}

export interface InterviewResponse {
  id: ID;
  candidateId: ID;
  questionId: ID;
  type: 'PHONE' | 'VIDEO' | 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
  content: string;
  duration?: number;
  videoBlobUrl?: string;
  retries: number;
  submittedAt: Date;
  score?: QuestionScore;
}

export interface ResponseCreate {
  questionId: ID;
  type: 'VIDEO' | 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
  content: string;
  duration?: number;
  retries: number;
}

export interface Score {
  overall?: number;
  aiScore?: number;
  humanScore?: number;
  breakdown?: ScoreBreakdown;
  scoredAt?: Date;
  scoredBy?: ID;
  aiInsights?: AIInsights;
  skillsExtracted?: ExtractedSkill[];
  competencyRanking?: CompetencyRanking;
}

export interface ScoreBreakdown {
  communication?: number;
  technicalSkills?: number;
  problemSolving?: number;
  cultureFit?: number;
  experience?: number;
  [key: string]: number | undefined;
}

export interface AIInsights {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  redFlags?: string[];
  recommendations: string[];
  confidenceLevel: number; 
}

export interface ExtractedSkill {
  name: string;
  category: 'technical' | 'soft' | 'domain';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  matchesJobRequirement: boolean;
  mentionedIn: string[]; 
}

export interface CompetencyRanking {
  percentile: number; 
  rank: number; 
  totalCandidates: number;
  topCompetencies: string[]; 
  comparisonText: string; 
}

export interface QuestionScore {
  score: number;
  maxScore: number;
  feedback?: string;
  keywords?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Transcript {
  id: ID;
  responseId: ID;
  questionId: ID;
  text: string;
  timestamps?: TranscriptTimestamp[];
  analysis?: TranscriptAnalysis;
}

export interface TranscriptTimestamp {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptAnalysis {
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  summary?: string;
  warnings?: string[]; 
}

export interface ReviewNote {
  id: ID;
  candidateId: ID;
  authorId: ID;
  author: User;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invite {
  id: ID;
  jobId: ID;
  email: string;
  token: string;
  status: 'pending' | 'sent' | 'opened' | 'started' | 'completed' | 'expired';
  sentAt?: Date;
  openedAt?: Date;
  expiresAt: Date;
  reminderCount: number;
  lastReminderAt?: Date;
}

export interface InviteCreate {
  jobId: ID;
  emails: string[];
  expiresIn?: number; 
  sendReminders?: boolean;
}

export interface InviteResult {
  created: number;
  duplicates: number;
  invalid: string[];
  failed: string[];
  invites: Invite[];
}

export interface JobAnalytics {
  jobId: ID;
  overview: AnalyticsOverview;
  pipeline: PipelineAnalytics;
  performance: PerformanceAnalytics;
  demographics?: DemographicsAnalytics;
}

export interface AnalyticsOverview {
  totalCandidates: number;
  completionRate: number;
  averageScore: number;
  averageTimeToComplete: number; 
  topPerformers: number;
  shortlistRate: number;
}

export interface PipelineAnalytics {
  stages: PipelineStage[];
  dropOffPoints: DropOffPoint[];
  conversionRates: ConversionRate[];
}

export interface PipelineStage {
  name: CandidateStatus;
  count: number;
  percentage: number;
  averageTimeInStage: number; 
}

export interface DropOffPoint {
  stage: string;
  count: number;
  percentage: number;
  reasons?: string[];
}

export interface ConversionRate {
  from: CandidateStatus;
  to: CandidateStatus;
  rate: number;
}

export interface PerformanceAnalytics {
  scoreDistribution: ScoreDistribution[];
  questionPerformance: QuestionPerformance[];
  timeAnalysis: TimeAnalysis;
}

export interface ScoreDistribution {
  range: string; 
  count: number;
  percentage: number;
}

export interface QuestionPerformance {
  questionId: ID;
  question: string;
  averageScore: number;
  completionRate: number;
  averageTime: number;
}

export interface TimeAnalysis {
  averageTimePerQuestion: number;
  fastestCompletion: number;
  slowestCompletion: number;
  peakSubmissionHours: number[]; 
}

export interface DemographicsAnalytics {
  byLocation?: Record<string, number>;
  byExperience?: Record<string, number>;
  byEducation?: Record<string, number>;
  bySource?: Record<string, number>;
}

export interface InterviewSettings {
  allowRetakes: boolean;
  maxRetakes: number;
  showTimer: boolean;
  allowPause: boolean;
  autoSave: boolean;
  autoSaveInterval: number; 
  practiceQuestion: boolean;
  requireConsent: boolean;
  consentText?: string;
  completionMessage?: string;
  brandingEnabled: boolean;
  customLogo?: string;
  primaryColor?: string;
}

export type PracticeSessionStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';
export type ImprovementAreaCategory = 'communication' | 'technical' | 'behavioral' | 'problem_solving' | 'presentation';

export interface ApplicantProfile {
  id: ID;
  email: string;
  name: string;
  phone?: string;
  resumeUrl?: string;
  resumeText?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  experience?: number;
  currentRole?: string;
  desiredRoles: string[];
  location?: string;
  willingToRelocate?: boolean;
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  availability?: 'immediate' | '2_weeks' | '1_month' | '2_months' | 'other' | string;
  education?: string;
  createdAt: Date;
  updatedAt: Date;
  practiceSessions: PracticeSession[];
  applications: ApplicationRecord[] | any[];
}

export interface PracticeSession {
  id: ID;
  applicantId: ID;
  jobId?: ID; 
  jobTitle?: string;
  jobDescription?: string;
  sessionType: 'general' | 'job_specific' | 'skill_based';
  status: PracticeSessionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; 
  questions: PracticeQuestion[];
  responses: PracticeResponse[];
  feedback: PracticeFeedback;
  score: PracticeScore;
  improvementPlan?: ImprovementPlan;
  recordingUrls?: string[]; 
}

export interface PracticeQuestion {
  id: ID;
  sessionId?: ID;
  type?: QuestionType;
  question: string;
  description?: string;
  category: 'behavioral' | 'technical' | 'situational' | 'competency' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswerPoints?: string[];
  timeLimit?: number;
  order?: number;
  tips?: string[];
  tags?: string[];
}

export interface PracticeResponse {
  id: ID;
  sessionId: ID;
  questionId: ID;
  type?: QuestionType;
  content: string;
  audioUrl?: string;
  videoUrl?: string;
  duration?: number;
  retries?: number;
  confidence?: number;
  pace?: 'too_slow' | 'good' | 'too_fast' | string;
  fillerWords?: string[];
  timestamp?: Date;
  score?: number;
  feedback?: string;
  submittedAt?: Date;
}

export interface PracticeFeedback {
  id?: ID;
  sessionId?: ID;
  overall: string;
  strengths?: FeedbackItem[];
  improvements?: FeedbackItem[];
  specificFeedback?: QuestionFeedback[];
  communicationAnalysis?: CommunicationAnalysis;
  technicalAnalysis?: TechnicalAnalysis;
  behavioralAnalysis?: BehavioralAnalysis;
  aiCoachTips?: string[];
  nextSteps?: string[];
}

export interface FeedbackItem {
  category: ImprovementAreaCategory;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  examples?: string[]; 
}

export interface QuestionFeedback {
  questionId: ID | string;
  score: number;
  maxScore: number;
  feedback: string;
  keyPointsCovered?: string[];
  keyPointsMissed?: string[];
  improvement?: string;
  modelAnswer?: string;
}

export interface CommunicationAnalysis {
  clarity: number;
  pace: 'too_slow' | 'good' | 'too_fast' | string;
  volume: 'too_quiet' | 'good' | 'too_loud' | string;
  fillerWordCount: number;
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced' | string;
  sentenceStructure: 'simple' | 'varied' | 'complex' | string;
  eyeContact?: number;
  bodyLanguage?: 'closed' | 'neutral' | 'open' | string;
  facialExpression?: 'nervous' | 'neutral' | 'confident' | string;
}

export interface TechnicalAnalysis {
  accuracy: number;
  depth: 'surface' | 'moderate' | 'deep' | string;
  problemSolvingApproach: 'unclear' | 'structured' | 'excellent' | string;
  technicalTermsUsed: string[];
  conceptsExplained: string[];
  examplesProvided: boolean;
}

export interface BehavioralAnalysis {
  starMethodUsed: boolean;
  specificityLevel: 'vague' | 'moderate' | 'specific' | string;
  outcomesFocused: boolean;
  leadershipShown: boolean;
  teamworkShown: boolean;
  conflictResolution: boolean;
}

export interface PracticeScore {
  overall: number;
  breakdown: {
    communication: number;
    content: number;
    confidence: number;
    structure: number;
    relevance: number;
  };
  percentile?: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | string;
  readinessLevel: 'not_ready' | 'needs_practice' | 'almost_ready' | 'interview_ready' | 'more_practice_needed';
}

export interface ImprovementPlan {
  id: ID;
  applicantId: ID;
  sessionId: ID;
  createdAt: Date;
  goals: ImprovementGoal[];
  resources: LearningResource[];
  practiceExercises: PracticeExercise[];
  estimatedTimeToImprove: number; 
  progressTracking: ProgressMetric[];
}

export interface ImprovementGoal {
  id: ID;
  area: ImprovementAreaCategory;
  currentLevel: number; 
  targetLevel: number; 
  description: string;
  deadline?: Date;
  milestones: string[];
  completed: boolean;
}

export interface LearningResource {
  id: ID;
  type: 'article' | 'video' | 'course' | 'book' | 'practice';
  title: string;
  description: string;
  url?: string;
  duration?: string; 
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: ImprovementAreaCategory;
}

export interface PracticeExercise {
  id: ID;
  title: string;
  description: string;
  category: ImprovementAreaCategory;
  instructions: string[];
  expectedOutcome: string;
  estimatedTime: number; 
  completed: boolean;
  completedAt?: Date;
}

export interface ProgressMetric {
  date: Date;
  area: ImprovementAreaCategory;
  score: number;
  sessionId?: ID;
  notes?: string;
}

export interface ApplicationRecord {
  id: ID;
  applicantId: ID;
  jobId: ID;
  appliedAt: Date;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  customResponses?: Record<string, string>; 
  referralCode?: string;
  source?: 'direct' | 'linkedin' | 'indeed' | 'referral' | 'other';
}

export interface JobMatch {
  jobId: ID;
  job: Job;
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  benefits?: string[];
  distance?: number;
  status?: 'new' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  appliedAt?: Date;
}

export interface InterviewTip {
  id: ID;
  category: 'general' | 'behavioral' | 'technical' | 'company_specific' | 'preparation' | 'during' | 'after';
  title: string;
  description?: string;
  content?: string;
  examples?: string[];
  doList?: string[];
  dontList?: string[];
  relatedQuestions?: string[];
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}

export interface PerformanceStats {
  applicantId?: ID;
  totalSessions: number;
  totalPracticeTime?: number;
  averageScore: number;
  improvementRate?: number;
  improvement?: number;
  strongestArea?: string;
  strongestAreas?: ImprovementAreaCategory[] | string[];
  weakestArea?: string;
  weakestAreas?: ImprovementAreaCategory[] | string[];
  sessionHistory?: SessionSummary[];
  recentSessions?: Array<{
    id: ID;
    date: Date;
    jobTitle?: string;
    score: number;
    duration: number;
    questionsAnswered: number;
  }>;
  skillProgression?: SkillProgression[] | any[];
  readinessScore?: number;
  comparisonToOthers?: {
    percentile: number;
    averageScore: number;
    yourScore: number;
  } | any;
}

export interface SessionSummary {
  sessionId: ID;
  date: Date;
  jobTitle?: string;
  score: number;
  duration: number;
  questionsAnswered: number;
  improvement: number; 
}

export interface SkillProgression {
  skill: string;
  category: ImprovementAreaCategory;
  scores: Array<{
    date: Date;
    score: number;
    sessionId: ID;
  }>;
  trend: 'improving' | 'stable' | 'declining';
  currentLevel: number;
}

export interface ExportRequest {
  type: 'csv' | 'excel' | 'pdf';
  candidateIds: ID[];
  fields: ExportField[];
  includeScores?: boolean;
  includeTranscripts?: boolean;
  includeNotes?: boolean;
}

export interface ExportField {
  key: string;
  label: string;
  include: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export interface FilterOptions {
  status?: CandidateStatus[];
  scoreRange?: [number, number];
  dateRange?: [Date, Date];
  tags?: string[];
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Notification {
  id: ID;
  userId: ID;
  type: 'invite_sent' | 'interview_completed' | 'candidate_scored' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}