'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  MessageSquare, Mic, Clock, Target, BookOpen, ChevronRight,
  Download, Share2, BarChart3, Lightbulb, Award, Home,
  Sparkles, ArrowRight, Star, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloatingParticles } from '@/components/FloatingParticles';
import { gradients } from '@/lib/theme';
import Link from 'next/link';
import type { PracticeFeedback, PracticeScore, QuestionFeedback } from '@/types';

// Mock feedback data
const mockScore: PracticeScore = {
  overall: 78,
  breakdown: {
    communication: 82,
    content: 75,
    confidence: 74,
    structure: 80,
    relevance: 79,
  },
  percentile: 72,
  grade: 'B',
  readinessLevel: 'almost_ready',
};

const mockFeedback: Partial<PracticeFeedback> = {
  overall: 'Good performance overall! You demonstrated strong communication skills and technical knowledge. Focus on reducing filler words and providing more structured responses using the STAR method for behavioral questions.',
  strengths: [
    {
      category: 'communication',
      title: 'Clear Communication',
      description: 'You articulated your thoughts clearly and maintained good pace throughout the interview.',
      priority: 'low',
      examples: ['Great explanation of your project management experience', 'Clear technical explanations'],
    },
    {
      category: 'technical',
      title: 'Strong Technical Foundation',
      description: 'Demonstrated solid understanding of core concepts and technologies.',
      priority: 'low',
      examples: ['Excellent system design approach', 'Good understanding of scalability'],
    },
  ],
  improvements: [
    {
      category: 'communication',
      title: 'Reduce Filler Words',
      description: 'You used "um", "uh", and "like" frequently, which can make you appear less confident.',
      priority: 'high',
      examples: ['Used "um" 12 times in the first question', 'Multiple "like" instances in technical explanation'],
    },
    {
      category: 'behavioral',
      title: 'Use STAR Method',
      description: 'Structure your behavioral responses better using Situation, Task, Action, Result.',
      priority: 'medium',
      examples: ['The team conflict answer lacked clear structure', 'Missing measurable results in project description'],
    },
  ],
  communicationAnalysis: {
    clarity: 82,
    pace: 'good',
    volume: 'good',
    fillerWordCount: 23,
    vocabularyLevel: 'intermediate',
    sentenceStructure: 'varied',
  },
  technicalAnalysis: {
    accuracy: 85,
    depth: 'moderate',
    problemSolvingApproach: 'structured',
    technicalTermsUsed: ['scalability', 'microservices', 'API', 'database optimization', 'caching'],
    conceptsExplained: ['System design', 'Database indexing', 'Load balancing'],
    examplesProvided: true,
  },
  behavioralAnalysis: {
    starMethodUsed: false,
    specificityLevel: 'moderate',
    outcomesFocused: true,
    leadershipShown: true,
    teamworkShown: true,
    conflictResolution: false,
  },
  aiCoachTips: [
    'Practice the STAR method with 3-5 common behavioral questions daily',
    'Record yourself to identify and reduce filler words',
    'Prepare 2-3 strong examples that showcase different skills',
    'Time your responses to keep them under 2 minutes',
    'Research the company culture and values before interviews',
  ],
  nextSteps: [
    'Complete the STAR method practice module',
    'Review technical concepts: System Design Basics',
    'Schedule another practice session focusing on behavioral questions',
    'Watch recommended videos on confident communication',
  ],
};

const mockQuestionFeedback: QuestionFeedback[] = [
  {
    questionId: '1',
    score: 85,
    maxScore: 100,
    feedback: 'Good introduction with clear career progression. Consider adding more specific achievements.',
    keyPointsCovered: ['Professional background', 'Career progression', 'Current role'],
    keyPointsMissed: ['Specific achievements', 'Connection to target role'],
    improvement: 'Add quantifiable achievements and connect your experience to the role you\'re applying for.',
  },
  {
    questionId: '2',
    score: 72,
    maxScore: 100,
    feedback: 'Good example but needs more structure. Use STAR method for clarity.',
    keyPointsCovered: ['Challenge identified', 'Actions taken'],
    keyPointsMissed: ['Clear situation setup', 'Measurable results'],
    improvement: 'Start with clear context, explain your specific role, and end with measurable outcomes.',
  },
  {
    questionId: '3',
    score: 88,
    maxScore: 100,
    feedback: 'Excellent technical explanation with good consideration of trade-offs.',
    keyPointsCovered: ['System requirements', 'Database design', 'API design', 'Scalability'],
    keyPointsMissed: ['Security considerations in detail'],
    improvement: 'Add more detail on security measures and rate limiting strategies.',
  },
];

