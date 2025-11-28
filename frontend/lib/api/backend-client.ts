/**
 * Backend API Client
 * This client connects to the FastAPI backend
 */

import type {
  ApiResponse,
  Job,
  JobCreate,
  Candidate,
  CandidateStatus,
  InviteResult,
  InterviewResponse,
  User,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Auth token storage
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

class BackendApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Token management
  private getToken(): string | null {
    if (typeof window === 'undefined') {
      console.log('[BackendClient.getToken] Server-side, no token');
      return null;
    }

    // First check localStorage for standalone token storage
    const storedToken = localStorage.getItem(TOKEN_KEY);
    console.log('[BackendClient.getToken] Standalone token:', storedToken ? `${storedToken.substring(0, 20)}...` : 'null');
    if (storedToken) return storedToken;

    // Then check Zustand auth-storage for token from authStore
    const authStorage = localStorage.getItem('auth-storage');
    console.log('[BackendClient.getToken] Zustand auth-storage:', authStorage ? 'found' : 'null');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        console.log('[BackendClient.getToken] Parsed auth-storage token:', parsed?.state?.token ? `${parsed.state.token.substring(0, 20)}...` : 'null');
        if (parsed?.state?.token) {
          return parsed.state.token;
        }
      } catch (e) {
        console.error('[BackendClient.getToken] Error parsing auth-storage:', e);
      }
    }

    console.log('[BackendClient.getToken] No token found anywhere');
    return null;
  }

  private setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  private setRefreshToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  private removeTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const token = this.getToken();

      console.log('[BackendClient] Request to:', url);
      console.log('[BackendClient] Token found:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
      };

      // Add authorization header if token exists AND not a public endpoint
      const publicEndpoints = [
        '/auth/register',
        '/auth/login',
        '/text-to-speech',  // TTS is public for demo
        '/transcribe'  // Transcription is public for demo
      ];
      const isPublicEndpoint = publicEndpoints.some(ep => endpoint.includes(ep));

      if (token && !isPublicEndpoint) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[BackendClient] Authorization header set');
      } else if (token && isPublicEndpoint) {
        console.log('[BackendClient] Public endpoint - skipping auth header');
      } else {
        console.warn('[BackendClient] NO TOKEN - request will fail if auth required');
      }

      // Remove Content-Type for FormData
      if (options?.body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('[BackendClient] Failed to parse JSON response:', jsonError);
        // Return a proper error response even if JSON parsing fails
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `Server returned invalid response (status ${response.status})`,
            details: 'Failed to parse response from server',
          },
        };
      }

      if (!response.ok) {
        // Only clear tokens on 401 (Unauthorized) - NOT on 500 errors!
        // 500 errors are server issues, not auth issues
        if (response.status === 401) {
          console.warn('401 Unauthorized - clearing tokens');
          this.removeTokens();
        }

        // Handle validation errors from FastAPI (422 status)
        let errorMessage = 'An error occurred';
        if (data && typeof data === 'object') {
          if (data.detail) {
            if (Array.isArray(data.detail)) {
              // Parse validation errors from FastAPI
              errorMessage = data.detail.map((err: any) =>
                err.msg || err.message || 'Validation error'
              ).join(', ');
            } else if (typeof data.detail === 'string') {
              errorMessage = data.detail;
            }
          } else if (data.error?.message) {
            errorMessage = data.error.message;
          } else if (data.message) {
            errorMessage = data.message;
          }
        }

        // Provide more specific error messages based on status code
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (response.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (response.status === 503) {
          errorMessage = 'Service temporarily unavailable. Please try again.';
        } else if (errorMessage === 'An error occurred') {
          errorMessage = `Server error (${response.status}). Please try again.`;
        }

        return {
          success: false,
          error: {
            code: data?.error?.code || response.status.toString(),
            message: errorMessage,
            details: data?.error?.details || data?.details || data?.detail,
          },
        };
      }

      // Backend returns { success: true, data: {...} }
      // Convert snake_case to camelCase for frontend compatibility
      const responseData = data.data || data;
      const convertedData = toCamelCase(responseData);

      console.log('[BackendClient] BEFORE toCamelCase:', JSON.stringify(responseData, null, 2));
      console.log('[BackendClient] AFTER toCamelCase:', JSON.stringify(convertedData, null, 2));

      return {
        success: true,
        data: convertedData,
        meta: data.meta,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  // Authentication
  async register(data: { email: string; name: string; password: string; role: 'hr' | 'candidate'; companyName?: string }) {
    // Convert role to uppercase for backend compatibility and map companyName to company_name
    const requestData: Record<string, unknown> = {
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role === 'hr' ? 'HR' : 'CANDIDATE',
    };

    // Add company_name for HR users (backend expects snake_case)
    if (data.companyName) {
      requestData.company_name = data.companyName;
    }

    const response = await this.request<{
      accessToken: string;  // Already converted to camelCase
      refreshToken: string;  // Already converted to camelCase
      user: User;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });

    if (response.success && response.data) {
      this.setToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      accessToken: string;  // Already converted to camelCase
      refreshToken: string;  // Already converted to camelCase
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
    }

    return response;
  }

  async logout() {
    this.removeTokens();
    return { success: true, data: null };
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  // Jobs (HR endpoints - require auth)
  async getJobs() {
    return this.request<Job[]>('/jobs');
  }

  async getJob(id: string) {
    return this.request<Job>(`/jobs/${id}`);
  }

  async createJob(job: JobCreate) {
    return this.request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }

  async updateJob(id: string, updates: Partial<Job>) {
    return this.request<Job>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteJob(id: string) {
    return this.request<void>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Public Jobs (for candidates - no auth required)
  async getPublicJobs(params?: { search?: string; department?: string; location?: string; roleType?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.roleType) queryParams.append('role_type', params.roleType);
    const queryString = queryParams.toString();
    return this.request<Job[]>(`/jobs/public${queryString ? `?${queryString}` : ''}`);
  }

  async getPublicJob(id: string) {
    return this.request<Job>(`/jobs/public/${id}`);
  }

  // Job Matches (for logged-in candidates - with match scores)
  async getJobsWithMatches(recalculate?: boolean) {
    const queryString = recalculate ? '?recalculate=true' : '';
    return this.request<any[]>(`/job-matches/my-matches${queryString}`);
  }

  async calculateJobMatch(jobId: number) {
    return this.request<any>(`/job-matches/calculate/${jobId}`, {
      method: 'POST',
    });
  }

  // Candidates
  async getCandidates(jobId: string) {
    return this.request<Candidate[]>(`/candidates/${jobId}/candidates`);
  }

  async getCandidate(id: string) {
    return this.request<Candidate>(`/candidates/${id}`);
  }

  async updateCandidateStatus(id: string, status: CandidateStatus, notes?: string, tags?: string[]) {
    return this.request<Candidate>(`/candidates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes, tags }),
    });
  }

  async bulkUpdateCandidates(ids: string[], status: CandidateStatus) {
    return this.request<{ updated: number }>('/candidates/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids, status }),
    });
  }

  // Invites
  async createInvites(
    jobId: string,
    emails: string[],
    expiresInDays: number = 7,
    sendReminders: boolean = true
  ) {
    return this.request<{
      total: number;
      sent: number;
      failed: number;
      failed_emails: string[];
    }>(`/candidates/${jobId}/invites`, {
      method: 'POST',
      body: JSON.stringify({
        emails,
        expires_in_days: expiresInDays,
        send_reminders: sendReminders,
      }),
    });
  }

  async getInvite(token: string) {
    return this.request<{
      jobId: string;
      candidate: { name: string; email: string };
      job: Job;
    }>(`/invites/${token}`);
  }

  // Interviews
  async getInterviewQuestions(token: string) {
    return this.request<Job>(`/interviews/${token}`);
  }

  async saveInterviewResponse(
    token: string,
    questionId: string,
    content: string,
    duration?: number,
    type: string = 'text'
  ) {
    return this.request<{ message: string }>(`/interviews/${token}/responses`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        content,
        duration,
        type,
      }),
    });
  }

  async submitInterview(token: string, responses: InterviewResponse[]) {
    return this.request<{
      success: boolean;
      message: string;
      candidate_id: string;
      submitted_at: string;
    }>(`/interviews/${token}/submit`, {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
  }

  // Upload
  async uploadVideo(file: Blob, candidateId: string, questionId: string) {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('candidate_id', candidateId);
    formData.append('question_id', questionId);

    return this.request<{ url: string; message: string }>('/interviews/upload/video', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type with boundary
    });
  }

  // Analytics (if needed later)
  async getJobAnalytics(jobId: string) {
    return this.request<Record<string, unknown>>(`/analytics/jobs/${jobId}`);
  }

  async getDashboardAnalytics() {
    return this.request<{
      totalJobs: number;
      totalCandidates: number;
      averageCompletionRate: number;
      recentActivity: Array<Record<string, unknown>>;
    }>('/analytics/overview');
  }

  async parseResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{
      personal_info: {
        name: string | null;
        email: string | null;
        phone: string | null;
        location: string | null;
        linkedin: string | null;
        github: string | null;
        portfolio: string | null;
        summary: string | null;
      };
      experience: Array<{
        company: string;
        position: string;
        location: string;
        start_date: string;
        end_date: string;
        description: string;
      }>;
      education: Array<{
        institution: string;
        degree: string;
        field: string;
        graduation_date: string;
        gpa: string | null;
      }>;
      skills: {
        technical: string[];
        soft: string[];
        languages: string[];
        tools: string[];
      };
      certifications: Array<{
        name: string;
        issuer: string;
        date: string;
      }>;
      projects: Array<{
        name: string;
        description: string;
        technologies: string[];
        url: string | null;
      }>;
      achievements: string[];
      languages_spoken: string[];
      preferences: {
        job_type: string | null;
        desired_roles: string[];
        industries: string[];
      };
      raw_text?: string;
    }>('/resume/parse', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type with boundary
    });
  }

  async getProfile() {
    return this.request<{
      user_id: number;
      full_name: string | null;
      email: string | null;
      phone: string | null;
      location: string | null;
      linkedin_url: string | null;
      github_url: string | null;
      portfolio_url: string | null;
      summary: string | null;
      current_job_title: string | null;
      current_company: string | null;
      years_of_experience: string | null;
      education: string | null;
      work_experience: any[] | null;
      skills: any | null;
      certifications: any[] | null;
      projects: any[] | null;
      achievements: string[] | null;
      languages_spoken: string[] | null;
      expected_salary: string | null;
      availability: string | null;
      work_type: string | null;
      preferred_location: string | null;
      desired_roles: string[] | null;
      industries: string[] | null;
      resume_url: string | null;
      resume_parsed_at: string | null;
      created_at: string | null;
      updated_at: string | null;
      exists: boolean;
    }>('/profile/me');
  }

  async saveProfile(profileData: any) {
    return this.request<{
      message: string;
      profile_id?: number;
    }>('/profile/save', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  // Dashboard
  async getApplicantDashboard() {
    return this.request<{
      user: {
        name: string;
        email: string;
        role: string;
      };
      stats: {
        totalApplications: number;
        completedInterviews: number;
        inProgress: number;
        pending: number;
        averageScore: number;
        readinessScore: number;
        practiceStreak: number;
        improvementRate: number;
      };
      recentApplications: Array<{
        id: number;
        jobTitle: string;
        company: string;
        status: string;
        appliedAt: string | null;
        submittedAt: string | null;
      }>;
      recentActivity: Array<{
        type: string;
        title: string;
        time: string;
        details?: string;
      }>;
      skillProgress: Array<{
        skill: string;
        level: number;
        maxLevel: number;
      }>;
      consolidatedInsights: string[];
    }>('/dashboard/applicant');
  }

  // Practice Interview APIs
  async startPracticeSession(config: {
    interview_type?: string;
    difficulty?: string;
    questions_count?: number;
    target_role?: string;
    focus_areas?: string[];
  }) {
    return this.request<{
      success: boolean;
      session_id: number;
      questions: Array<{
        id: number;
        question: string;
        type: string;
        context: string | null;
        order: number;
      }>;
    }>('/practice/start-session', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async submitPracticeAnswer(questionId: number, audioBlob: Blob, duration?: number) {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.webm');
    if (duration) {
      formData.append('duration', duration.toString());
    }

    return this.request<{
      success: boolean;
      feedback: {
        score: number;
        feedback: string;
        strengths: string[];
        improvements: string[];
        key_points_covered: string[];
        sentiment?: {
          confidence: number;
          clarity: number;
          enthusiasm: number;
        };
      };
    }>(`/practice/submit-answer/${questionId}`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getPracticeSessions() {
    return this.request<{
      success: boolean;
      sessions: Array<{
        id: number;
        type: string;
        difficulty: string;
        target_role: string | null;
        questions_count: number;
        completed_count: number;
        overall_score: number | null;
        category_scores: {
          communication: number;
          technical: number;
          problem_solving: number;
          confidence: number;
          completeness: number;
        } | null;
        started_at: string;
        completed_at: string | null;
      }>;
    }>('/practice/sessions');
  }

  async getPracticeSession(sessionId: number) {
    return this.request<{
      success: boolean;
      session: {
        id: number;
        type: string;
        difficulty: string;
        target_role: string;
        questions_count: number;
        completed_count: number;
        overall_score: number | null;
        started_at: string;
        completed_at: string | null;
        questions: Array<{
          id: number;
          question: string;
          type: string;
          context: string | null;
          response?: {
            transcript: string;
            score: number;
            feedback: string;
            strengths: string[];
            improvements: string[];
          };
        }>;
      };
    }>(`/practice/session/${sessionId}`);
  }

  async completePracticeSession(sessionId: number) {
    return this.request<{
      success: boolean;
      overall_score: number;
      feedback: string;
    }>(`/practice/session/${sessionId}/complete`, {
      method: 'POST',
    });
  }

  async deletePracticeSession(sessionId: number) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/practice/session/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Job Applications
  async applyToJob(jobId: number | string) {
    return this.request<{
      id: number;
      jobId: number;
      jobTitle: string;
      companyName: string | null;
      status: string;
      appliedAt: string;
    }>(`/jobs/public/${jobId}/apply`, {
      method: 'POST',
    });
  }

  async getMyApplications() {
    return this.request<Array<{
      id: number;
      jobId: number;
      jobTitle: string;
      companyName: string | null;
      status: string;
      appliedAt: string;
    }>>('/jobs/my-applications');
  }

  async getApplicationStatus(jobId: number | string) {
    return this.request<{
      applied: boolean;
      status: string | null;
      appliedAt: string | null;
      inviteToken: string | null;
    }>(`/jobs/public/${jobId}/application-status`);
  }
}

export const backendClient = new BackendApiClient();

// Export query keys for TanStack Query
export const apiKeys = {
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...apiKeys.jobs.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...apiKeys.jobs.lists(), filters] as const,
    details: () => [...apiKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...apiKeys.jobs.details(), id] as const,
  },
  candidates: {
    all: ['candidates'] as const,
    lists: () => [...apiKeys.candidates.all, 'list'] as const,
    list: (jobId?: string) => [...apiKeys.candidates.lists(), jobId] as const,
    details: () => [...apiKeys.candidates.all, 'detail'] as const,
    detail: (id: string) => [...apiKeys.candidates.details(), id] as const,
  },
  interviews: {
    all: ['interviews'] as const,
    byToken: (token: string) => [...apiKeys.interviews.all, token] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    job: (id: string) => [...apiKeys.analytics.all, 'job', id] as const,
    overview: () => [...apiKeys.analytics.all, 'overview'] as const,
  },
  auth: {
    all: ['auth'] as const,
    user: () => [...apiKeys.auth.all, 'user'] as const,
  },
  applications: {
    all: ['applications'] as const,
    list: () => [...apiKeys.applications.all, 'list'] as const,
    status: (jobId: string) => [...apiKeys.applications.all, 'status', jobId] as const,
  },
};
