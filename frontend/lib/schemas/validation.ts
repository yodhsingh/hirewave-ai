import { z } from 'zod';

export const jobCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(80, 'Title must be less than 80 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  department: z.string().min(2).max(50),
  location: z.string().min(2).max(100),
  roleType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY']),
  questions: z.array(z.object({
    type: z.enum(['phone', 'video', 'text', 'multiple_choice', 'code']),
    question: z.string().min(10, 'Question must be at least 10 characters'),
    timeLimit: z.number().min(30).max(1800).optional(),
    options: z.array(z.string()).min(2).max(6).optional(),
    codeTemplate: z.string().optional(),
    correctAnswer: z.string().optional(),
    required: z.boolean(),
    order: z.number().min(0).optional(),
  })).min(3, 'At least 3 questions required').max(10, 'Maximum 10 questions allowed'),
  requirements: z.string().optional(),
  status: z.enum(['draft', 'active', 'closed']).optional(),
});

export const questionSchema = z.object({
  type: z.enum(['video', 'text', 'multiple_choice', 'code']),
  prompt: z.string().min(10).max(500),
  description: z.string().max(1000).optional(),
  timeLimit: z.number().min(30).max(300).optional(),
  maxLength: z.number().min(100).max(2000).optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  order: z.number(),
  scoreWeight: z.number().min(0).max(10).optional(),
});

export const candidateInviteSchema = z.object({
  emails: z.array(z.string().email('Invalid email address')).min(1).max(200),
  expiresIn: z.number().min(1).max(30).default(7), 
  sendReminders: z.boolean().default(true),
});

export const interviewResponseSchema = z.object({
  questionId: z.string(),
  type: z.enum(['video', 'text', 'multiple_choice', 'code']),
  content: z.string(),
  duration: z.number().optional(),
  retries: z.number().min(0).max(3),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  company: z.string().min(2).max(100).optional(),
  role: z.enum(['hr', 'candidate']).default('hr'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const interviewSettingsSchema = z.object({
  allowRetakes: z.boolean(),
  maxRetakes: z.number().min(0).max(3),
  showTimer: z.boolean(),
  allowPause: z.boolean(),
  autoSave: z.boolean(),
  autoSaveInterval: z.number().min(10).max(300), 
  practiceQuestion: z.boolean(),
  requireConsent: z.boolean(),
  consentText: z.string().max(2000).optional(),
  completionMessage: z.string().max(1000).optional(),
  brandingEnabled: z.boolean(),
  customLogo: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

export const reviewNoteSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const exportRequestSchema = z.object({
  type: z.enum(['csv', 'excel', 'pdf']),
  candidateIds: z.array(z.string()).min(1),
  includeScores: z.boolean().optional(),
  includeTranscripts: z.boolean().optional(),
  includeNotes: z.boolean().optional(),
});

export const filterSchema = z.object({
  status: z.array(z.enum([
    'invited',
    'started',
    'in_progress',
    'submitted',
    'under_review',
    'scored',
    'shortlisted',
    'rejected',
    'hired'
  ])).optional(),
  scoreRange: z.tuple([z.number().min(0).max(100), z.number().min(0).max(100)]).optional(),
  dateRange: z.tuple([z.date(), z.date()]).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
});

export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type CandidateInviteInput = z.infer<typeof candidateInviteSchema>;
export type InterviewResponseInput = z.infer<typeof interviewResponseSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type InterviewSettingsInput = z.infer<typeof interviewSettingsSchema>;
export type ReviewNoteInput = z.infer<typeof reviewNoteSchema>;
export type ExportRequestInput = z.infer<typeof exportRequestSchema>;
export type FilterInput = z.infer<typeof filterSchema>;