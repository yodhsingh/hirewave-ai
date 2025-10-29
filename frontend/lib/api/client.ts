// API client for making requests to the backend
// In development, this will use the mock store
// In production, this will make real API calls

import type {
  ApiResponse,
  Job,
  JobCreate,
  Candidate,
  CandidateStatus,
  InviteResult,
  InterviewResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: data.message || 'An error occurred',
            details: data.details,
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
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

  // Job endpoints
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

  // Candidate endpoints
  async getCandidates(jobId?: string) {
    const endpoint = jobId ? `/jobs/${jobId}/candidates` : '/candidates';
    return this.request<Candidate[]>(endpoint);
  }

  async getCandidate(id: string) {
    return this.request<Candidate>(`/candidates/${id}`);
  }

  async updateCandidateStatus(id: string, status: CandidateStatus) {
    return this.request<Candidate>(`/candidates/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async bulkUpdateCandidates(ids: string[], status: CandidateStatus) {
    return this.request<{ updated: number }>('/candidates/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids, status }),
    });
  }

  async exportCandidates(ids: string[], format: 'csv' | 'excel' | 'pdf' = 'csv') {
    return this.request<Blob>('/candidates/export', {
      method: 'POST',
      body: JSON.stringify({ ids, format }),
    });
  }

  // Invite endpoints
  async createInvites(jobId: string, emails: string[]) {
    return this.request<InviteResult>(`/jobs/${jobId}/invites`, {
      method: 'POST',
      body: JSON.stringify({ emails }),
    });
  }

  async getInvite(token: string) {
    return this.request<{
      jobId: string;
      candidate: { name: string; email: string };
      job: Job;
    }>(`/invites/${token}`);
  }

  // Interview endpoints
  async getInterviewQuestions(token: string) {
    return this.request<{
      questions: Job['questions'];
      settings: any;
    }>(`/interviews/${token}`);
  }

  async saveInterviewResponse(token: string, response: Partial<InterviewResponse>) {
    return this.request<InterviewResponse>(`/interviews/${token}/responses`, {
      method: 'POST',
      body: JSON.stringify(response),
    });
  }

  async submitInterview(token: string, responses: InterviewResponse[]) {
    return this.request<{ success: boolean }>(`/interviews/${token}/submit`, {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
  }

  // Analytics endpoints
  async getJobAnalytics(jobId: string) {
    return this.request<any>(`/analytics/jobs/${jobId}`);
  }

  async getDashboardAnalytics() {
    return this.request<{
      totalJobs: number;
      totalCandidates: number;
      averageCompletionRate: number;
      recentActivity: any[];
    }>('/analytics/overview');
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      user: any;
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  // Upload endpoints
  async uploadVideo(file: Blob, metadata: any) {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('metadata', JSON.stringify(metadata));

    return this.request<{ url: string }>('/upload/video', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export hooks for React Query
export const apiKeys = {
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...apiKeys.jobs.all, 'list'] as const,
    list: (filters?: any) => [...apiKeys.jobs.lists(), filters] as const,
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
};