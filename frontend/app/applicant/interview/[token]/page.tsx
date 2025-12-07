'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mic, Send, Clock, CheckCircle,
  AlertCircle, ChevronRight, ChevronLeft, Loader2,
  Briefcase, Home, Volume2, StopCircle,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useCameraStore } from '@/lib/store/cameraStore';
import { backendClient } from '@/lib/api/backend-client';

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
  const currentQuestionIndexRef = useRef<number>(0);  // Track current question for async callbacks
  const sessionStateRef = useRef<SessionState | null>(null);  // Track session state for async callbacks

  const [sessionState, setSessionState] = useState<SessionState>({
    job: null,
    questions: [],
    currentQuestionIndex: 0,
    responses: new Map(),
  });
  
  // Keep refs in sync with state for use in async callbacks
  useEffect(() => {
    sessionStateRef.current = sessionState;
    currentQuestionIndexRef.current = sessionState.currentQuestionIndex;
  }, [sessionState]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);  // Track if user has entered fullscreen and started
  const [interviewTerminated, setInterviewTerminated] = useState(false);  // Track if interview was force-terminated
  const [interviewSubmitted, setInterviewSubmitted] = useState(false);  // Track if interview has been successfully submitted
  const interviewContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoSubmittedRef = useRef(false);  // Prevent multiple auto-submits
  
  // Proctoring state - local camera stream (not from store since no setup page)
  const [localCameraStream, setLocalCameraStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);  // Track when video is ready for capture
  const { cheatingDetected, setCheatingDetected } = useCameraStore();
  const [isProctoringActive, setIsProctoringActive] = useState(false);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const proctoringDoneRef = useRef(false);  // Track if cheating already detected

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
      requestCameraPermission();
    }
  }, [token]);

  // Request camera permission for proctoring
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      console.log('📷 Camera permission granted, stream active:', stream.active);
      console.log('📷 Video tracks:', stream.getVideoTracks().map(t => ({ label: t.label, enabled: t.enabled, readyState: t.readyState })));
      setLocalCameraStream(stream);
      setHasCameraPermission(true);
    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasCameraPermission(false);
      toast({
        title: 'Camera Required',
        description: 'Camera access is required for proctoring during the interview. Please allow camera access and try again.',
        variant: 'destructive',
      });
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  // Initialize hidden video for proctoring with camera stream
  // This needs to run whenever localCameraStream changes OR when loading completes (so video element exists)
  useEffect(() => {
    // Only try to connect when we have a stream AND we're not loading (so video element exists)
    if (!localCameraStream || isLoading) {
      console.log('📹 Skipping video connection:', { hasStream: !!localCameraStream, isLoading });
      return;
    }
    
    if (!hiddenVideoRef.current) {
      console.log('📹 Video ref not available yet, will retry...');
      // Retry after a short delay to allow DOM to update
      const retryTimeout = setTimeout(() => {
        if (hiddenVideoRef.current && localCameraStream) {
          setupVideoElement(hiddenVideoRef.current, localCameraStream);
        }
      }, 100);
      return () => clearTimeout(retryTimeout);
    }
    
    setupVideoElement(hiddenVideoRef.current, localCameraStream);
  }, [localCameraStream, isLoading]);
  
  // Helper function to set up video element
  const setupVideoElement = (video: HTMLVideoElement, stream: MediaStream) => {
    console.log('📹 Connecting stream to video element...');
    
    // Reset video ready state
    setIsVideoReady(false);
    
    // Set up event handlers BEFORE setting srcObject
    video.onloadedmetadata = () => {
      console.log(`📹 Video metadata loaded: ${video.videoWidth}x${video.videoHeight}`);
    };
    
    video.onloadeddata = () => {
      console.log(`📹 Video data loaded, readyState: ${video.readyState}`);
    };
    
    video.oncanplay = () => {
      console.log(`📹 Video can play, dimensions: ${video.videoWidth}x${video.videoHeight}`);
      setIsVideoReady(true);
    };
    
    video.onerror = (e) => {
      console.error('❌ Video error:', e);
    };
    
    // Now connect the stream
    video.srcObject = stream;
    
    // Try to play
    video.play()
      .then(() => console.log('▶️ Video playing'))
      .catch(err => console.error('❌ Video play failed:', err));
  };

  // Fullscreen management
  const enterFullscreen = async () => {
    try {
      if (interviewContainerRef.current && document.fullscreenElement === null) {
        await interviewContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
        console.log('🖥️ Entered fullscreen mode');
      }
    } catch (error) {
      console.warn('Fullscreen not supported or denied:', error);
    }
  };

  // Enter fullscreen when interview loads successfully
  useEffect(() => {
    if (!isLoading && sessionState.questions.length > 0 && hasCameraPermission && hasMediaPermission) {
      // Short delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        enterFullscreen();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, sessionState.questions.length, hasCameraPermission, hasMediaPermission]);

  // Handle fullscreen change events - AUTO SUBMIT if user exits after starting (but NOT after submission)
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isNowFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isNowFullscreen);
      
      // If user entered fullscreen for the first time, mark interview as started
      if (isNowFullscreen && !interviewStarted && sessionState.questions.length > 0) {
        console.log('🎬 Interview officially started - fullscreen entered');
        setInterviewStarted(true);
      }
      
      // If user exits fullscreen AFTER interview started, auto-submit immediately
      // BUT only if interview hasn't been successfully submitted yet
      if (!isNowFullscreen && interviewStarted && !hasAutoSubmittedRef.current && !interviewSubmitted) {
        console.log('🚨 User exited fullscreen after interview started - AUTO SUBMITTING');
        hasAutoSubmittedRef.current = true;
        await forceSubmitInterview('fullscreen_exit');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [sessionState.questions.length, interviewStarted, interviewSubmitted]);

  // Handle tab visibility change - AUTO SUBMIT if user switches tabs after starting (but NOT after submission)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && interviewStarted && !hasAutoSubmittedRef.current && !interviewSubmitted) {
        console.log('🚨 User switched tabs after interview started - AUTO SUBMITTING');
        hasAutoSubmittedRef.current = true;
        await forceSubmitInterview('tab_switch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [interviewStarted, interviewSubmitted]);

  // Run proctoring when question changes AND video is ready
  useEffect(() => {
    const runProctoring = async () => {
      // Skip if already done proctoring (cheating detected) or video not ready
      if (proctoringDoneRef.current || !isVideoReady || !hiddenVideoRef.current || !hiddenCanvasRef.current) {
        console.log('Proctoring skipped:', { 
          done: proctoringDoneRef.current, 
          videoReady: isVideoReady, 
          video: !!hiddenVideoRef.current,
          canvas: !!hiddenCanvasRef.current 
        });
        return;
      }

      const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
      if (!currentQuestion) return;

      const video = hiddenVideoRef.current;
      
      // Video should already be ready, but double check
      console.log(`📹 Video state: readyState: ${video.readyState}, dimensions: ${video.videoWidth}x${video.videoHeight}`);
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('❌ Video dimensions are 0, cannot capture');
        return;
      }
      
      // Small delay to ensure frame is rendered
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`✅ Video ready: ${video.videoWidth}x${video.videoHeight}, readyState: ${video.readyState}`);

      setIsProctoringActive(true);
      const images: string[] = [];
      const canvas = hiddenCanvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;
      
      console.log(`📸 Capturing frames: video ${video.videoWidth}x${video.videoHeight}`);

      // Capture 5 frames at 1-second intervals
      for (let i = 0; i < 5; i++) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL('image/jpeg', 0.8);
        images.push(frame);
        console.log(`📸 Frame ${i + 1} captured, size: ${frame.length} bytes`);
        
        if (i < 4) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Send to backend for analysis
      try {
        const response = await backendClient.analyzeProctoring(token, images, currentQuestion.id);
        
        if (response.success && response.data?.cheating_detected) {
          proctoringDoneRef.current = true;  // Stop future proctoring
          setCheatingDetected(true, {
            questionId: currentQuestion.id,
            reason: response.data.reason,
            confidence: response.data.confidence,
            evidenceType: response.data.evidence_type,
          });
          
          toast({
            title: 'Warning',
            description: 'Suspicious activity detected. This will be reviewed.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Proctoring analysis error:', error);
      } finally {
        setIsProctoringActive(false);
      }
    };

    // Only run proctoring when video is actually ready
    if (!isLoading && sessionState.questions.length > 0 && isVideoReady) {
      console.log('🎬 Starting proctoring - video is ready');
      runProctoring();
    }
  }, [sessionState.currentQuestionIndex, isLoading, sessionState.questions.length, isVideoReady, token]);

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

        // Use ref to get current question (avoids stale closure)
        const currentState = sessionStateRef.current;
        const currentQuestion = currentState?.questions[currentQuestionIndexRef.current];
        
        console.log('📼 Recording stopped, processing...');
        console.log(`   Question: ${currentQuestion?.id}, Duration: ${duration}s, Blob size: ${audioBlob.size} bytes`);
        
        if (currentQuestion && audioBlob.size > 0) {
          // Show transcribing state
          setIsTranscribing(true);
          
          toast({
            title: 'Transcribing...',
            description: 'Your answer is being processed by AI. Please wait.',
            variant: 'default'
          });

          try {
            console.log('📤 Sending audio to Gemini for transcription...');
            // Use the new Gemini-based transcription endpoint
            const response = await backendClient.transcribeAudio(token, audioBlob);
            console.log('📥 Transcription response:', response);

            let transcript = 'Recording saved (transcription pending)';
            if (response.success && response.data?.transcript) {
              transcript = response.data.transcript;
            }

            // Save to local state using the question ID from ref
            const questionId = currentQuestion.id;
            setSessionState(prev => ({
              ...prev,
              responses: new Map(prev.responses).set(questionId, {
                content: transcript,
                duration,
                type: 'phone'
              })
            }));

            // Also save to backend
            await fetch(`http://localhost:8000/api/v1/interviews/${token}/save-answer/${questionId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ answer_text: transcript, duration }),
            });

            toast({
              title: 'Answer Saved!',
              description: 'Your response has been transcribed and saved successfully.',
              variant: 'default'
            });
            
            // Auto-advance to next question if not last
            // Use ref to get current index to avoid stale closure
            const currentIdx = currentQuestionIndexRef.current;
            const totalQuestions = sessionStateRef.current?.questions.length || 0;
            
            if (currentIdx < totalQuestions - 1) {
              setTimeout(() => {
                setSessionState(prev => ({ 
                  ...prev, 
                  currentQuestionIndex: prev.currentQuestionIndex + 1 
                }));
                setRecordingTime(0);
                setAudioLevel(0);
              }, 1500);
            }
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
            
            toast({
              title: 'Transcription Failed',
              description: 'Could not transcribe audio. Your recording was saved.',
              variant: 'destructive'
            });
          } finally {
            setIsTranscribing(false);
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

  // Force submit interview (when user violates proctoring rules)
  const forceSubmitInterview = async (reason: 'fullscreen_exit' | 'tab_switch') => {
    console.log(`🚨 Force submitting interview due to: ${reason}`);
    setInterviewTerminated(true);
    setIsSubmitting(true);
    
    try {
      // Exit fullscreen if still in it
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }

      // Submit whatever answers we have
      const result = await fetch(`http://localhost:8000/api/v1/interviews/${token}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force_submit: true,
          termination_reason: reason
        })
      });

      const data = await result.json();

      if (result.ok && data.success) {
        toast({
          title: 'Interview Terminated',
          description: reason === 'fullscreen_exit' 
            ? 'You exited fullscreen mode. Your interview has been automatically submitted.'
            : 'You switched tabs during the interview. Your interview has been automatically submitted.',
          variant: 'destructive'
        });
      } else {
        // Even if submit fails, mark as terminated
        toast({
          title: 'Interview Terminated',
          description: 'Your interview session has ended due to a policy violation.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Force submit error:', error);
      toast({
        title: 'Interview Terminated',
        description: 'Your interview session has ended.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
      // Redirect after showing message
      setTimeout(() => {
        router.push('/applicant/dashboard');
      }, 3000);
    }
  };

  // Submit all answers
  const submitAllAnswers = async () => {
    // Check if ALL questions are answered
    const unansweredCount = sessionState.questions.filter(q => !sessionState.responses.has(q.id)).length;
    
    if (unansweredCount > 0) {
      toast({
        title: 'Incomplete Interview',
        description: `Please answer all questions before submitting. You have ${unansweredCount} unanswered question(s).`,
        variant: 'destructive'
      });
      return;
    }

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
        
        // Mark interview as successfully submitted BEFORE exiting fullscreen
        // This prevents the fullscreen exit handler from triggering a false violation
        setInterviewSubmitted(true);
        
        // Show cheating warning if detected
        let description = `AI evaluation complete. Score: ${responseData.overallScore || 'Processing'}`;
        if (responseData.cheatingDetected) {
          description += ' (Penalty applied for suspicious activity)';
        }
        
        toast({
          title: 'Interview Submitted!',
          description,
          variant: 'default'
        });

        // Exit fullscreen before redirecting
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        }

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

  // Navigation - restrict forward navigation to only answered questions
  const navigateToQuestion = (index: number) => {
    if (!sessionState.job || sessionState.questions.length === 0) return;
    if (index >= 0 && index < sessionState.questions.length) {
      // Only allow going back or to the next unanswered question
      // Check if trying to go forward beyond answered questions
      if (index > sessionState.currentQuestionIndex) {
        // Check if current question is answered before allowing forward navigation
        const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
        if (currentQuestion && !sessionState.responses.has(currentQuestion.id)) {
          toast({
            title: 'Answer Required',
            description: 'Please answer the current question before moving to the next one.',
            variant: 'destructive'
          });
          return;
        }
      }
      
      stopSpeaking();
      setSessionState(prev => ({ ...prev, currentQuestionIndex: index }));
      setRecordingTime(0);
      setAudioLevel(0);

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
  
  // Check if all questions are answered
  const allQuestionsAnswered = sessionState.questions.every(q => sessionState.responses.has(q.id));

  return (
    <div ref={interviewContainerRef} className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Hidden video and canvas for proctoring - NOT VISIBLE TO USER */}
      <video
        ref={hiddenVideoRef}
        autoPlay
        playsInline
        muted
        width={640}
        height={480}
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}
      />
      <canvas
        ref={hiddenCanvasRef}
        width={640}
        height={480}
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}
      />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" />
      </div>

      {/* Fullscreen Warning Banner - Show when NOT in fullscreen */}
      {!isFullscreen && sessionState.questions.length > 0 && !interviewTerminated && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 max-w-lg mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Fullscreen Required</h2>
              <p className="text-gray-400 mb-6">
                {interviewStarted 
                  ? "⚠️ You exited fullscreen mode. The interview will be submitted automatically."
                  : "To maintain interview integrity, you must enter fullscreen mode to view and answer questions. Exiting fullscreen or switching tabs will automatically submit your interview."}
              </p>
              {!interviewStarted && (
                <>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                    <h3 className="text-red-400 font-semibold mb-2">⚠️ Important Rules:</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Do NOT exit fullscreen during the interview</li>
                      <li>• Do NOT switch tabs or windows</li>
                      <li>• Violations will auto-submit your interview</li>
                      <li>• You cannot re-attempt after termination</li>
                    </ul>
                  </div>
                  <Button
                    onClick={enterFullscreen}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 text-lg"
                  >
                    Enter Fullscreen & Start Interview
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interview Terminated Screen */}
      {interviewTerminated && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 max-w-lg mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-red-400">Interview Terminated</h2>
              <p className="text-gray-400 mb-6">
                Your interview has been automatically submitted due to a policy violation. 
                You cannot re-attempt this interview.
              </p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cheating Warning Banner */}
      {cheatingDetected && (
        <div className={`fixed ${!isFullscreen ? 'top-12' : 'top-0'} left-0 right-0 z-50 bg-red-600/90 backdrop-blur-sm py-3 px-4`}>
          <div className="container mx-auto flex items-center justify-center gap-2 text-white">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Warning: Suspicious activity detected. This will be reviewed by the hiring team.</span>
          </div>
        </div>
      )}

      {/* Proctoring Active Indicator (small, subtle) */}
      {isProctoringActive && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Verifying...</span>
        </div>
      )}

      {/* Fullscreen Indicator */}
      {isFullscreen && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Fullscreen Mode</span>
        </div>
      )}

      {/* Navigation */}
      <nav className={`relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl ${cheatingDetected ? 'mt-12' : ''}`}>
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
              {/* Voice Recording Info Banner */}
              {currentQuestion?.type !== 'MULTIPLE_CHOICE' && !hasResponse && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-blue-300">Voice Recording Only</p>
                      <p className="text-sm text-gray-400">Record your answer using the microphone. Your response will be transcribed by AI.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Answer Display (Read-only) */}
              {hasResponse && sessionState.responses.get(currentQuestion?.id || 0)?.content && (
                <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-400 mb-2 text-sm">Your Saved Answer (Read-only)</p>
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {sessionState.responses.get(currentQuestion?.id || 0)?.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">To change your answer, record a new response below.</p>
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
                        } catch (error: unknown) {
                          const errorMessage = error instanceof Error ? error.message : 'Failed to save answer.';
                          toast({
                            title: 'Save Failed',
                            description: errorMessage,
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

              {/* Voice Recording Mode - ONLY option for non-multiple-choice questions */}
              {currentQuestion?.type !== 'MULTIPLE_CHOICE' && (
                <div className="text-center space-y-4">
                  {!hasMediaPermission && (
                    <Alert className="mb-4 bg-orange-500/10 border-orange-500/30">
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                      <AlertDescription className="text-orange-200">
                        Microphone access is required. Click below to enable.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Transcribing State */}
                  {isTranscribing && (
                    <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
                        <div>
                          <p className="text-blue-300 font-semibold text-lg">Transcribing with Gemini AI...</p>
                          <p className="text-gray-400 text-sm mt-1">Converting your speech to text. Please wait.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recording Visualization */}
                  {isRecording && !isTranscribing && (
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

                  {/* Timer - only show when recording or not yet answered */}
                  {!isTranscribing && !hasResponse && (
                    <div className="text-3xl font-mono">{formatTime(recordingTime)}</div>
                  )}

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
                    ) : isTranscribing ? (
                      <Button
                        size="lg"
                        disabled
                        className="bg-blue-600/50 cursor-wait"
                      >
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Transcribing...
                      </Button>
                    ) : !isRecording ? (
                      <Button
                        onClick={startRecording}
                        size="lg"
                        disabled={hasResponse || isTranscribing}
                        className={`${
                          hasResponse
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90'
                        }`}
                      >
                        {hasResponse ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Answer Saved
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

                  {/* Re-record option if already answered */}
                  {hasResponse && !isRecording && !isTranscribing && (
                    <div className="pt-4">
                      <Button
                        onClick={() => {
                          // Clear the saved response to allow re-recording
                          const currentQuestion = sessionState.questions[sessionState.currentQuestionIndex];
                          if (currentQuestion) {
                            const newResponses = new Map(sessionState.responses);
                            newResponses.delete(currentQuestion.id);
                            setSessionState(prev => ({
                              ...prev,
                              responses: newResponses
                            }));
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="text-orange-400 border-orange-400/50 hover:bg-orange-500/10"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Re-record Answer
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Submit All Button */}
              {!isRecording && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-3">
                    {sessionState.responses.size} of {sessionState.questions.length} questions answered
                    {!allQuestionsAnswered && (
                      <span className="text-yellow-400 ml-2">• Answer all questions to submit</span>
                    )}
                  </p>
                  <Button
                    onClick={submitAllAnswers}
                    size="lg"
                    disabled={isSubmitting || !allQuestionsAnswered}
                    title={!allQuestionsAnswered ? 'Answer all questions before submitting' : ''}
                    className={`w-full transition-all ${
                      allQuestionsAnswered 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90' 
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Interview...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {allQuestionsAnswered ? 'Submit Interview for AI Evaluation' : `Answer ${sessionState.questions.length - sessionState.responses.size} More Question(s)`}
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
