
export type ID = string;

export type Role = 'hr' | 'candidate' | 'admin';

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

export type JobStatus = 'draft' | 'active' | 'closed';
export type RoleType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance' | 'Temporary';

export interface Job {
  id: ID;
  title: string;
  description: string;
  department: string;
  location: string;
  roleType: RoleType;
  companyId: ID;
  createdBy: ID;
  questions: Question[];
  requirements?: string[];
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
  requirements?: string[];
}

export type QuestionType = 'phone' | 'video' | 'text' | 'multiple_choice' | 'code';

export interface Question {
  id: ID;
  type: QuestionType;
  question: string;
  description?: string;
  timeLimit?: number; // in seconds for video questions
  maxLength?: number; // character limit for text questions
  options?: string[]; // for multiple choice
  required: boolean;
  order: number;
  scoreWeight?: number; // weighting for AI scoring
}

export interface QuestionCreate {
  type: QuestionType;
  question: string;
  description?: string;
  timeLimit?: number;
  maxLength?: number;
  options?: string[];
  required: boolean;
  order?: number;
  scoreWeight?: number;
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
  scores: Score;
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
  type: 'phone' | 'video' | 'text' | 'multiple_choice' | 'code';
  content: string; // URL for video, text content for others
  duration?: number; // actual time taken in seconds
  videoBlobUrl?: string; // temporary URL for video blob
  retries: number;
  submittedAt: Date;
  score?: QuestionScore;
}

export interface ResponseCreate {
  questionId: ID;
  type: 'video' | 'text' | 'multiple_choice' | 'code';
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
  confidenceLevel: number; // 0-100
}

export interface ExtractedSkill {
  name: string;
  category: 'technical' | 'soft' | 'domain';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  matchesJobRequirement: boolean;
  mentionedIn: string[]; // question IDs where mentioned
}

export interface CompetencyRanking {
  percentile: number; // 0-100, where this candidate ranks among all candidates
  rank: number; // actual rank (1, 2, 3, etc.)
  totalCandidates: number;
  topCompetencies: string[]; // top 3 competencies
  comparisonText: string; // "Top 15% for technical skills"
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
  warnings?: string[]; // e.g., "Low audio quality", "Background noise detected"
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
  expiresIn?: number; // days until expiration
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
  averageTimeToComplete: number; // in minutes
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
  averageTimeInStage: number; // in hours
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
  range: string; // e.g., "0-20", "21-40"
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
  peakSubmissionHours: number[]; // array of hours (0-23)
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
  autoSaveInterval: number; // in seconds
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
  resumeText?: string; // Extracted text from resume
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  experience?: number; // Years of experience
  currentRole?: string;
  desiredRoles: string[];
  location?: string;
  willingToRelocate?: boolean;
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  availability?: 'immediate' | '2_weeks' | '1_month' | '2_months' | 'other';
  createdAt: Date;
  updatedAt: Date;
  practiceSessions: PracticeSession[];
  applications: ApplicationRecord[];
}

export interface PracticeSession {
  id: ID;
  applicantId: ID;
  jobId?: ID; // Optional - can practice for specific job or general
  jobTitle?: string;
  jobDescription?: string;
  sessionType: 'general' | 'job_specific' | 'skill_based';
  status: PracticeSessionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  questions: PracticeQuestion[];
  responses: PracticeResponse[];
  feedback: PracticeFeedback;
  score: PracticeScore;
  improvementPlan?: ImprovementPlan;
  recordingUrls?: string[]; // Video/audio recordings
}

export interface PracticeQuestion {
  id: ID;
  sessionId: ID;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'competency';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswerPoints?: string[]; // Key points AI expects in answer
  timeLimit?: number; // in seconds
  order: number;
  tips?: string[]; // Pre-question tips
}

export interface PracticeResponse {
  id: ID;
  sessionId: ID;
  questionId: ID;
  content: string; // Transcribed or typed response
  audioUrl?: string;
  videoUrl?: string;
  duration: number;
  retries: number;
  confidence: number; // 0-100, detected from voice/video
  pace: 'too_slow' | 'good' | 'too_fast';
  fillerWords: string[]; // Detected filler words
  timestamp: Date;
}

