'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mic, MicOff, Send, Clock, CheckCircle,
  AlertCircle, ChevronRight, ChevronLeft, Loader2,
  Briefcase, Sparkles, Home, Volume2, StopCircle, MessageSquare,
  Building, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { gradients } from '@/lib/theme';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: number;
  question: string;
  type: string;
  timeLimit: number | null;
  order: number;
  context?: string | null;
  options?: string[] | null;
  codeTemplate?: string | null;
  correctAnswer?: string | null;
  required?: boolean;
}

interface JobData {
  id: number;
  title: string;
  description: string;
  department: string;
  companyName?: string;
}

interface SessionState {
  job: JobData | null;
  questions: Question[];
  currentQuestionIndex: number;
  responses: Map<number, { content: string; duration?: number; type: string }>;
}

export default function ActualInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [sessionState, setSessionState] = useState<SessionState>({
    job: null,
    questions: [],
    currentQuestionIndex: 0,
    responses: new Map(),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [responseMode, setResponseMode] = useState<'text' | 'voice'>('text');
  const [textAnswer, setTextAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load interview questions on mount
  useEffect(() => {
    const loadInterview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:8000/api/v1/interviews/${token}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.detail || data.message || 'Failed to load interview');
        }

        const responseData = data.data;

        // New API structure: questions are in data.questions, job info in data.job
        const questions = responseData.questions || [];
        const jobInfo = responseData.job || {};

        if (!questions || questions.length === 0) {
          throw new Error('No interview questions found for this job');
        }

        setSessionState({
          job: {
            id: jobInfo.id,
            title: jobInfo.title,
            description: jobInfo.description,
            department: jobInfo.department,
            companyName: jobInfo.companyName
          },
          questions: questions,
          currentQuestionIndex: 0,
          responses: new Map(),
        });

        toast({
          title: 'Interview Ready',
          description: `${questions.length} AI-personalized questions to answer`,
          variant: 'default',
        });
      } catch (error: any) {
        console.error('Failed to load interview:', error);
        setError(error.message || 'Failed to load interview');
        toast({
          title: 'Error',
          description: error.message || 'Failed to load interview questions',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadInterview();
      requestMediaPermission();
    }
  }, [token]);

  // Request microphone permission
  const requestMediaPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media recording not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      microphone.connect(analyser);

      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        if (isRecording) {
          requestAnimationFrame(checkAudioLevel);
        }
      };

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }

      const mediaRecorderOptions = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        checkAudioLevel();
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
        if (currentQuestion) {
          toast({
            title: 'Processing...',
            description: 'Transcribing your answer...',
            variant: 'default'
          });

          try {
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

            setSessionState(prev => ({
              ...prev,
              responses: new Map(prev.responses).set(currentQuestion.id, {
                content: transcript,
                duration,
                type: 'phone'
              })
            }));

            toast({
              title: 'Answer Recorded',
              description: 'Your response has been transcribed.',
              variant: 'default'
            });
          } catch (error) {
            console.error('Transcription error:', error);
            setSessionState(prev => ({
              ...prev,
              responses: new Map(prev.responses).set(currentQuestion.id, {
                content: 'Audio recording saved',
                duration,
                type: 'phone'
              })
            }));
          }
        }

        audioChunksRef.current = [];
      };

      mediaRecorderRef.current = mediaRecorder;
      setHasMediaPermission(true);
    } catch (error: any) {
      console.error('Failed to get media permission:', error);
      setHasMediaPermission(false);
    }
  };

  // Recording controls
  const startRecording = () => {
    if (!mediaRecorderRef.current || isRecording) return;

    audioChunksRef.current = [];
    startTimeRef.current = Date.now();
    mediaRecorderRef.current.start();
    setIsRecording(true);

    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    (window as any).recordingTimer = timer;
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setRecordingTime(0);

    if ((window as any).recordingTimer) {
      clearInterval((window as any).recordingTimer);
    }
  };

  // Save text answer
  const saveTextAnswer = async () => {
    if (!textAnswer.trim()) {
      toast({
        title: 'Empty Answer',
        description: 'Please type your answer before saving.',
        variant: 'destructive',
      });
      return;
    }

    const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
    if (!currentQuestion) return;

    // Save to backend using new save-answer endpoint
    try {
      const response = await fetch(`http://localhost:8000/api/v1/interviews/${token}/save-answer/${currentQuestion.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer_text: textAnswer.trim(),
          duration: 0
        }),
      });

      if (response.ok) {
        setSessionState(prev => ({
          ...prev,
          responses: new Map(prev.responses).set(currentQuestion.id, {
            content: textAnswer.trim(),
            type: 'text'
          })
        }));

        toast({
          title: 'Answer Saved',
          description: 'Your answer has been saved.',
          variant: 'default',
        });
      } else {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to save answer');
      }
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save answer.',
        variant: 'destructive',
      });
    }
  };

  // Submit all answers
  const submitAllAnswers = async () => {
    if (!sessionState.job || sessionState.responses.size === 0) {
      toast({
        title: 'No Answers',
        description: 'Please answer at least one question before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit interview (answers already saved via save-answer endpoint)
      const result = await fetch(`http://localhost:8000/api/v1/interviews/${token}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const data = await result.json();

      if (result.ok && data.success) {
        const responseData = data.data;
        toast({
          title: 'Interview Submitted!',
          description: `AI evaluation complete. Score: ${responseData.overallScore || 'Processing'}`,
          variant: 'default'
        });

        setTimeout(() => {
          router.push('/applicant/dashboard');
        }, 2000);
      } else {
        throw new Error(data.detail || 'Failed to submit interview');
      }
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'An error occurred while submitting.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Text-to-speech
  const speakQuestion = async (questionText: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setIsSpeaking(true);

      const response = await fetch('http://localhost:8000/api/v1/practice/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: questionText })
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  // Navigation
  const navigateToQuestion = (index: number) => {
    if (!sessionState.job || sessionState.questions.length === 0) return;
    if (index >= 0 && index < sessionState.questions.length) {
      stopSpeaking();
      setSessionState(prev => ({ ...prev, currentQuestionIndex: index }));
      setRecordingTime(0);
      setAudioLevel(0);

      const questionId = sessionState.questions[index]?.id;
      const existingResponse = sessionState.responses.get(questionId);
      if (existingResponse?.content) {
        setTextAnswer(existingResponse.content);
      } else {
        setTextAnswer('');
      }

      if (autoSpeak) {
        setTimeout(() => {
          speakQuestion(sessionState.questions[index].question);
        }, 500);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-xl">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !sessionState.job) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Unable to Load Interview</h2>
            <p className="text-gray-400 mb-6">{error || 'Invalid or expired interview link'}</p>
            <Button
              onClick={() => router.push('/applicant/dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
  const hasResponse = sessionState.responses.has(currentQuestion?.id || 0);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/applicant/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setAutoSpeak(!autoSpeak)}
                size="sm"
                variant="ghost"
                className={`gap-2 transition-all ${
                  autoSpeak
                    ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                } rounded-lg`}
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Auto-speak: {autoSpeak ? 'On' : 'Off'}</span>
              </Button>

              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 px-3 py-1.5">
                <Briefcase className="w-4 h-4 mr-2" />
                <span className="font-medium">Job Interview</span>
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Job Info Banner */}
      <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Building className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{sessionState.job.title}</h2>
              <p className="text-sm text-gray-400">{sessionState.job.department} {sessionState.job.companyName ? `• ${sessionState.job.companyName}` : ''}</p>
            </div>
          </div>
        </div>
      </div>

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
                    {hasResponse && (
                      <Badge className="ml-3 bg-green-500/10 text-green-400 border border-green-500/30 px-2.5 py-0.5">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Answered
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1">
                    {currentQuestion?.type || 'General'}
                  </Badge>
                  {currentQuestion?.timeLimit && (
                    <Badge className="ml-2 bg-orange-500/10 text-orange-300 border border-orange-500/30 px-3 py-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {currentQuestion.timeLimit}s limit
                    </Badge>
                  )}
                </div>
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
                >
                  {isSpeaking ? <StopCircle className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
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
                          animate={{ scaleY: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
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

        {/* Answer Input */}
        <Card className="bg-white/[0.02] backdrop-blur-xl border-white/10 mb-6 rounded-2xl overflow-hidden shadow-2xl">
          <CardContent className="p-6">
            <div className="space-y-5">
              {/* Response Mode Tabs - Hide for multiple choice questions */}
              {currentQuestion?.type !== 'MULTIPLE_CHOICE' && (
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
              )}

              {/* Saved Answer Display */}
              {hasResponse && sessionState.responses.get(currentQuestion?.id || 0)?.content && (
                <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-400 mb-2 text-sm">Your Saved Answer</p>
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {sessionState.responses.get(currentQuestion?.id || 0)?.content}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Multiple Choice Question */}
              {currentQuestion?.type === 'MULTIPLE_CHOICE' && currentQuestion?.options && !hasResponse && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 mb-4">Select one option:</p>
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={async () => {
                        try {
                          const formData = new FormData();
                          formData.append('question_id', currentQuestion.id.toString());
                          formData.append('content', option);
                          formData.append('type', 'multiple_choice');

                          const response = await fetch(`http://localhost:8000/api/v1/interviews/${token}/responses`, {
                            method: 'POST',
                            body: formData,
                          });

                          if (response.ok) {
                            setSessionState(prev => ({
                              ...prev,
                              responses: new Map(prev.responses).set(currentQuestion.id, {
                                content: option,
                                type: 'multiple_choice'
                              })
                            }));
                            toast({
                              title: 'Answer Saved',
                              description: `Selected: ${option}`,
                              variant: 'default',
                            });
                          } else {
                            throw new Error('Failed to save answer');
                          }
                        } catch (error: any) {
                          toast({
                            title: 'Save Failed',
                            description: error.message || 'Failed to save answer.',
                            variant: 'destructive',
                          });
                        }
                      }}
                      variant="outline"
                      className="w-full justify-start text-left p-4 h-auto bg-white/5 border-white/20
                               hover:bg-blue-600/20 hover:border-blue-500/50 transition-all rounded-xl"
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg mr-3 text-sm font-semibold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-white">{option}</span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Text Input Mode - Only show for non-multiple-choice questions */}
              {currentQuestion?.type !== 'MULTIPLE_CHOICE' && responseMode === 'text' && !hasResponse && (
                <div className="space-y-4">
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-48 px-4 py-4 bg-white/5 border border-white/10 rounded-xl
                             focus:border-blue-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-blue-500/20
                             text-white placeholder-gray-500 transition-all resize-none text-base leading-relaxed"
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
                             text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Save Answer
                  </Button>
                </div>
              )}

              {/* Voice Recording Mode - Only show for non-multiple-choice questions */}
              {currentQuestion?.type !== 'MULTIPLE_CHOICE' && responseMode === 'voice' && (
                <div className="text-center space-y-4">
                  {!hasMediaPermission && (
                    <Alert className="mb-4 bg-orange-500/10 border-orange-500/30">
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                      <AlertDescription className="text-orange-200">
                        Microphone access is required. Click below to enable.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isRecording && (
                    <div className="flex items-center justify-center gap-1 h-12">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-full"
                          animate={{ height: audioLevel > i * 5 ? `${20 + Math.random() * 30}px` : '4px' }}
                          transition={{ duration: 0.1 }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="text-3xl font-mono">{formatTime(recordingTime)}</div>

                  <div className="flex items-center justify-center gap-4">
                    {!hasMediaPermission ? (
                      <Button
                        onClick={requestMediaPermission}
                        size="lg"
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90"
                      >
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Enable Microphone
                      </Button>
                    ) : !isRecording ? (
                      <Button
                        onClick={startRecording}
                        size="lg"
                        disabled={hasResponse}
                        className={`${
                          hasResponse
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90'
                        }`}
                      >
                        {hasResponse ? (
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
                </div>
              )}

              {/* Submit All Button */}
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
                        Submitting Interview...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Interview for AI Evaluation
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
                    : sessionState.responses.has(sessionState.questions[index].id)
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
              }
            }}
            disabled={sessionState.currentQuestionIndex === sessionState.questions.length - 1}
            variant="outline"
            className="bg-white/5 border-white/20 hover:bg-white/10"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
