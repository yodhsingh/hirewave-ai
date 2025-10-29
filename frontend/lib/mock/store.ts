// Mock data store for development - simulates a backend database
import { getMockData, generateCandidate, generateInvite } from './data';
import type {
  Job,
  Candidate,
  Invite,
  User,
  InterviewResponse,
  CandidateStatus,
  JobCreate,
  InviteResult,
} from '@/types';

class MockStore {
  private static instance: MockStore;
  private data: {
    users: User[];
    jobs: Job[];
    candidates: Candidate[];
    invites: Invite[];
    responses: InterviewResponse[];
  };

  private constructor() {
    // Initialize with mock data
    const mockData = getMockData();
    this.data = {
      ...mockData,
      responses: [],
    };
  }

  static getInstance(): MockStore {
    if (!MockStore.instance) {
      MockStore.instance = new MockStore();
    }
    return MockStore.instance;
  }

  // Reset store with fresh mock data
  reset() {
    const mockData = getMockData();
    this.data = {
      ...mockData,
      responses: [],
    };
  }

  // Job operations
  getJobs() {
    return this.data.jobs;
  }

  getJobById(id: string) {
    return this.data.jobs.find(job => job.id === id);
  }

  createJob(jobData: JobCreate): Job {
    const newJob: Job = {
      id: generateId(),
      ...jobData,
      companyId: generateId(),
      createdBy: generateId(),
      questions: jobData.questions.map((q, index) => ({
        ...q,
        id: generateId(),
        order: index,
      })),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        total: 0,
        invited: 0,
        started: 0,
        inProgress: 0,
        submitted: 0,
        scored: 0,
        shortlisted: 0,
        rejected: 0,
      },
    };

