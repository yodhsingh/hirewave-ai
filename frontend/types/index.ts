// Type definitions for the AI Interview Platform

export type ID = string;

// User and Authentication
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

// Job Related Types
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

// Question Types
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

// Candidate Related Types
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

// Interview Response Types
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

// Scoring Types
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

// Transcript and Analysis
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

// Review and Notes
export interface ReviewNote {
  id: ID;
  candidateId: ID;
  authorId: ID;
  author: User;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Invite Management
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

// Analytics Types
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

// Settings and Configuration
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

// Export Types
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

// API Response Types
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

// Filter and Sort Types
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

// Notification Types
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