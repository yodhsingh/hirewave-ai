import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, InterviewResponse, Candidate } from '@/types';

interface InterviewState {
  // Interview data
  token: string | null;
  candidate: Partial<Candidate> | null;
  questions: Question[];
  currentQuestionIndex: number;
  responses: Map<string, InterviewResponse>;

  // Status flags
  isLoading: boolean;
  isSubmitting: boolean;
  hasConsented: boolean;
  deviceCheckPassed: boolean;
  practiceCompleted: boolean;

  // Timing
  startTime: Date | null;
  lastSaveTime: Date | null;

  // Actions
  initializeInterview: (token: string, candidate: Partial<Candidate>, questions: Question[]) => void;
  setCurrentQuestion: (index: number) => void;
  saveResponse: (questionId: string, response: Partial<InterviewResponse>) => void;
  markDeviceCheckPassed: () => void;
  markPracticeCompleted: () => void;
  setConsent: (consented: boolean) => void;
  submitInterview: () => Promise<void>;
  resetInterview: () => void;

  // Computed values
  getProgress: () => number;
  getCurrentQuestion: () => Question | null;
  isQuestionAnswered: (questionId: string) => boolean;
  canSubmit: () => boolean;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      candidate: null,
      questions: [],
      currentQuestionIndex: 0,
      responses: new Map(),
      isLoading: false,
      isSubmitting: false,
      hasConsented: false,
      deviceCheckPassed: false,
      practiceCompleted: false,
      startTime: null,
      lastSaveTime: null,

      // Initialize interview
      initializeInterview: (token, candidate, questions) => {
        set({
          token,
          candidate,
          questions,
          currentQuestionIndex: 0,
          responses: new Map(),
          startTime: new Date(),
          hasConsented: false,
          deviceCheckPassed: false,
          practiceCompleted: false,
        });
      },

      // Navigation
      setCurrentQuestion: (index) => {
        const { questions } = get();
        if (index >= 0 && index < questions.length) {
          set({ currentQuestionIndex: index });
        }
      },

      // Save response
      saveResponse: (questionId, response) => {
        const { responses } = get();
        const newResponses = new Map(responses);

        const existingResponse = newResponses.get(questionId);
        newResponses.set(questionId, {
          ...existingResponse,
          ...response,
          id: existingResponse?.id || Math.random().toString(36).substring(2),
          candidateId: get().candidate?.id || '',
          questionId,
          submittedAt: new Date(),
        } as InterviewResponse);

        set({
          responses: newResponses,
          lastSaveTime: new Date(),
        });
      },

      // Device and practice
      markDeviceCheckPassed: () => set({ deviceCheckPassed: true }),
      markPracticeCompleted: () => set({ practiceCompleted: true }),
      setConsent: (consented) => set({ hasConsented: consented }),

      // Submit interview
      submitInterview: async () => {
        set({ isSubmitting: true });

        try {
          // In a real app, this would call the API
          // For now, we'll simulate with a delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Clear the persisted state after submission
          get().resetInterview();
        } catch (error) {
          console.error('Failed to submit interview:', error);
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      // Reset interview
      resetInterview: () => {
        set({
          token: null,
          candidate: null,
          questions: [],
          currentQuestionIndex: 0,
          responses: new Map(),
          isLoading: false,
          isSubmitting: false,
          hasConsented: false,
          deviceCheckPassed: false,
          practiceCompleted: false,
          startTime: null,
          lastSaveTime: null,
        });
      },

      // Computed values
      getProgress: () => {
        const { questions, responses } = get();
        if (questions.length === 0) return 0;

        const requiredQuestions = questions.filter(q => q.required);
        const answeredRequired = requiredQuestions.filter(q => responses.has(q.id)).length;

        return (answeredRequired / requiredQuestions.length) * 100;
      },

      getCurrentQuestion: () => {
        const { questions, currentQuestionIndex } = get();
        return questions[currentQuestionIndex] || null;
      },

      isQuestionAnswered: (questionId) => {
        const { responses } = get();
        return responses.has(questionId);
      },

      canSubmit: () => {
        const { questions, responses } = get();
        const requiredQuestions = questions.filter(q => q.required);
        return requiredQuestions.every(q => responses.has(q.id));
      },
    }),
    {
      name: 'interview-storage',
      partialize: (state) => ({
        token: state.token,
        candidate: state.candidate,
        questions: state.questions,
        currentQuestionIndex: state.currentQuestionIndex,
        responses: Array.from(state.responses.entries()),
        hasConsented: state.hasConsented,
        deviceCheckPassed: state.deviceCheckPassed,
        practiceCompleted: state.practiceCompleted,
        startTime: state.startTime,
        lastSaveTime: state.lastSaveTime,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert responses array back to Map after rehydration
        if (state && Array.isArray(state.responses)) {
          state.responses = new Map(state.responses as any);
        }
      },
    }
  )
);