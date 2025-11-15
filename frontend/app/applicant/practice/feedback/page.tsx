'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  MessageSquare, Mic, Clock, Target, BookOpen, ChevronRight,
  Download, Share2, BarChart3, Lightbulb, Award, Home,
  Sparkles, ArrowRight, Star, Briefcase, ChevronDown, ChevronUp,
  Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloatingParticles } from '@/components/FloatingParticles';
import { gradients } from '@/lib/theme';
import { backendClient } from '@/lib/api/backend-client';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

interface SessionData {
  id: number;
  type: string;
  difficulty: string;
  target_role: string;
  questions_count: number;
  completed_count: number;
  overall_score: number | null;
  ai_feedback: string | null;
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
}

function PracticeFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const sessionId = searchParams.get('sessionId');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (sessionId) {
      loadSessionData(parseInt(sessionId));
    } else {
      toast({
        title: 'Error',
        description: 'No session ID provided',
        variant: 'destructive',
      });
      router.push('/applicant/practice');
    }
  }, [sessionId, router, toast]);

  const loadSessionData = async (id: number) => {
    try {
      const response = await backendClient.getPracticeSession(id);
      if (response.success && response.data) {
        setSessionData(response.data.session);

        // If session is not completed yet, complete it to calculate overall score
        if (!response.data.session.overall_score) {
          await completeSession(id);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to load session');
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = async (id: number) => {
    setIsCompleting(true);
    try {
      const response = await backendClient.completePracticeSession(id);
      if (response.success && response.data) {
        // Reload session data to get the updated score
        await loadSessionData(id);

        toast({
          title: 'Session Completed',
          description: `Overall Score: ${response.data.overall_score}/100`,
        });
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const calculateAverageScore = () => {
    if (!sessionData) return 0;
    const scores = sessionData.questions
      .map(q => q.response?.score || 0)
      .filter(score => score > 0);

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-xl">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-xl mb-4">Session not found</p>
          <Button onClick={() => router.push('/applicant/practice')}>
            Back to Practice
          </Button>
        </div>
      </div>
    );
  }

  const overallScore = sessionData.overall_score || calculateAverageScore();
  const grade = getScoreGrade(overallScore);

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
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
              <Trophy className="w-4 h-4 mr-2" />
              Session Complete
            </Badge>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className={`bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
              Your Interview Performance
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Here\'s your detailed feedback and areas for improvement
          </p>
        </motion.div>

        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {/* Overall Score Card */}
          <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/50 md:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full border-8 border-blue-500/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                      {overallScore}
                    </div>
                    <div className="text-sm text-gray-400">out of 100</div>
                  </div>
                </div>
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600">
                  Grade: {grade}
                </Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Overall Score</h3>
              <p className="text-gray-300 text-sm">
                {overallScore >= 80 ? 'Excellent performance!' :
                 overallScore >= 60 ? 'Good effort, keep practicing!' :
                 'More practice recommended'}
              </p>
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Session Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Interview Type</p>
                  <p className="font-medium text-white capitalize">{sessionData.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Difficulty</p>
                  <p className="font-medium text-white capitalize">{sessionData.difficulty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Questions Answered</p>
                  <p className="font-medium text-white">
                    {sessionData.completed_count} / {sessionData.questions_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Target Role</p>
                  <p className="font-medium text-white">
                    {sessionData.target_role || 'General Practice'}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Completion</span>
                  <span className="text-white">
                    {Math.round((sessionData.completed_count / sessionData.questions_count) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(sessionData.completed_count / sessionData.questions_count) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Feedback */}
        {sessionData.ai_feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border-green-500/30 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="w-6 h-6 text-green-400" />
                  AI Overall Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 leading-relaxed">{sessionData.ai_feedback}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Question-by-Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Question-by-Question Review</CardTitle>
              <CardDescription>Click on each question to see detailed feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionData.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border border-white/10 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(question.id)}
                    className="w-full p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-left">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            question.response ? 'bg-green-500/20' : 'bg-gray-500/20'
                          }`}>
                            {question.response ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            Question {index + 1}: {question.type}
                          </p>
                          <p className="text-sm text-gray-400 line-clamp-1">
                            {question.question}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {question.response && (
                          <Badge className={`${getScoreColor(question.response.score)} bg-opacity-20`}>
                            {question.response.score}/100
                          </Badge>
                        )}
                        {expandedQuestions.has(question.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedQuestions.has(question.id) && (
                    <div className="border-t border-white/10 p-4 bg-white/5">
                      <div className="space-y-4">
                        {/* Question */}
                        <div>
                          <p className="text-sm font-medium text-gray-400 mb-1">Question</p>
                          <p className="text-white">{question.question}</p>
                        </div>

                        {question.response ? (
                          <>
                            {/* Transcript */}
                            <div>
                              <p className="text-sm font-medium text-gray-400 mb-1">Your Answer</p>
                              <p className="text-gray-200 text-sm">
                                {question.response.transcript}
                              </p>
                            </div>

                            {/* Feedback */}
                            <div>
                              <p className="text-sm font-medium text-gray-400 mb-1">AI Feedback</p>
                              <p className="text-gray-200 text-sm">
                                {question.response.feedback}
                              </p>
                            </div>

                            {/* Strengths & Improvements */}
                            <div className="grid md:grid-cols-2 gap-4">
                              {question.response.strengths.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-green-400 mb-2">Strengths</p>
                                  <ul className="space-y-1">
                                    {question.response.strengths.map((strength, i) => (
                                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        {strength}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {question.response.improvements.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-yellow-400 mb-2">Areas to Improve</p>
                                  <ul className="space-y-1">
                                    {question.response.improvements.map((improvement, i) => (
                                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                        {improvement}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <Alert className="bg-yellow-500/10 border-yellow-500/30">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            <AlertDescription className="text-yellow-200">
                              This question was not answered
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <Button
            onClick={() => router.push('/applicant/practice')}
            size="lg"
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Practice Again
          </Button>

          <Button
            onClick={() => router.push('/applicant/dashboard')}
            size="lg"
            variant="outline"
            className="flex-1 bg-white/5 border-white/20 hover:bg-white/10"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function PracticeFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    }>
      <PracticeFeedbackContent />
    </Suspense>
  );
}