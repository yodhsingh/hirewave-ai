'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Play, Trophy, TrendingUp, ChevronRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { backendClient } from '@/lib/api/backend-client';
import { toast } from 'sonner';

export function PracticeSessionsSection() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPracticeSessions();
  }, []);

  const loadPracticeSessions = async () => {
    try {
      const response = await backendClient.getPracticeSessions();
      if (response.success && response.data) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to load practice sessions:', error);
      toast.error('Failed to load practice sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSession = (sessionId: number, isCompleted: boolean) => {
    if (isCompleted) {
      // View results
      router.push(`/applicant/practice/results/${sessionId}`);
    } else {
      // Resume session - load it into localStorage and navigate
      router.push(`/applicant/practice/interview?sessionId=${sessionId}`);
    }
  };

  const getCategoryColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return <div className="text-gray-400">Loading practice sessions...</div>;
  }

  return (
    <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Practice Sessions
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your interview practice history and scores
          </CardDescription>
        </div>
        <Button
          onClick={() => router.push('/applicant/practice')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Play className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No practice sessions yet</p>
            <Button
              onClick={() => router.push('/applicant/practice')}
              variant="outline"
              className="mt-4"
            >
              Start Your First Practice
            </Button>
          </div>
        ) : (
          sessions.map((session) => {
            const isCompleted = session.completedAt !== null;
            const hasScores = session.categoryScores !== null;

            return (
              <div
                key={session.id}
                className="p-4 bg-white/[0.03] rounded-lg border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">
                        {session.targetRole || 'Practice Interview'}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {session.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          session.difficulty === 'hard'
                            ? 'text-red-400 border-red-400/30'
                            : session.difficulty === 'medium'
                            ? 'text-yellow-400 border-yellow-400/30'
                            : 'text-green-400 border-green-400/30'
                        }
                      >
                        {session.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.startedAt).toLocaleDateString()}
                      </span>
                      <span>
                        {session.completedCount}/{session.questionsCount} questions
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isCompleted && session.overallScore !== null ? (
                      <div className="text-2xl font-bold text-white">
                        {Math.round(session.overallScore)}
                        <span className="text-sm text-gray-400">/100</span>
                      </div>
                    ) : (
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        In Progress
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Category Scores */}
                {hasScores && session.categoryScores && (
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {Object.entries(session.categoryScores).map(([category, score]: [string, any]) => (
                      <div key={category} className="text-center">
                        <div className={`text-sm font-semibold ${getCategoryColor(score)}`}>
                          {Math.round(score)}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {category.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress Bar for incomplete sessions */}
                {!isCompleted && (
                  <Progress
                    value={(session.completedCount / session.questionsCount) * 100}
                    className="mb-3"
                  />
                )}

                <Button
                  onClick={() => handleResumeSession(session.id, isCompleted)}
                  variant="outline"
                  size="sm"
                  className="w-full border-white/10 hover:bg-white/5"
                >
                  {isCompleted ? (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      View Results
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume Session
                    </>
                  )}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
