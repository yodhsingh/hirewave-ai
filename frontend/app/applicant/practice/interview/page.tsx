'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mic, MicOff, Play, Pause, Send, Clock, CheckCircle,
  AlertCircle, ChevronRight, ChevronLeft, Loader2,
  Brain, Sparkles, Home, Volume2, StopCircle, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FloatingParticles } from '@/components/FloatingParticles';
import { gradients } from '@/lib/theme';
import { backendClient } from '@/lib/api/backend-client';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: number;
  question: string;
  type: string;
  context: string | null;
  order: number;
}

interface SessionState {
  sessionId: number | null;
  questions: Question[];
  currentQuestionIndex: number;
  responses: Map<number, { audioBlob?: Blob; duration?: number; transcript?: string; textAnswer?: string }>;
  feedback: Map<number, any>;
}

// Module-level flag to prevent duplicate initialization in StrictMode
let isSessionInitializing = false;

// Debug helper - allow resetting from console
if (typeof window !== 'undefined') {
  (window as any).resetSessionInit = () => {
    console.log('🔧 Resetting session initialization flag');
    isSessionInitializing = false;
  };
}

export default function PracticeInterviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [sessionState, setSessionState] = useState<SessionState>({
    sessionId: null,
    questions: [],
    currentQuestionIndex: 0,
    responses: new Map(),
    feedback: new Map(),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true); // Try auto-speaking since user clicked to get here
  const [responseMode, setResponseMode] = useState<'text' | 'voice'>('text'); // Default to text mode
  const [textAnswer, setTextAnswer] = useState(''); // Text input for typing answers

  // Get session config from localStorage or URL params
  useEffect(() => {
    const initSession = async () => {
      // Prevent double initialization using module-level flag
      console.log('🔍 Checking initialization conditions:');
      console.log('  - isSessionInitializing:', isSessionInitializing);
      console.log('  - sessionState.sessionId:', sessionState.sessionId);

      if (isSessionInitializing) {
        console.log('⚠️ Session is already initializing, skipping...');
        return;
      }
      if (sessionState.sessionId) {
        console.log('✅ Session already exists with ID:', sessionState.sessionId);
        return;
      }

      console.log('🚀 Starting session initialization...');
      isSessionInitializing = true;

      try {
        // First check if session data already exists (created on practice page)
        const sessionDataStr = localStorage.getItem('practiceSessionData');
        console.log('📋 Existing session data from localStorage:', sessionDataStr);

        if (sessionDataStr) {
          // Use existing session created on practice page
          const sessionData = JSON.parse(sessionDataStr);
          console.log('✅ Using existing session ID:', sessionData.sessionId);
          console.log('✅ Questions loaded:', sessionData.questions);

          setSessionState({
            sessionId: sessionData.sessionId,
            questions: sessionData.questions,
            currentQuestionIndex: 0,
            responses: new Map(),
            feedback: new Map(),
          });

          console.log('Session state initialized from existing data');

          // Don't clear localStorage yet - keep it for page reloads/refreshes
          // We'll clear it when the interview is submitted or user manually exits

          // Reset flag after successful initialization
          isSessionInitializing = false;
        } else {
          // No existing session - redirect to practice setup page
          console.log('❌ No existing session found, redirecting to practice setup...');
          isSessionInitializing = false;

          toast({
            title: 'No Session Found',
            description: 'Please start a practice session from the setup page.',
            variant: 'destructive'
          });

          router.push('/applicant/practice');
          return;

          // Check if it's an authentication error
          if (response.error?.message?.toLowerCase().includes('not authenticated') ||
              response.error?.message?.toLowerCase().includes('unauthorized')) {
            toast({
              title: 'Authentication Required',
              description: 'Please log in to start a practice session.',
              variant: 'destructive',
            });
            // Redirect to login without clearing the session (backend client handles token cleanup)
            router.push('/login?role=candidate&redirect=/applicant/practice');
          } else {
            // For other errors, show error but don't redirect or clear session
            toast({
              title: 'Error Starting Session',
              description: response.error?.message || 'Failed to start practice session. Please try again.',
              variant: 'destructive',
            });
            router.push('/applicant/practice');
          }
        }
      } catch (error: any) {
        console.error('❌ Exception starting practice session:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response,
        });
        isSessionInitializing = false;
        // Don't clear user session on errors - just show the error
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
        router.push('/applicant/practice');
      } finally {
        setIsLoading(false);
      }
    };

    console.log('📍 useEffect running - Page loaded, attempting to initialize session...');
    console.log('Current sessionState:', sessionState);
    console.log('isSessionInitializing:', isSessionInitializing);
    initSession();
    requestMediaPermission();

    // Cleanup function
    return () => {
      // Reset the module flag when component unmounts
      isSessionInitializing = false;
    };
  }, []); // Empty dependency array - run only once on mount

  // Monitor responses state and log Submit button visibility
  useEffect(() => {
    const shouldShowSubmitButton = sessionState.responses.size > 0 && !isRecording;

    console.log('📊 Session State Update:');
    console.log('   - Responses count:', sessionState.responses.size);
    console.log('   - Total questions:', sessionState.questions.length);
    console.log('   - Is recording:', isRecording);
    console.log('   - Should show Submit button:', shouldShowSubmitButton);

    if (shouldShowSubmitButton) {
      console.log('   ✅ "Submit for Evaluation" button should be VISIBLE');
    } else {
      console.log('   ❌ "Submit for Evaluation" button should be HIDDEN');
      if (sessionState.responses.size === 0) {
        console.log('      Reason: No responses saved yet');
      }
      if (isRecording) {
        console.log('      Reason: Currently recording');
      }
    }
    console.log('');
  }, [sessionState.responses.size, sessionState.questions.length, isRecording]);

  // Request microphone permission with better error handling
  const requestMediaPermission = async () => {
    console.log('Requesting media permission...');
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media recording not supported in this browser');
      }

      console.log('Getting user media stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Media stream obtained:', stream);

      // Set up audio level monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      microphone.connect(analyser);

      // Monitor audio levels
      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        if (isRecording) {
          requestAnimationFrame(checkAudioLevel);
        }
      };

      // Try different mime types for compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose default
            console.warn('Using default mime type for MediaRecorder');
          }
        }
      }
      console.log('Using mime type:', mimeType);

      // Create media recorder
      const mediaRecorderOptions = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
      console.log('MediaRecorder created:', mediaRecorder);

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        console.log('Recording started');
        // Start checking audio levels
        checkAudioLevel();
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio chunks:', audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        // Save the recording
        const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
        if (currentQuestion) {
          // Show processing message
          toast({
            title: 'Processing...',
            description: 'Transcribing your answer...',
            variant: 'default'
          });

          try {
            // Transcribe the audio
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await fetch('http://localhost:8000/api/v1/practice/transcribe', {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              }
            });

            let transcript = 'Recording saved (transcription pending)';
            if (response.ok) {
              const data = await response.json();
              transcript = data.transcript || transcript;
            }

            // Save with transcript
            setSessionState(prev => ({
              ...prev,
              responses: new Map(prev.responses).set(currentQuestion.id, {
                audioBlob,
                duration,
                transcript
              })
            }));

            toast({
              title: 'Answer Recorded Successfully',
              description: `Your response has been transcribed. You can review it above or move to the next question.`,
              variant: 'default'
            });
          } catch (error) {
            console.error('Transcription error:', error);
            // Save without transcript
            setSessionState(prev => ({
              ...prev,
              responses: new Map(prev.responses).set(currentQuestion.id, { audioBlob, duration })
            }));
          }
        }

        audioChunksRef.current = [];
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: 'Recording Error',
          description: 'An error occurred while recording. Please try again.',
          variant: 'destructive',
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      setHasMediaPermission(true);
      console.log('Media permission granted and recorder initialized');

      toast({
        title: 'Microphone Ready',
        description: 'You can now start recording your answers.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Failed to get media permission:', error);
      let errorMessage = 'Please allow microphone access to record your answers.';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone access was denied. Please check your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (error.message?.includes('not supported')) {
        errorMessage = 'Your browser does not support audio recording. Please use Chrome, Firefox, or Edge.';
      }

      toast({
        title: 'Microphone Setup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setHasMediaPermission(false);
    }
  };

  // Recording controls
  const startRecording = () => {
    console.log('Start recording clicked');
    console.log('MediaRecorder exists?', !!mediaRecorderRef.current);
    console.log('Has permission?', hasMediaPermission);
    console.log('Is recording?', isRecording);

    if (!mediaRecorderRef.current) {
      console.error('MediaRecorder not initialized');
      toast({
        title: 'Microphone Error',
        description: 'Please allow microphone access and refresh the page',
        variant: 'destructive'
      });
      // Try to request permission again
      requestMediaPermission();
      return;
    }

    if (isRecording) return;

    audioChunksRef.current = [];
    startTimeRef.current = Date.now();
    mediaRecorderRef.current.start();
    setIsRecording(true);

    // Start recording timer
    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // Store timer ID to clear later
    (window as any).recordingTimer = timer;
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setRecordingTime(0);

    // Clear timer
    if ((window as any).recordingTimer) {
      clearInterval((window as any).recordingTimer);
    }

    // Don't auto-advance - let user see their transcript and manually move to next question
    // Check if all questions are recorded
    const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
    if (currentQuestion) {
      // Will be handled in mediaRecorder.onstop event
      // Just show that we're processing
      toast({
        title: 'Recording Saved',
        description: 'Processing your answer...',
        variant: 'default'
      });
    }
  };

  // Submit all answers for complete evaluation
  const submitAllAnswers = async () => {
    console.log('');
    console.log('========================================');
    console.log('🚀 SUBMIT FOR EVALUATION button clicked!');
    console.log('========================================');
    console.log('📊 Current session state:', {
      sessionId: sessionState.sessionId,
      responsesCount: sessionState.responses.size,
      totalQuestions: sessionState.questions.length,
      hasSessionId: !!sessionState.sessionId,
      hasResponses: sessionState.responses.size > 0
    });
    console.log('');

    if (!sessionState.sessionId || sessionState.responses.size === 0) {
      console.error('❌ VALIDATION FAILED:');
      console.error('   - Has Session ID:', !!sessionState.sessionId);
      console.error('   - Has Responses:', sessionState.responses.size > 0);
      console.error('   - Responses count:', sessionState.responses.size);

      toast({
        title: 'No Answers Found',
        description: 'Please answer at least one question before submitting.',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ Validation passed, proceeding with submission...');

    setIsSubmitting(true);
    try {
      const submitUrl = `http://localhost:8000/api/v1/practice/submit-session/${sessionState.sessionId}`;
      const token = localStorage.getItem('access_token');

      console.log('🌐 Making HTTP request for AI evaluation:');
      console.log('   - URL:', submitUrl);
      console.log('   - Method: POST');
      console.log('   - Has Token:', !!token);
      console.log('   - Token preview:', token ? token.substring(0, 20) + '...' : 'NONE');
      console.log('   - Note: Answers already saved in database, backend will load them');
      console.log('');

      // Submit session for AI evaluation - answers already saved incrementally
      const result = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})  // Empty body - backend loads answers from database
      });

      console.log('📥 Received HTTP response:');
      console.log('   - Status:', result.status);
      console.log('   - Status Text:', result.statusText);
      console.log('   - OK:', result.ok);
      console.log('');

      const data = await result.json();
      console.log('📋 Response data:', data);
      console.log('');

      if (result.ok && data.success) {
        // Display overall feedback
        toast({
          title: 'Evaluation Complete!',
          description: `Your answers have been submitted successfully!`,
          variant: 'default'
        });

        // Show success message and redirect to dashboard
        setTimeout(() => {
          // Clear session data from localStorage after successful submission
          localStorage.removeItem('practiceSessionData');
          localStorage.removeItem('practiceSessionConfig');

          toast({
            title: 'Practice Session Complete',
            description: 'View your scores and feedback on the dashboard!',
            variant: 'default'
          });
          router.push('/applicant/dashboard');
        }, 2000);
      } else {
        console.error('');
        console.error('❌ SUBMISSION FAILED');
        console.error('================================');
        console.error('HTTP Status:', result.status);
        console.error('Response data:', data);
        console.error('================================');
        console.error('');

        const errorMessage = data.detail || data.error?.message || data.message || `Server returned ${result.status}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('');
      console.error('💥 ERROR DURING SUBMISSION');
      console.error('================================');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('================================');
      console.error('');

      toast({
        title: 'Submission Failed',
        description: error.message || 'An error occurred while submitting. Check console for details.',
        variant: 'destructive',
        duration: 10000, // Show for 10 seconds
      });
    } finally {
      console.log('🏁 Submission attempt complete (setting isSubmitting = false)');
      console.log('');
      setIsSubmitting(false);
    }
  };

  // Submit current answer and get feedback (OLD - keeping for reference)
  const submitAnswer = async () => {
    const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
    const response = sessionState.responses.get(currentQuestion.id);

    if (!response) {
      toast({
        title: 'No Recording',
        description: 'Please record your answer before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await backendClient.submitPracticeAnswer(
        currentQuestion.id,
        response.audioBlob,
        response.duration
      );

      if (result.success && result.data) {
        setSessionState(prev => ({
          ...prev,
          feedback: new Map(prev.feedback).set(currentQuestion.id, result.data.feedback)
        }));

        toast({
          title: 'Answer Submitted',
          description: `Score: ${result.data.feedback.score}/100`,
        });

        // Auto-advance to next question after a delay
        setTimeout(() => {
          if (sessionState.currentQuestionIndex < sessionState.questions.length - 1) {
            navigateToQuestion(sessionState.currentQuestionIndex + 1);
          } else {
            // All questions answered, go to feedback page
            router.push(`/applicant/practice/feedback?sessionId=${sessionState.sessionId}`);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your answer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Text-to-speech functions using backend API
  const speakQuestion = async (questionText: string) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setIsSpeaking(true);

      console.log('Generating audio for question...');

      // Generate audio from backend (no authentication required for demo)
      const response = await fetch('http://localhost:8000/api/v1/practice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: questionText })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Audio generation failed:', response.status, errorText);
        throw new Error(`Failed to generate audio: ${response.status} ${response.statusText}`);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: 'Audio Error',
          description: 'Failed to play question audio',
          variant: 'destructive'
        });
      };

      await audio.play();
    } catch (error: any) {
      console.error('Failed to generate speech:', error);
      setIsSpeaking(false);

      // Handle different error types
      if (error.name === 'NotAllowedError') {
        // Browser autoplay restriction
        toast({
          title: 'Audio Playback',
          description: 'Click the speaker button to hear the question',
          variant: 'default'
        });
      } else if (error.message?.includes('404') || error.message?.includes('Failed to generate')) {
        toast({
          title: 'Text-to-Speech Error',
          description: 'Audio generation failed. Please check your connection.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Audio Error',
          description: 'Unable to play audio. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  // Save text answer
  const saveTextAnswer = async () => {
    console.log('');
    console.log('====================================');
    console.log('💾 SAVE ANSWER button clicked (SAVING TO DATABASE)');
    console.log('====================================');
    console.log('');

    if (!textAnswer.trim()) {
      toast({
        title: 'Empty Answer',
        description: 'Please type your answer before saving.',
        variant: 'destructive',
      });
      return;
    }

    const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
    if (!currentQuestion) {
      console.error('❌ No current question found');
      return;
    }

    console.log('💾 Saving answer to database for question:', currentQuestion.id);
    console.log('   - Answer length:', textAnswer.trim().length);
    console.log('   - Session ID:', sessionState.sessionId);

    try {
      // Save to backend immediately
      const token = localStorage.getItem('access_token');
      const saveUrl = `http://localhost:8000/api/v1/practice/save-text-answer/${currentQuestion.id}`;

      console.log('🌐 Making HTTP request to save answer:');
      console.log('   - URL:', saveUrl);
      console.log('   - Has Token:', !!token);

      const response = await fetch(saveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answer_text: textAnswer.trim()
        })
      });

      console.log('📥 Received response:');
      console.log('   - Status:', response.status);
      console.log('   - OK:', response.ok);

      const data = await response.json();
      console.log('   - Data:', data);

      if (response.ok && data.success) {
        // Also update local state
        setSessionState(prev => {
          const newResponses = new Map(prev.responses);
          newResponses.set(currentQuestion.id, {
            textAnswer: textAnswer.trim(),
            transcript: textAnswer.trim(),
          });

          console.log('✅ Answer saved to both database and local state');
          console.log('   - Updated responses map size:', newResponses.size);
          console.log('   - Total questions:', prev.questions.length);

          return {
            ...prev,
            responses: newResponses
          };
        });

        toast({
          title: 'Answer Saved',
          description: 'Your answer has been saved to the database. You can resume this session later.',
          variant: 'default',
        });

        console.log('');
      } else {
        throw new Error(data.detail || data.message || 'Failed to save answer');
      }
    } catch (error: any) {
      console.error('');
      console.error('💥 ERROR SAVING ANSWER');
      console.error('================================');
      console.error('Error:', error.message);
      console.error('Error stack:', error.stack);
      console.error('================================');
      console.error('');

      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save answer. Please try again.',
        variant: 'destructive',
        duration: 10000,
      });
    }
  };

  // Navigation between questions
  const navigateToQuestion = async (index: number) => {
    if (index >= 0 && index < sessionState.questions.length) {
      // Stop any ongoing speech when changing questions
      stopSpeaking();

      setSessionState(prev => ({ ...prev, currentQuestionIndex: index }));
      setRecordingTime(0);
      setAudioLevel(0);

      // Load existing text answer if switching back to a question
      const questionId = sessionState.questions[index]?.id;
      const existingResponse = sessionState.responses.get(questionId);
      if (existingResponse?.textAnswer) {
        setTextAnswer(existingResponse.textAnswer);
      } else {
        setTextAnswer('');
      }

      // Auto-speak the new question if enabled
      if (autoSpeak && sessionState.questions[index]) {
        setTimeout(async () => {
          try {
            await speakQuestion(sessionState.questions[index].question);
          } catch (error) {
            console.log('Auto-speak failed for question', index + 1);
          }
        }, 500);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-xl">Preparing your interview questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
  const hasRecording = sessionState.responses.has(currentQuestion?.id || 0);
  const hasFeedback = sessionState.feedback.has(currentQuestion?.id || 0);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Subtle Background Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/applicant/practice" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
              <span className="font-medium">Practice Home</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Auto-speak Toggle */}
              <Button
                onClick={() => setAutoSpeak(!autoSpeak)}
                size="sm"
                variant="ghost"
                className={`gap-2 transition-all ${
                  autoSpeak
                    ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                } rounded-lg`}
                title="Toggle auto-speak for questions"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Auto-speak: {autoSpeak ? 'On' : 'Off'}</span>
              </Button>

              <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 px-3 py-1.5">
                <Brain className="w-4 h-4 mr-2" />
                <span className="font-medium">AI Practice</span>
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">
              Question {sessionState.currentQuestionIndex + 1} of {sessionState.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-300">
              Completed: {sessionState.responses.size}/{sessionState.questions.length}
            </span>
          </div>
          <Progress
            value={(sessionState.responses.size / sessionState.questions.length) * 100}
            className="h-2 bg-white/5 rounded-full overflow-hidden"
          />
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/[0.02] backdrop-blur-xl border-white/10 mb-6 rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-3 text-white font-semibold">
                    Question {sessionState.currentQuestionIndex + 1}
                    {hasRecording && (
                      <Badge className="ml-3 bg-green-500/10 text-green-400 border border-green-500/30 px-2.5 py-0.5">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Answered
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1">
                    {currentQuestion?.type || 'General'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {/* Text-to-Speech Button */}
                  <Button
                    onClick={async () => {
                      if (isSpeaking) {
                        stopSpeaking();
                      } else if (currentQuestion) {
                        await speakQuestion(currentQuestion.question);
                      }
                    }}
                    size="sm"
                    variant="ghost"
                    className={`${
                      isSpeaking
                        ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    } transition-all rounded-lg`}
                    title={isSpeaking ? 'Stop speaking' : 'Listen to question'}
                  >
                    {isSpeaking ? (
                      <StopCircle className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isSpeaking && (
                  <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-3 bg-blue-400 rounded-full"
                          animate={{
                            scaleY: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                    <span className="font-medium">Reading question...</span>
                  </div>
                )}
                <p className="text-lg leading-relaxed text-gray-100">{currentQuestion?.question}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer Input Controls */}
        <Card className="bg-white/[0.02] backdrop-blur-xl border-white/10 mb-6 rounded-2xl overflow-hidden shadow-2xl">
          <CardContent className="p-6">
            <div className="space-y-5">
              {/* Response Mode Tabs */}
              <div className="flex items-center gap-3 p-1 bg-white/5 rounded-xl border border-white/10">
                <Button
                  onClick={() => setResponseMode('text')}
                  variant="ghost"
                  className={`flex-1 transition-all rounded-lg ${
                    responseMode === 'text'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                      : 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span className="font-medium">Type Answer</span>
                </Button>
                <Button
                  onClick={() => setResponseMode('voice')}
                  variant="ghost"
                  className={`flex-1 transition-all rounded-lg ${
                    responseMode === 'voice'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                      : 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  <span className="font-medium">Record Answer</span>
                </Button>
              </div>

              {/* Show saved answer if exists */}
              {hasRecording && sessionState.responses.get(currentQuestion?.id || 0)?.transcript && (
                <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-400 mb-2 text-sm">Your Saved Answer</p>
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {sessionState.responses.get(currentQuestion?.id || 0)?.transcript}
                      </p>
                      {sessionState.responses.get(currentQuestion?.id || 0)?.duration && (
                        <p className="text-sm text-gray-500 mt-3">
                          Duration: {sessionState.responses.get(currentQuestion?.id || 0)?.duration}s
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Text Input Mode */}
              {responseMode === 'text' && !hasRecording && (
                <div className="space-y-4">
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-48 px-4 py-4 bg-white/5 border border-white/10 rounded-xl
                             focus:border-blue-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-blue-500/20
                             text-white placeholder-gray-500 transition-all
                             resize-none text-base leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 font-medium">{textAnswer.length} characters</span>
                    <span className="text-gray-500">Minimum 50 characters recommended</span>
                  </div>
                  <Button
                    onClick={saveTextAnswer}
                    size="lg"
                    disabled={!textAnswer.trim()}
                    className="w-full h-12 rounded-xl font-semibold transition-all
                             bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                             text-white shadow-lg shadow-blue-500/20
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Save Answer
                  </Button>
                </div>
              )}

              {/* Voice Recording Mode */}
              {responseMode === 'voice' && (
                <div className="text-center space-y-4">
                  {/* Microphone Permission Alert */}
                  {!hasMediaPermission && (
                    <Alert className="mb-4 bg-orange-500/10 border-orange-500/30">
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                      <AlertDescription className="text-orange-200">
                        Microphone access is required to record your answers. Click the button below to enable it.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Audio Level Indicator */}
                  {isRecording && (
                    <div className="flex items-center justify-center gap-1 h-12">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-full"
                          animate={{
                            height: audioLevel > i * 5 ? `${20 + Math.random() * 30}px` : '4px'
                          }}
                          transition={{ duration: 0.1 }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Recording Time */}
                  <div className="text-3xl font-mono">
                    {formatTime(recordingTime)}
                  </div>

                  {/* Recording Button */}
                  <div className="flex items-center justify-center gap-4">
                    {/* Show microphone permission button if no permission */}
                    {!hasMediaPermission ? (
                      <Button
                        onClick={requestMediaPermission}
                        size="lg"
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90"
                      >
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Enable Microphone Access
                      </Button>
                    ) : !isRecording ? (
                      <Button
                        onClick={startRecording}
                        size="lg"
                        disabled={!hasMediaPermission || isSubmitting || hasRecording}
                        className={`${
                          hasRecording
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90'
                        }`}
                      >
                        {hasRecording ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Already Recorded
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5 mr-2" />
                            Start Recording
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        size="lg"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <StopCircle className="w-5 h-5 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                  </div>

                  {/* Status Messages for Voice Mode */}
                  {!hasMediaPermission && (
                    <Alert className="bg-yellow-500/10 border-yellow-500/30">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <AlertDescription className="text-yellow-200">
                        Please allow microphone access to record your answer
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Submit All Button - Shows when at least one question has a response */}
              {sessionState.responses.size > 0 && !isRecording && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-3">
                    {sessionState.responses.size} of {sessionState.questions.length} questions answered
                  </p>
                  <Button
                    onClick={submitAllAnswers}
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit {sessionState.responses.size === sessionState.questions.length ? 'All' : sessionState.responses.size} Answer{sessionState.responses.size > 1 ? 's' : ''} for Evaluation
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigateToQuestion(sessionState.currentQuestionIndex - 1)}
            disabled={sessionState.currentQuestionIndex === 0}
            variant="outline"
            className="bg-white/5 border-white/20 hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {sessionState.questions.map((_, index) => (
              <Button
                key={index}
                onClick={() => navigateToQuestion(index)}
                size="sm"
                variant={index === sessionState.currentQuestionIndex ? 'default' : 'outline'}
                className={
                  index === sessionState.currentQuestionIndex
                    ? 'bg-blue-600'
                    : sessionState.feedback.has(sessionState.questions[index].id)
                    ? 'bg-green-600/20 border-green-500/50'
                    : 'bg-white/5 border-white/20'
                }
              >
                {index + 1}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => {
              if (sessionState.currentQuestionIndex < sessionState.questions.length - 1) {
                navigateToQuestion(sessionState.currentQuestionIndex + 1);
              } else {
                // Don't navigate to feedback yet - user needs to submit recordings first
                if (sessionState.responses.size === sessionState.questions.length) {
                  toast({
                    title: 'All Questions Recorded',
                    description: 'Great! Now submit all your recordings for AI evaluation using the button above.',
                    variant: 'default'
                  });
                } else {
                  toast({
                    title: 'Complete All Questions',
                    description: `Please record answers for all questions. You have recorded ${sessionState.responses.size} out of ${sessionState.questions.length} questions.`,
                    variant: 'default'
                  });
                }
              }
            }}
            variant="outline"
            className="bg-white/5 border-white/20 hover:bg-white/10"
          >
            {sessionState.currentQuestionIndex === sessionState.questions.length - 1 ? 'Finish Review' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}