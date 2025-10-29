'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Building,
  Clock,
  Users,
  FileText,
  Video,
  CheckSquare,
  AlertCircle,
  CheckCircle,
  Eye,
  Sparkles,
  Share2,
  Calendar,
  TrendingUp,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import type { JobCreateInput } from '@/lib/schemas/validation';

interface JobPreviewProps {
  jobData: JobCreateInput;
}

export function JobPreview({ jobData }: JobPreviewProps) {
  const videoQuestions = jobData.questions?.filter(q => q.type === 'video') || [];
  const textQuestions = jobData.questions?.filter(q => q.type === 'text') || [];
  const mcQuestions = jobData.questions?.filter(q => q.type === 'multiple_choice') || [];

  const totalQuestions = jobData.questions?.length || 0;
  const estimatedTime = jobData.questions?.reduce((acc, q) => {
    if (q.timeLimit) {
      return acc + q.timeLimit;
    }
    return acc + 120; // Default 2 minutes if no limit
  }, 0) || 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes} min` : `${seconds} sec`;
  };

  const getReadinessScore = () => {
    let score = 0;
    if (jobData.title) score += 20;
    if (jobData.description && jobData.description.length > 100) score += 20;
    if (jobData.department) score += 10;
    if (jobData.location) score += 10;
    if (totalQuestions >= 3) score += 20;
    if (totalQuestions >= 5) score += 10;
    if (jobData.requirements && jobData.requirements.length > 0) score += 10;
    return score;
  };

  const readinessScore = getReadinessScore();
  const readinessColor = readinessScore >= 80 ? 'text-green-400' : readinessScore >= 60 ? 'text-yellow-400' : 'text-red-400';
  const readinessLabel = readinessScore >= 80 ? 'Ready to Publish' : readinessScore >= 60 ? 'Almost Ready' : 'Needs More Info';

  return (
    <div className="space-y-6">
      {/* Readiness Score */}
      <Card className="border-2 border-gray-700 bg-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-blue-400" />
              Job Readiness
            </CardTitle>
            <Badge className={readinessScore >= 80 ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}>
              {readinessLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Completion Score</span>
              <span className={`font-bold text-lg ${readinessColor}`}>{readinessScore}%</span>
            </div>
            <Progress value={readinessScore} className="h-3 bg-gray-700" />

            {readinessScore < 100 && (
              <Alert className="mt-4 border-amber-500/30 bg-amber-900/20">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-gray-200">
                  <p className="font-medium mb-2">Suggestions to improve:</p>
                  <ul className="text-sm space-y-1 text-gray-300">
                    {!jobData.title && <li>• Add a clear job title</li>}
                    {(!jobData.description || jobData.description.length < 100) && <li>• Write a detailed job description</li>}
                    {totalQuestions < 3 && <li>• Add at least 3 interview questions</li>}
                    {totalQuestions < 5 && totalQuestions >= 3 && <li>• Consider adding more questions for better evaluation</li>}
                    {(!jobData.requirements || jobData.requirements.length === 0) && <li>• Add key requirements for the role</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Details Preview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="w-5 h-5 text-purple-400" />
            How Candidates Will See Your Job
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">{jobData.title || 'Untitled Position'}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {jobData.department && (
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4 text-purple-400" />
                  {jobData.department}
                </div>
              )}
              {jobData.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-pink-400" />
                  {jobData.location}
                </div>
              )}
              {jobData.roleType && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-orange-400" />
                  {jobData.roleType}
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-200">
              <FileText className="w-4 h-4 text-cyan-400" />
              About the Role
            </h3>
            <p className="text-sm text-gray-400 whitespace-pre-wrap">
              {jobData.description || 'No description provided yet.'}
            </p>
          </div>

          {/* Requirements */}
          {jobData.requirements && jobData.requirements.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-gray-200">Key Requirements</h3>
              <div className="flex flex-wrap gap-2">
                {jobData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-200 border-gray-600">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-gray-700" />

          {/* Interview Process */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-200">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Interview Process
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="bg-purple-900/20 border-purple-500/30">
                <CardContent className="pt-6 text-center">
                  <Video className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <p className="font-semibold text-white">{videoQuestions.length}</p>
                  <p className="text-xs text-gray-400">Video Questions</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="pt-6 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <p className="font-semibold text-white">{textQuestions.length}</p>
                  <p className="text-xs text-gray-400">Text Questions</p>
                </CardContent>
              </Card>

              <Card className="bg-green-900/20 border-green-500/30">
                <CardContent className="pt-6 text-center">
                  <CheckSquare className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="font-semibold text-white">{mcQuestions.length}</p>
                  <p className="text-xs text-gray-400">Multiple Choice</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-400" />
                Est. {formatTime(estimatedTime)}
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                AI-Powered Evaluation
              </div>
            </div>
          </div>

          {/* Questions List */}
          {totalQuestions > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-200">Interview Questions Preview</h3>
              <div className="space-y-3">
                {jobData.questions?.map((question, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {question.type === 'video' && <Video className="w-4 h-4 text-purple-400" />}
                        {question.type === 'text' && <FileText className="w-4 h-4 text-blue-400" />}
                        {question.type === 'multiple_choice' && <CheckSquare className="w-4 h-4 text-green-400" />}
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {question.timeLimit ? formatTime(question.timeLimit) : 'No limit'}
                        </Badge>
                        {question.required && (
                          <Badge variant="secondary" className="text-xs bg-yellow-900/30 text-yellow-400 border-yellow-500/30">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-200">{question.question}</p>
                      {question.options && (
                        <div className="mt-2 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2 text-xs text-gray-400">
                              <div className="w-3 h-3 rounded-full border border-gray-500" />
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expected Results */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Expected Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <p className="font-medium text-gray-200">Automated Screening</p>
                <p className="text-sm text-gray-400">
                  AI will rank candidates based on their responses, saving you 80% of screening time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <p className="font-medium text-gray-200">Faster Hiring</p>
                <p className="text-sm text-gray-400">
                  Reduce time-to-hire by 60% with async interviews
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <p className="font-medium text-gray-200">Better Matches</p>
                <p className="text-sm text-gray-400">
                  Find candidates who align with your requirements
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📈</div>
              <div>
                <p className="font-medium">Data Insights</p>
                <p className="text-sm text-muted-foreground">
                  Track metrics and improve your hiring process
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Info */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <p className="font-medium text-green-900 mb-1">Ready to publish?</p>
          <p className="text-sm">
            Once published, your job will be live and candidates can start applying immediately.
            You&apos;ll receive notifications for each new application.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}