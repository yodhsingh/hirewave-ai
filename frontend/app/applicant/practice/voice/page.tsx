'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, Headphones,
  Clock, Play, Pause, AlertCircle, CheckCircle, Sparkles,
  Home, Brain, MessageSquare, Smartphone, Wifi, WifiOff,
  ArrowRight, Settings, User, Calendar, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// RadioGroup not available - using custom implementation
import { FloatingParticles } from '@/components/FloatingParticles';
import { gradients } from '@/lib/theme';
import Link from 'next/link';

function AIVoiceInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [stage, setStage] = useState<'setup' | 'scheduling' | 'calling' | 'inProgress' | 'completed'>('setup');
  const [callMethod, setCallMethod] = useState<'phone' | 'online'>('online');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const totalQuestions = 8;
  const estimatedDuration = 15; // minutes

  useEffect(() => {
    if (stage === 'inProgress') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // Simulate audio level animation
  useEffect(() => {
    if (stage === 'inProgress' && !isMuted) {
      const audioTimer = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 200);
      return () => clearInterval(audioTimer);
    }
  }, [stage, isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartInterview = () => {
    if (callMethod === 'phone' && !phoneNumber) {
      alert('Please enter your phone number');
      return;
    }
    setStage('scheduling');
    // Simulate scheduling
    setTimeout(() => {
      setStage('calling');
      setTimeout(() => {
        setStage('inProgress');
        setIsCallActive(true);
      }, 3000);
    }, 2000);
  };

  const handleEndCall = () => {
    setStage('completed');
    setIsCallActive(false);
  };

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
            <div className="flex items-center gap-6">
              <Link href="/applicant" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Applicant Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className={`text-xl font-bold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                AI Voice Interview
              </h1>
            </div>

            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
              <Phone className="w-4 h-4 mr-2" />
              Voice-Based Interview
            </Badge>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-4xl">
        {/* Setup Stage */}
        {stage === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border border-blue-500/50 backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                <h2 className="text-3xl font-bold mb-2 text-white">AI Voice Interview</h2>
                <p className="text-gray-200 mb-6">
                  Our AI interviewer will conduct a {estimatedDuration}-minute technical screening call
                </p>
                <div className="flex justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-300">{totalQuestions} Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300">~{estimatedDuration} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-300">Real-time AI</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Choose Your Interview Method</CardTitle>
                <CardDescription className="text-gray-300">Select how you want to receive the AI interview call</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCallMethod('online')}
                    className={`relative flex cursor-pointer rounded-lg border-2 p-6 transition-all text-left ${
                      callMethod === 'online'
                        ? 'border-cyan-500 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 shadow-lg shadow-cyan-500/20'
                        : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradients.primary}`}>
                          <Headphones className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 text-white">Online Voice Call</h3>
                          <p className="text-sm text-gray-300">
                            Interview directly in your browser using your computer's microphone
                          </p>
                          <div className="mt-3 space-y-1">
                            <p className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              No phone charges
                            </p>
                            <p className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Better audio quality
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setCallMethod('phone')}
                      className={`relative flex cursor-pointer rounded-lg border-2 p-6 transition-all text-left ${
                        callMethod === 'phone'
                          ? 'border-orange-500 bg-gradient-to-br from-orange-600/20 to-orange-500/20 shadow-lg shadow-orange-500/20'
                          : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradients.accent}`}>
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 text-white">Phone Call</h3>
                          <p className="text-sm text-gray-300">
                            Receive an AI call on your phone for a traditional interview experience
                          </p>
                          <div className="mt-3 space-y-1">
                            <p className="text-xs text-blue-400 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Standard rates apply
                            </p>
                            <p className="text-xs text-blue-400 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              More comfortable
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                {callMethod === 'phone' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="phone-number">Your Phone Number</Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-white/10 border-white/20 mt-2"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        We'll call this number within 30 seconds after you start
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Interview Tips */}
                <Alert className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 border border-amber-500/50">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <AlertDescription className="text-gray-200">
                    <strong className="text-amber-300">Pro Tips:</strong>
                    <ul className="mt-2 space-y-1 text-sm text-gray-200">
                      <li>• Find a quiet environment with no background noise</li>
                      <li>• Speak clearly and at a moderate pace</li>
                      <li>• Have your resume ready for reference</li>
                      <li>• Treat this like a real phone interview</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleStartInterview}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/25"
                  >
                    Start AI Interview
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Scheduling Stage */}
        {stage === 'scheduling' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
              <h2 className="text-2xl font-bold mb-2">Scheduling Your Interview</h2>
              <p className="text-gray-400 mb-4">
                {callMethod === 'phone'
                  ? `Preparing to call ${phoneNumber}...`
                  : 'Setting up your browser audio...'}
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Calling Stage */}
        {stage === 'calling' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-12 text-center">
              <div className="relative">
                <PhoneCall className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <PhoneCall className="w-16 h-16 mx-auto text-green-400 opacity-50" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold mb-2 mt-4">
                {callMethod === 'phone' ? 'Calling Your Phone...' : 'Connecting...'}
              </h2>
              <p className="text-gray-400">
                {callMethod === 'phone'
                  ? 'Please answer the incoming call'
                  : 'Please allow microphone access when prompted'}
              </p>
            </Card>
          </motion.div>
        )}

        {/* In Progress Stage */}
        {stage === 'inProgress' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Call Interface */}
            <Card className={`bg-gradient-to-br ${gradients.cardHeader} border-white/10`}>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 mb-4">
                    <User className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">AI Interviewer</h2>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <PhoneCall className="w-3 h-3 mr-1" />
                    Interview in Progress
                  </Badge>
                </div>

                {/* Audio Visualizer */}
                <div className="flex justify-center items-center gap-1 h-16 mb-6">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full"
                      animate={{
                        height: isMuted ? 4 : audioLevel * Math.random() * 0.8 + 20,
                      }}
                      transition={{
                        duration: 0.1,
                      }}
                    />
                  ))}
                </div>

                {/* Call Controls */}
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`rounded-full w-14 h-14 ${
                      isMuted ? 'bg-red-500/20 border-red-500/30' : 'border-white/20 bg-white/5'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleEndCall}
                    className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-14 h-14 border-white/20 bg-white/5"
                  >
                    <Volume2 className="w-6 h-6" />
                  </Button>
                </div>

                {/* Call Info */}
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Question {currentQuestion + 1} of {totalQuestions}</span>
                  <span>Duration: {formatTime(callDuration)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle>Interview Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(currentQuestion / totalQuestions) * 100} className="mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Current Topic:</p>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    Technical Experience
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Live Tips */}
            <Alert className="bg-blue-500/10 border-blue-500/30">
              <Info className="w-4 h-4" />
              <AlertDescription>
                <strong>Remember:</strong> Take your time to think before answering. The AI is analyzing your
                communication skills, technical knowledge, and problem-solving approach.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Completed Stage */}
        {stage === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className={`bg-gradient-to-br ${gradients.success} border-white/10`}>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Interview Complete!</h2>
                <p className="text-xl text-gray-300 mb-6">
                  Great job! Your AI interview has been successfully completed.
                </p>
                <div className="flex justify-center gap-6 mb-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{formatTime(callDuration)}</p>
                    <p className="text-sm text-gray-400">Total Duration</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{totalQuestions}</p>
                    <p className="text-sm text-gray-400">Questions Answered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-500/10 border-blue-500/30">
                  <Clock className="w-4 h-4" />
                  <AlertDescription>
                    Your AI-powered feedback will be ready in <strong>2-3 minutes</strong>.
                    We're analyzing your responses for detailed insights.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    className={`bg-gradient-to-r ${gradients.primary}`}
                    onClick={() => router.push('/applicant/practice/feedback')}
                  >
                    View Feedback
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 bg-white/5 hover:bg-white/10"
                    onClick={() => router.push('/applicant/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function AIVoiceInterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <AIVoiceInterviewContent />
    </Suspense>
  );
}