export interface PracticeFeedback {
  id: ID;
  sessionId: ID;
  overall: string; // Overall feedback summary
  strengths: FeedbackItem[];
  improvements: FeedbackItem[];
  specificFeedback: QuestionFeedback[];
  communicationAnalysis: CommunicationAnalysis;
  technicalAnalysis?: TechnicalAnalysis;
  behavioralAnalysis?: BehavioralAnalysis;
  aiCoachTips: string[];
  nextSteps: string[];
}

export interface FeedbackItem {
  category: ImprovementAreaCategory;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  examples?: string[]; // Specific examples from the session
}

export interface QuestionFeedback {
  questionId: ID;
  score: number;
  maxScore: number;
  feedback: string;
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  improvement: string;
  modelAnswer?: string; // Example of a good answer
}

export interface CommunicationAnalysis {
  clarity: number; // 0-100
  pace: 'too_slow' | 'good' | 'too_fast';
  volume: 'too_quiet' | 'good' | 'too_loud';
  fillerWordCount: number;
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced';
  sentenceStructure: 'simple' | 'varied' | 'complex';
  eyeContact?: number; // 0-100, if video
  bodyLanguage?: 'closed' | 'neutral' | 'open'; // if video
  facialExpression?: 'nervous' | 'neutral' | 'confident'; // if video
}

export interface TechnicalAnalysis {
  accuracy: number; // 0-100
  depth: 'surface' | 'moderate' | 'deep';
  problemSolvingApproach: 'unclear' | 'structured' | 'excellent';
  technicalTermsUsed: string[];
  conceptsExplained: string[];
  examplesProvided: boolean;
}

export interface BehavioralAnalysis {
  starMethodUsed: boolean; // Situation, Task, Action, Result
  specificityLevel: 'vague' | 'moderate' | 'specific';
  outcomesFocused: boolean;
  leadershipShown: boolean;
  teamworkShown: boolean;
  conflictResolution: boolean;
}

export interface PracticeScore {
  overall: number; // 0-100
  breakdown: {
    communication: number;
    content: number;
    confidence: number;
    structure: number;
    relevance: number;
  };
  percentile?: number; // Compared to other applicants
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  readinessLevel: 'not_ready' | 'needs_practice' | 'almost_ready' | 'interview_ready';
}

export interface ImprovementPlan {
  id: ID;
  applicantId: ID;
  sessionId: ID;
  createdAt: Date;
  goals: ImprovementGoal[];
  resources: LearningResource[];
  practiceExercises: PracticeExercise[];
  estimatedTimeToImprove: number; // in days
  progressTracking: ProgressMetric[];
}

export interface ImprovementGoal {
  id: ID;
  area: ImprovementAreaCategory;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
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
  duration?: string; // e.g., "2 hours", "3 days"
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
  estimatedTime: number; // in minutes
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
  customResponses?: Record<string, string>; // Custom questions and answers
  referralCode?: string;
  source?: 'direct' | 'linkedin' | 'indeed' | 'referral' | 'other';
}

export interface JobMatch {
  jobId: ID;
  job: Job;
  matchScore: number; // 0-100
  matchReasons: string[];
  missingSkills: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  benefits?: string[];
  distance?: number; // km from applicant location
}

export interface InterviewTip {
  id: ID;
  category: 'general' | 'behavioral' | 'technical' | 'company_specific';
  title: string;
  content: string;
  examples?: string[];
  doList: string[];
  dontList: string[];
  relatedQuestions?: string[];
}

export interface PerformanceStats {
  applicantId: ID;
  totalSessions: number;
  totalPracticeTime: number; // in minutes
  averageScore: number;
  improvementRate: number; // percentage improvement over time
  strongestAreas: ImprovementAreaCategory[];
  weakestAreas: ImprovementAreaCategory[];
  sessionHistory: SessionSummary[];
  skillProgression: SkillProgression[];
  readinessScore: number; // 0-100
  comparisonToOthers: {
    percentile: number;
    averageScore: number;
    yourScore: number;
  };
}

export interface SessionSummary {
  sessionId: ID;
  date: Date;
  jobTitle?: string;
  score: number;
  duration: number;
  questionsAnswered: number;
  improvement: number; // compared to previous session
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