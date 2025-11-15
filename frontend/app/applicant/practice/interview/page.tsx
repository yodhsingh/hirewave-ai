'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mic, MicOff, Play, Pause, Send, Clock, CheckCircle,
  AlertCircle, ChevronRight, ChevronLeft, Loader2,
  Brain, Sparkles, Home, Volume2, StopCircle
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
  responses: Map<number, { audioBlob: Blob; duration: number; transcript?: string }>;
  feedback: Map<number, any>;
}

// Module-level flag to prevent duplicate initialization in StrictMode
let isSessionInitializing = false;

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

  // Get session config from localStorage or URL params
  useEffect(() => {
    const initSession = async () => {
      // Prevent double initialization using module-level flag
      if (isSessionInitializing || sessionState.sessionId) {
        return;
      }
      isSessionInitializing = true;

      try {
        // Get config from localStorage (set by the config page)
        const configStr = localStorage.getItem('practiceSessionConfig');
        const config = configStr ? JSON.parse(configStr) : {
          interview_type: 'mixed',
          difficulty: 'medium',
          questions_count: 3
        };

        // Clear the config after reading
        localStorage.removeItem('practiceSessionConfig');

        // Start a new session
        const response = await backendClient.startPracticeSession(config);

        if (response.success && response.data) {
          setSessionState({
            sessionId: response.data.session_id,
            questions: response.data.questions,
            currentQuestionIndex: 0,
            responses: new Map(),
            feedback: new Map(),
          });

          // Don't auto-speak on initial load - browsers often block this
          // User can click the speaker button or it will auto-speak when navigating

          // Reset flag after successful initialization
          isSessionInitializing = false;
        } else {
          isSessionInitializing = false;
          throw new Error(response.error?.message || 'Failed to start session');
        }
      } catch (error) {
        console.error('Failed to start practice session:', error);
        isSessionInitializing = false;
        toast({
          title: 'Error',
          description: 'Failed to start practice session. Please try again.',
          variant: 'destructive',
        });
        router.push('/applicant/practice');
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
    requestMediaPermission();

    // Cleanup function
    return () => {
      // Reset the module flag when component unmounts
      isSessionInitializing = false;
    };
  }, []); // Empty dependency array - run only once on mount

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

  // Submit all recordings for complete evaluation
  const submitAllAnswers = async () => {
    if (!sessionState.sessionId || sessionState.responses.size === 0) {
      toast({
        title: 'No recordings found',
        description: 'Please record your answers before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare FormData with all recordings
      const formData = new FormData();
      const responsesArray = [];

      // Add each recording to FormData
      sessionState.responses.forEach((response, questionId) => {
        const question = sessionState.questions.find(q => q.id === questionId);
        if (question) {
          formData.append(`audio_${questionId}`, response.audioBlob, `question_${questionId}.webm`);
          responsesArray.push({
            question_id: questionId,
            duration: response.duration
          });
        }
      });

      // Add metadata
      formData.append('session_id', sessionState.sessionId.toString());
      formData.append('responses', JSON.stringify(responsesArray));

      // Submit all recordings for evaluation
      const result = await backendClient.completePracticeSession(
        sessionState.sessionId,
        formData
      );

      if (result.success && result.data) {
        // Display overall feedback
        toast({
          title: 'Evaluation Complete!',
          description: `Overall Score: ${result.data.overall_score}/100. Redirecting to detailed feedback...`,
          variant: 'default'
        });

        // Store feedback
        setSessionState(prev => ({
          ...prev,
          feedback: new Map([[sessionState.sessionId!, result.data]])
        }));

        // Navigate to feedback page after a short delay
        setTimeout(() => {
          router.push(`/applicant/practice/feedback?sessionId=${sessionState.sessionId}`);
        }, 2000);
      } else {
        throw new Error(result.error?.message || 'Failed to submit for evaluation');
      }
    } catch (error) {
      console.error('Failed to submit session:', error);
      toast({
        title: 'Submission Error',
        description: 'Failed to submit for evaluation. Please try again.',
        variant: 'destructive'
      });
    } finally {
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

  // Navigation between questions
  const navigateToQuestion = async (index: number) => {
    if (index >= 0 && index < sessionState.questions.length) {
      // Stop any ongoing speech when changing questions
      stopSpeaking();

      setSessionState(prev => ({ ...prev, currentQuestionIndex: index }));
      setRecordingTime(0);
      setAudioLevel(0);

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
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients.bgPrimary}`} />
        <div className={`absolute inset-0 bg-gradient-to-tr ${gradients.bgSecondary}`} />
        <FloatingParticles />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-800 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/applicant/practice" className="flex items-center gap-2 hover:opacity-80">
              <Home className="w-5 h-5" />
              <span className="font-semibold">Practice Home</span>
            </Link>

            <div className="flex items-center gap-4">
              {/* Auto-speak Toggle */}
              <Button
                onClick={() => setAutoSpeak(!autoSpeak)}
                size="sm"
                variant="ghost"
                className={`gap-2 ${
                  autoSpeak
                    ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle auto-speak for questions"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden md:inline">Auto-speak: {autoSpeak ? 'On' : 'Off'}</span>
                <span className="md:hidden">{autoSpeak ? 'On' : 'Off'}</span>
              </Button>

              <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                <Brain className="w-4 h-4 mr-2" />
                AI Practice Interview
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Question {sessionState.currentQuestionIndex + 1} of {sessionState.questions.length}
            </span>
            <span className="text-sm text-gray-400">
              Recorded: {sessionState.responses.size}/{sessionState.questions.length}
            </span>
          </div>
          <Progress
            value={(sessionState.responses.size / sessionState.questions.length) * 100}
            className="h-2 bg-white/10"
          />
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2 text-white">
                    Question {sessionState.currentQuestionIndex + 1}
                    {hasRecording && (
                      <Badge className="ml-3 bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Recorded
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
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
                        ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    } transition-all`}
                    title={isSpeaking ? 'Stop speaking' : 'Listen to question'}
                  >
                    {isSpeaking ? (
                      <StopCircle className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  {hasFeedback && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isSpeaking && (
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
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
                    <span>Speaking question...</span>
                  </div>
                )}
                <p className="text-lg leading-relaxed text-white">{currentQuestion?.question}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recording Controls */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 mb-6">
          <CardContent className="p-6">
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

              {/* Show transcript if question is already recorded */}
              {hasRecording && sessionState.responses.get(currentQuestion?.id || 0)?.transcript && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-400 mb-2">Your Recorded Answer:</p>
                      <p className="text-gray-200">
                        {sessionState.responses.get(currentQuestion?.id || 0)?.transcript}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Duration: {sessionState.responses.get(currentQuestion?.id || 0)?.duration}s
                      </p>
                    </div>
                  </div>
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

                {/* Show Submit All button when all questions are recorded */}
                {sessionState.responses.size === sessionState.questions.length && !isRecording && (
                  <Button
                    onClick={submitAllAnswers}
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit All for Evaluation
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Status Messages */}
              {!hasMediaPermission && (
                <Alert className="bg-yellow-500/10 border-yellow-500/30">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200">
                    Please allow microphone access to record your answer
                  </AlertDescription>
                </Alert>
              )}

              {hasRecording && !hasFeedback && (
                <p className="text-green-400 text-sm">
                  ✓ Answer recorded. Click submit to get AI feedback.
                </p>
              )}

              {hasFeedback && (
                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <AlertDescription className="text-green-200">
                    Answer submitted! Score: {sessionState.feedback.get(currentQuestion?.id || 0)?.score}/100
                  </AlertDescription>
                </Alert>
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