    this.data.jobs.push(newJob);
    return newJob;
  }

  updateJob(id: string, updates: Partial<Job>): Job | null {
    const jobIndex = this.data.jobs.findIndex(job => job.id === id);
    if (jobIndex === -1) return null;

    this.data.jobs[jobIndex] = {
      ...this.data.jobs[jobIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return this.data.jobs[jobIndex];
  }

  // Candidate operations
  getCandidates() {
    return this.data.candidates;
  }

  getCandidateById(id: string) {
    return this.data.candidates.find(candidate => candidate.id === id);
  }

  getCandidatesByJobId(jobId: string) {
    return this.data.candidates.filter(candidate => candidate.jobId === jobId);
  }

  updateCandidateStatus(id: string, status: CandidateStatus): Candidate | null {
    const candidateIndex = this.data.candidates.findIndex(c => c.id === id);
    if (candidateIndex === -1) return null;

    this.data.candidates[candidateIndex].status = status;

    // Update job stats
    const jobId = this.data.candidates[candidateIndex].jobId;
    this.updateJobStats(jobId);

    return this.data.candidates[candidateIndex];
  }

  bulkUpdateCandidates(ids: string[], status: CandidateStatus): number {
    let updated = 0;
    const jobIds = new Set<string>();

    ids.forEach(id => {
      const candidateIndex = this.data.candidates.findIndex(c => c.id === id);
      if (candidateIndex !== -1) {
        this.data.candidates[candidateIndex].status = status;
        jobIds.add(this.data.candidates[candidateIndex].jobId);
        updated++;
      }
    });

    // Update stats for affected jobs
    jobIds.forEach(jobId => this.updateJobStats(jobId));

    return updated;
  }

  // Invite operations
  createInvites(jobId: string, emails: string[]): InviteResult {
    const job = this.getJobById(jobId);
    if (!job) {
      return {
        created: 0,
        duplicates: 0,
        invalid: [],
        failed: emails,
        invites: [],
      };
    }

    const result: InviteResult = {
      created: 0,
      duplicates: 0,
      invalid: [],
      failed: [],
      invites: [],
    };

    emails.forEach(email => {
      // Check for duplicates
      const existingInvite = this.data.invites.find(
        i => i.jobId === jobId && i.email === email
      );

      if (existingInvite) {
        result.duplicates++;
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        result.invalid.push(email);
        return;
      }

      // Create new invite and candidate
      const invite = generateInvite(jobId, email);
      const candidate = generateCandidate(jobId, 'invited');
      candidate.email = email;
      candidate.inviteToken = invite.token;

      this.data.invites.push(invite);
      this.data.candidates.push(candidate);
      result.invites.push(invite);
      result.created++;
    });

    // Update job stats
    this.updateJobStats(jobId);

    return result;
  }

  getInviteByToken(token: string) {
    return this.data.invites.find(invite => invite.token === token);
  }

  // Interview response operations
  saveResponse(response: InterviewResponse): InterviewResponse {
    // Remove any existing response for the same question
    this.data.responses = this.data.responses.filter(
      r => !(r.candidateId === response.candidateId && r.questionId === response.questionId)
    );

    this.data.responses.push(response);

    // Update candidate's responses
    const candidate = this.getCandidateById(response.candidateId);
    if (candidate) {
      candidate.responses = this.data.responses.filter(
        r => r.candidateId === response.candidateId
      );
      candidate.status = 'in_progress';
      candidate.lastActivityAt = new Date();
    }

    return response;
  }

  getResponsesByCandidateId(candidateId: string): InterviewResponse[] {
    return this.data.responses.filter(r => r.candidateId === candidateId);
  }

  submitInterview(candidateId: string): boolean {
    const candidate = this.getCandidateById(candidateId);
    if (!candidate) return false;

    candidate.status = 'submitted';
    candidate.submittedAt = new Date();

    // Update job stats
    this.updateJobStats(candidate.jobId);

    // Simulate AI scoring (would be done by backend)
    setTimeout(() => {
      this.scoreCandidate(candidateId);
    }, 2000);

    return true;
  }

  // Helper methods
  private updateJobStats(jobId: string) {
    const job = this.getJobById(jobId);
    if (!job) return;

    const candidates = this.getCandidatesByJobId(jobId);

    job.stats = {
      total: candidates.length,
      invited: candidates.filter(c => c.status === 'invited').length,
      started: candidates.filter(c => c.status === 'started').length,
      inProgress: candidates.filter(c => c.status === 'in_progress').length,
      submitted: candidates.filter(c => c.status === 'submitted').length,
      scored: candidates.filter(c => c.status === 'scored').length,
      shortlisted: candidates.filter(c => c.status === 'shortlisted').length,
      rejected: candidates.filter(c => c.status === 'rejected').length,
    };
  }

  private scoreCandidate(candidateId: string) {
    const candidate = this.getCandidateById(candidateId);
    if (!candidate || candidate.status !== 'submitted') return;

    // Simulate AI scoring
    candidate.status = 'scored';
    candidate.scores = {
      overall: Math.floor(Math.random() * 40) + 60, // 60-100
      aiScore: Math.floor(Math.random() * 40) + 60,
      breakdown: {
        communication: Math.floor(Math.random() * 40) + 60,
        technicalSkills: Math.floor(Math.random() * 40) + 60,
        problemSolving: Math.floor(Math.random() * 40) + 60,
        cultureFit: Math.floor(Math.random() * 40) + 60,
        experience: Math.floor(Math.random() * 40) + 60,
      },
      scoredAt: new Date(),
    };

    // Update job stats
    this.updateJobStats(candidate.jobId);
  }

  // Export functionality
  exportCandidates(candidateIds: string[]): any[] {
    return candidateIds
      .map(id => this.getCandidateById(id))
      .filter(Boolean)
      .map(candidate => ({
        name: candidate!.name,
        email: candidate!.email,
        status: candidate!.status,
        score: candidate!.scores?.overall || 'N/A',
        submittedAt: candidate!.submittedAt?.toISOString() || 'N/A',
        notes: candidate!.notes || '',
      }));
  }
}

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Export singleton instance
export const mockStore = MockStore.getInstance();