'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Brain, Trophy, TrendingUp, ChevronRight, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { backendClient } from '@/lib/api/backend-client';
import { gradients } from '@/lib/theme';
import { toast } from 'sonner';

export default function PracticeResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = parseInt(params.id as string);

  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  const loadSessionDetails = async () => {
    try {
      const response = await backendClient.getPracticeSession(sessionId);
      if (response.success && response.data) {
        setSession(response.data.session);
      } else {
        toast.error('Failed to load session details');
        router.push('/applicant/dashboard');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      toast.error('Failed to load session details');
      router.push('/applicant/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCategoryBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading results...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients.bgPrimary}`} />
        <div className={`absolute inset-0 bg-gradient-to-tr ${gradients.bgSecondary}`} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/applicant/dashboard')}
              className="gap-2 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => router.push('/applicant/practice')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              New Practice Session
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Practice Session Results</h1>
          <p className="text-gray-400">
            {session.targetRole || 'Interview Practice'} • {session.type} • {session.difficulty}
          </p>
        </div>

        {/* Overall Score */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 mb-8">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <div className="text-6xl font-bold text-white mb-2">
                {Math.round(session.overallScore || 0)}
                <span className="text-2xl text-gray-400">/100</span>
              </div>
              <p className="text-gray-400">Overall Score</p>
            </div>
            <Progress value={session.overallScore || 0} className="h-3" />
          </CardContent>
        </Card>

        {/* Category Scores */}
        {session.categoryScores && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Category Breakdown
              </CardTitle>
              <CardDescription>Your performance across different skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(session.categoryScores).map(([category, score]: [string, any]) => (
                  <div
                    key={category}
                    className={`p-4 rounded-lg border ${getCategoryBgColor(score)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize text-white">
                        {category.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-2xl font-bold ${getCategoryColor(score)}`}>
                        {Math.round(score)}
                      </span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Feedback */}
        {session.aiFeedback && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-300 whitespace-pre-line">
                {session.aiFeedback}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions & Answers */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle>Questions & Your Responses</CardTitle>
            <CardDescription>
              {session.questions.length} questions answered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {session.questions.map((q: any, index: number) => (
              <div key={q.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start gap-3 mb-3">
                  <Badge variant="outline" className="mt-1">
                    Q{index + 1}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">{q.question}</p>
                    {q.context && (
                      <p className="text-sm text-gray-400 mb-3">{q.context}</p>
                    )}
                  </div>
                  {q.response && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {Math.round(q.response.score)}
                      </div>
                      <div className="text-xs text-gray-400">score</div>
                    </div>
                  )}
                </div>

                {q.response && (
                  <div className="ml-9 space-y-3">
                    <div className="p-3 bg-black/20 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                      <p className="text-white">{q.response.transcript}</p>
                    </div>

                    {q.response.feedback && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-400 mb-1">Feedback:</p>
                        <p className="text-gray-300 text-sm">{q.response.feedback}</p>
                      </div>
                    )}

                    {q.response.strengths && q.response.strengths.length > 0 && (
                      <div>
                        <p className="text-sm text-green-400 mb-1">Strengths:</p>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          {q.response.strengths.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {q.response.improvements && q.response.improvements.length > 0 && (
                      <div>
                        <p className="text-sm text-yellow-400 mb-1">Areas for Improvement:</p>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          {q.response.improvements.map((i: string, idx: number) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {!q.response && (
                  <div className="ml-9 text-gray-500 text-sm">
                    No response recorded
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/applicant/dashboard')}
            className="border-white/10 hover:bg-white/5"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            onClick={() => router.push('/applicant/practice')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start New Session
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
