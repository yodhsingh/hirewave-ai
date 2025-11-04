import {
  getMockData,
  resetMockData,
  generateCandidate,
  generateInvite,
  generatePracticeSession
} from './data';
import type {
  Job,
  Candidate,
  Invite,
  User,
  InterviewResponse,
  CandidateStatus,
  JobCreate,
  InviteResult,
  ApplicantProfile,
  PracticeSession,
  InterviewTip,
  PerformanceStats,
  JobMatch,
} from '@/types';

declare global {
  var mockStoreInstance: MockStore | undefined;
  var mockStoreInitialized: boolean | undefined;
}

class MockStore {
  private static instance: MockStore;
  private data: {
    users: User[];
    jobs: Job[];
    candidates: Candidate[];
    invites: Invite[];
    responses: InterviewResponse[];
    applicants: ApplicantProfile[];
    practiceSessions: PracticeSession[];
    interviewTips: InterviewTip[];
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
    const mockData = resetMockData(); // Force regenerate data
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

  // Applicant operations
  getApplicants() {
    return this.data.applicants;
  }

  getApplicantByEmail(email: string): ApplicantProfile | undefined {
    return this.data.applicants.find(a => a.email === email);
  }

  getApplicantById(id: string): ApplicantProfile | undefined {
    return this.data.applicants.find(a => a.id === id);
  }

  createApplicant(profile: Partial<ApplicantProfile>): ApplicantProfile {
    const newApplicant: ApplicantProfile = {
      id: generateId(),
      email: profile.email || '',
      name: profile.name || '',
      skills: profile.skills || [],
      desiredRoles: profile.desiredRoles || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      practiceSessions: [],
      applications: [],
      ...profile,
    };

    this.data.applicants.push(newApplicant);
    return newApplicant;
  }

  updateApplicantProfile(id: string, updates: Partial<ApplicantProfile>): ApplicantProfile | null {
    const applicantIndex = this.data.applicants.findIndex(a => a.id === id);
    if (applicantIndex === -1) return null;

    this.data.applicants[applicantIndex] = {
      ...this.data.applicants[applicantIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return this.data.applicants[applicantIndex];
  }

  // Practice session operations
  getPracticeSessions() {
    return this.data.practiceSessions;
  }

  getPracticeSessionsByApplicantId(applicantId: string): PracticeSession[] {
    return this.data.practiceSessions.filter(s => s.applicantId === applicantId);
  }

  getPracticeSessionById(id: string): PracticeSession | undefined {
    return this.data.practiceSessions.find(s => s.id === id);
  }

  createPracticeSession(applicantId: string, jobId?: string): PracticeSession {
    const session = generatePracticeSession(applicantId, jobId);
    this.data.practiceSessions.push(session);

    // Update applicant's sessions
    const applicant = this.getApplicantById(applicantId);
    if (applicant) {
      applicant.practiceSessions.push(session);
      applicant.updatedAt = new Date();
    }

    return session;
  }

  // Interview tips operations
  getInterviewTips() {
    return this.data.interviewTips;
  }

  getInterviewTipsByCategory(category?: string) {
    if (!category) return this.data.interviewTips;
    return this.data.interviewTips.filter(tip => tip.category === category);
  }

  // Job matching for applicants
  getMatchingJobs(applicantId: string): JobMatch[] {
    const applicant = this.getApplicantById(applicantId);
    if (!applicant) return [];

    const activeJobs = this.data.jobs.filter(j => j.status === 'active');
    const matches: JobMatch[] = [];

    activeJobs.forEach(job => {
      // Calculate match score based on skills overlap
      const requiredSkills = job.requirements || [];
      const applicantSkills = applicant.skills || [];

      const matchingSkills = requiredSkills.filter(skill =>
        applicantSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );

      const matchScore = requiredSkills.length > 0
        ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
        : 75; // Default score if no requirements specified

      const missingSkills = requiredSkills.filter(skill =>
        !applicantSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );

      matches.push({
        jobId: job.id,
        job,
        matchScore,
        matchReasons: [
          `${matchingSkills.length} of ${requiredSkills.length} required skills`,
          job.location === applicant.location ? 'Location match' : '',
          applicant.desiredRoles.includes(job.title) ? 'Role preference match' : '',
        ].filter(Boolean),
        missingSkills,
        salary: {
          min: 70000,
          max: 150000,
          currency: 'USD'
        },
        benefits: ['Health insurance', '401k', 'Remote work', 'PTO'],
      });
    });

    // Sort by match score
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Performance statistics for applicants
  getApplicantStats(applicantId: string): PerformanceStats | null {
    const applicant = this.getApplicantById(applicantId);
    if (!applicant) return null;

    const sessions = this.getPracticeSessionsByApplicantId(applicantId);
    if (sessions.length === 0) return null;

    const scores = sessions.map(s => s.score.overall);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Calculate improvement rate
    const firstScore = sessions[0]?.score.overall || 0;
    const lastScore = sessions[sessions.length - 1]?.score.overall || 0;
    const improvementRate = firstScore > 0 ? ((lastScore - firstScore) / firstScore) * 100 : 0;

    // Determine strongest/weakest areas
    const areaScores: Record<string, number[]> = {};
    sessions.forEach(session => {
      Object.entries(session.score.breakdown).forEach(([area, score]) => {
        if (!areaScores[area]) areaScores[area] = [];
        areaScores[area].push(score);
      });
    });

    const areaAverages = Object.entries(areaScores).map(([area, scores]) => ({
      area,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));

    areaAverages.sort((a, b) => b.average - a.average);

    return {
      applicantId,
      totalSessions: sessions.length,
      totalPracticeTime: sessions.reduce((total, s) => total + (s.duration || 0), 0) / 60,
      averageScore,
      improvementRate,
      strongestAreas: areaAverages.slice(0, 2).map(a => a.area as any),
      weakestAreas: areaAverages.slice(-2).map(a => a.area as any),
      sessionHistory: sessions.map(s => ({
        sessionId: s.id,
        date: s.startedAt,
        jobTitle: s.jobTitle,
        score: s.score.overall,
        duration: (s.duration || 0) / 60,
        questionsAnswered: s.questions.length,
        improvement: 0, // Would calculate from previous session
      })),
      skillProgression: [],
      readinessScore: averageScore,
      comparisonToOthers: {
        percentile: Math.round((averageScore / 95) * 100),
        averageScore: 75, // Mock average
        yourScore: averageScore,
      },
    };
  }

  // Apply for job
  applyForJob(applicantId: string, jobId: string, coverLetter?: string): boolean {
    const applicant = this.getApplicantById(applicantId);
    const job = this.getJobById(jobId);

    if (!applicant || !job) return false;

    // Check if already applied
    const existingApplication = applicant.applications.find(a => a.jobId === jobId);
    if (existingApplication) return false;

    // Create application
    const application = {
      id: generateId(),
      applicantId,
      jobId,
      appliedAt: new Date(),
      status: 'applied' as const,
      coverLetter,
      source: 'direct' as const,
    };

    applicant.applications.push(application);

    // Also create a candidate record for HR view
    const candidate = generateCandidate(jobId, 'invited');
    candidate.email = applicant.email;
    candidate.name = applicant.name;
    candidate.resumeUrl = applicant.resumeUrl;
    this.data.candidates.push(candidate);

    // Update job stats
    this.updateJobStats(jobId);

    return true;
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const mockStore = MockStore.getInstance();