export default function PracticeFeedbackPage() {
  const router = useRouter();

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'B': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'C': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'interview_ready': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'almost_ready': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'needs_practice': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-red-500/20 text-red-300 border-red-500/30';
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
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
                Practice Feedback
              </h1>
            </div>
            <Button
              onClick={() => router.push('/applicant/dashboard')}
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/10"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice Session Complete!</h1>
          <p className="text-gray-400">Here's your AI-powered feedback and improvement plan</p>
        </motion.div>

        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="md:col-span-2 bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Overall Performance</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold">{mockScore.overall}%</span>
                    <div className={`px-3 py-1 rounded-full text-lg font-semibold border ${getGradeColor(mockScore.grade)}`}>
                      Grade: {mockScore.grade}
                    </div>
                  </div>
                </div>
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
              <Progress value={mockScore.overall} className="h-3 mb-3" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Percentile: Top {100 - (mockScore.percentile || 0)}%</span>
                <Badge className={getReadinessColor(mockScore.readinessLevel)}>
                  {mockScore.readinessLevel.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Improvement</p>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-400">+12%</p>
              <p className="text-xs text-gray-500 mt-1">vs. last session</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Best Area</p>
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-lg font-bold">Communication</p>
              <p className="text-sm text-blue-400">{mockScore.breakdown.communication}%</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Feedback Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md bg-white/5 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="plan">Action Plan</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overall Feedback */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle>Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-6">{mockFeedback.overall}</p>

                {/* Score Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-semibold mb-3">Score Breakdown</h3>
                  {Object.entries(mockScore.breakdown).map(([area, score]) => (
                    <div key={area}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-gray-300">{area}</span>
                        <span className="font-medium">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockFeedback.strengths?.map((strength, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-semibold">{strength.title}</h4>
                      <p className="text-sm text-gray-400">{strength.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {strength.examples?.map((example, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-green-500/30 text-green-300">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockFeedback.improvements?.map((improvement, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{improvement.title}</h4>
                        <Badge className={
                          improvement.priority === 'high'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : improvement.priority === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }>
                          {improvement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{improvement.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {improvement.examples?.map((example, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-yellow-500/30 text-yellow-300">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            {mockQuestionFeedback.map((question, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Question {index + 1}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Progress value={(question.score / question.maxScore) * 100} className="w-24 h-2" />
                      <Badge variant="outline" className="border-white/20">
                        {question.score}/{question.maxScore}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">{question.feedback}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Key Points Covered
                      </p>
                      <ul className="space-y-1">
                        {question.keyPointsCovered?.map((point, idx) => (
                          <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Key Points Missed
                      </p>
                      <ul className="space-y-1">
                        {question.keyPointsMissed?.map((point, idx) => (
                          <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {question.improvement && (
                    <Alert className="bg-blue-500/10 border-blue-500/30">
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription className="text-blue-300">
                        {question.improvement}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Communication Analysis */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Communication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Clarity</dt>
                      <dd className="font-medium">{mockFeedback.communicationAnalysis?.clarity}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Pace</dt>
                      <dd className="font-medium capitalize">{mockFeedback.communicationAnalysis?.pace}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Filler Words</dt>
                      <dd className="font-medium">{mockFeedback.communicationAnalysis?.fillerWordCount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Vocabulary</dt>
                      <dd className="font-medium capitalize">{mockFeedback.communicationAnalysis?.vocabularyLevel}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Technical Analysis */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="h-5 w-5 text-green-500" />
                    Technical
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Accuracy</dt>
                      <dd className="font-medium">{mockFeedback.technicalAnalysis?.accuracy}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Depth</dt>
                      <dd className="font-medium capitalize">{mockFeedback.technicalAnalysis?.depth}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Problem Solving</dt>
                      <dd className="font-medium capitalize">{mockFeedback.technicalAnalysis?.problemSolvingApproach}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Examples</dt>
                      <dd className="font-medium">{mockFeedback.technicalAnalysis?.examplesProvided ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Behavioral Analysis */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Behavioral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">STAR Method</dt>
                      <dd className="font-medium">{mockFeedback.behavioralAnalysis?.starMethodUsed ? 'Yes' : 'No'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Specificity</dt>
                      <dd className="font-medium capitalize">{mockFeedback.behavioralAnalysis?.specificityLevel}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Leadership</dt>
                      <dd className="font-medium">{mockFeedback.behavioralAnalysis?.leadershipShown ? 'Yes' : 'No'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Teamwork</dt>
                      <dd className="font-medium">{mockFeedback.behavioralAnalysis?.teamworkShown ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>

            {/* Key Terms Used */}
            {mockFeedback.technicalAnalysis?.technicalTermsUsed && (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle>Technical Terms Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockFeedback.technicalAnalysis.technicalTermsUsed.map((term, index) => (
                      <Badge key={index} variant="outline" className="border-white/20">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Action Plan Tab */}
          <TabsContent value="plan" className="space-y-6">
            {/* AI Coach Tips */}
            <Card className={`bg-gradient-to-br ${gradients.cardHeader} border-white/10`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  AI Coach Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mockFeedback.aiCoachTips?.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle>Recommended Next Steps</CardTitle>
                <CardDescription className="text-gray-400">
                  Follow these steps to improve your interview performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockFeedback.nextSteps?.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradients.primary} flex items-center justify-center text-sm font-bold`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p>{step}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push('/applicant/practice/new')}
                size="lg"
                className={`flex-1 bg-gradient-to-r ${gradients.primary} hover:opacity-90`}
              >
                Practice Again
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                onClick={() => router.push('/applicant/jobs')}
                size="lg"
                variant="outline"
                className="flex-1 border-white/20 bg-white/5 hover:bg-white/10"
              >
                Browse Jobs
                <Briefcase className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-white/20 bg-white/5 hover:bg-white/10"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}