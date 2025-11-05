'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  MessageSquare, Mic, Clock, Target, BookOpen, ChevronRight,
  Download, Share2, BarChart3, Lightbulb, Award, Home,
  Sparkles, ArrowRight, Star, Briefcase, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [expandedSteps, setExpandedSteps] = useState<{ [key: number]: boolean }>({});

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

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getStepDetails = (step: string, index: number) => {
    const details = [
      {
        title: "Complete the STAR method practice module",
        description: "The STAR method (Situation, Task, Action, Result) is a structured approach to answering behavioral interview questions.",
        tips: [
          "Practice with 5-10 common behavioral questions",
          "Time yourself to keep responses under 2 minutes",
          "Focus on quantifiable results and outcomes",
          "Use specific examples from your experience"
        ],
        estimatedTime: "30-45 minutes"
      },
      {
        title: "Review technical concepts: System Design Basics",
        description: "Strengthen your understanding of fundamental system design principles and architecture patterns.",
        tips: [
          "Study scalability patterns and load balancing",
          "Review database design and optimization techniques",
          "Practice explaining complex technical concepts simply",
          "Understand microservices vs monolithic architectures"
        ],
        estimatedTime: "1-2 hours"
      },
      {
        title: "Schedule another practice session focusing on behavioral questions",
        description: "Dedicated practice session to improve your behavioral interview responses using the STAR method.",
        tips: [
          "Focus on leadership and teamwork examples",
          "Practice conflict resolution scenarios",
          "Prepare examples showing growth and learning",
          "Work on reducing filler words and improving clarity"
        ],
        estimatedTime: "20-30 minutes"
      },
      {
        title: "Watch recommended videos on confident communication",
        description: "Improve your communication skills and confidence through targeted video content and exercises.",
        tips: [
          "Practice speaking clearly and at appropriate pace",
          "Work on body language and eye contact",
          "Learn techniques to manage interview anxiety",
          "Practice active listening and thoughtful responses"
        ],
        estimatedTime: "45-60 minutes"
      }
    ];
    return details[index] || { title: step, description: "", tips: [], estimatedTime: "" };
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[#0F0F0F]" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-[#0F0F0F]/95 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/applicant" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-medium">Applicant Home</span>
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <h1 className="text-xl font-light text-white">
                Practice Feedback
              </h1>
            </div>
            <Button
              onClick={() => router.push('/applicant/dashboard')}
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-light mb-4 text-white">Practice Session Complete!</h1>
          <p className="text-gray-400 text-lg">Here's your AI-powered feedback and improvement plan</p>
        </motion.div>

        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="md:col-span-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
            <CardContent className="pt-8 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Overall Performance</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-light text-white">{mockScore.overall}%</span>
                    <div className={`px-4 py-2 rounded-2xl text-lg font-light border ${getGradeColor(mockScore.grade)}`}>
                      Grade: {mockScore.grade}
                    </div>
                  </div>
                </div>
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <Progress value={mockScore.overall} className="h-2 mb-4" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Percentile: Top {100 - (mockScore.percentile || 0)}%</span>
                <Badge className={getReadinessColor(mockScore.readinessLevel)}>
                  {mockScore.readinessLevel.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
            <CardContent className="pt-8 p-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400 uppercase tracking-wider">Improvement</p>
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-3xl font-light text-green-400">+12%</p>
              <p className="text-sm text-gray-500 mt-2">vs. last session</p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
            <CardContent className="pt-8 p-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400 uppercase tracking-wider">Best Area</p>
                <Award className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-light text-white">Communication</p>
              <p className="text-lg text-blue-400">{mockScore.breakdown.communication}%</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Feedback Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-lg bg-white/[0.04] border border-white/10 rounded-2xl p-1">
            <TabsTrigger value="overview" className="rounded-xl font-light">Overview</TabsTrigger>
            <TabsTrigger value="questions" className="rounded-xl font-light">Questions</TabsTrigger>
            <TabsTrigger value="analysis" className="rounded-xl font-light">Analysis</TabsTrigger>
            <TabsTrigger value="plan" className="rounded-xl font-light">Action Plan</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overall Feedback */}
            <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-light text-white">Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">{mockFeedback.overall}</p>

                {/* Score Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-xl font-light mb-6 text-white">Score Breakdown</h3>
                  {Object.entries(mockScore.breakdown).map(([area, score]: [string, number]) => (
                    <div key={area} className="space-y-2">
                      <div className="flex justify-between text-base">
                        <span className="capitalize text-gray-300 font-light">{area}</span>
                        <span className="font-light text-white">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-white text-xl font-light">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockFeedback.strengths?.map((strength: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <h4 className="font-light text-lg text-white">{strength.title}</h4>
                      <p className="text-gray-400 leading-relaxed">{strength.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {strength.examples?.map((example: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs border-green-500/30 text-green-300 rounded-full px-3 py-1">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-white text-xl font-light">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockFeedback.improvements?.map((improvement: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-light text-lg text-white">{improvement.title}</h4>
                        <Badge className={`rounded-full px-3 py-1 text-xs ${
                          improvement.priority === 'high'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : improvement.priority === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {improvement.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-400 leading-relaxed">{improvement.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {improvement.examples?.map((example: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs border-yellow-500/30 text-yellow-300 rounded-full px-3 py-1">
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
          <TabsContent value="questions" className="space-y-6">
            {mockQuestionFeedback.map((question, index) => (
              <Card key={index} className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-light text-white">Question {index + 1}</CardTitle>
                    <div className="flex items-center gap-3">
                      <Progress value={(question.score / question.maxScore) * 100} className="w-32 h-2" />
                      <Badge variant="outline" className="border-white/30 bg-white/10 text-white rounded-full px-4 py-2 font-medium">
                        {question.score}/{question.maxScore}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-300 leading-relaxed text-lg">{question.feedback}</p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-base font-light mb-4 flex items-center gap-2 text-white">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Key Points Covered
                      </p>
                      <ul className="space-y-2">
                        {question.keyPointsCovered?.map((point: string, idx: number) => (
                          <li key={idx} className="text-gray-400 flex items-start gap-3">
                            <span className="text-green-400 mt-1 text-lg">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-base font-light mb-4 flex items-center gap-2 text-white">
                        <XCircle className="h-5 w-5 text-red-500" />
                        Key Points Missed
                      </p>
                      <ul className="space-y-2">
                        {question.keyPointsMissed?.map((point: string, idx: number) => (
                          <li key={idx} className="text-gray-400 flex items-start gap-3">
                            <span className="text-red-400 mt-1 text-lg">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {question.improvement && (
                    <Alert className="bg-blue-500/10 border-blue-500/30 rounded-2xl p-4">
                      <Lightbulb className="h-5 w-5" />
                      <AlertDescription className="text-blue-300 ml-2">
                        {question.improvement}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Communication Analysis */}
              <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-white text-xl font-light">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                    Communication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Clarity</dt>
                      <dd className="font-light text-white">{mockFeedback.communicationAnalysis?.clarity}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Pace</dt>
                      <dd className="font-light capitalize text-white">{mockFeedback.communicationAnalysis?.pace}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Filler Words</dt>
                      <dd className="font-light text-white">{mockFeedback.communicationAnalysis?.fillerWordCount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Vocabulary</dt>
                      <dd className="font-light capitalize text-white">{mockFeedback.communicationAnalysis?.vocabularyLevel}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Technical Analysis */}
              <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-white text-xl font-light">
                    <Target className="h-6 w-6 text-green-500" />
                    Technical
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Accuracy</dt>
                      <dd className="font-light text-white">{mockFeedback.technicalAnalysis?.accuracy}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Depth</dt>
                      <dd className="font-light capitalize text-white">{mockFeedback.technicalAnalysis?.depth}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Problem Solving</dt>
                      <dd className="font-light capitalize text-white">{mockFeedback.technicalAnalysis?.problemSolvingApproach}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Examples</dt>
                      <dd className="font-light text-white">{mockFeedback.technicalAnalysis?.examplesProvided ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Behavioral Analysis */}
              <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-white text-xl font-light">
                    <Star className="h-6 w-6 text-yellow-500" />
                    Behavioral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">STAR Method</dt>
                      <dd className="font-light text-white">{mockFeedback.behavioralAnalysis?.starMethodUsed ? 'Yes' : 'No'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Specificity</dt>
                      <dd className="font-light capitalize text-white">{mockFeedback.behavioralAnalysis?.specificityLevel}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Leadership</dt>
                      <dd className="font-light text-white">{mockFeedback.behavioralAnalysis?.leadershipShown ? 'Yes' : 'No'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Teamwork</dt>
                      <dd className="font-light text-white">{mockFeedback.behavioralAnalysis?.teamworkShown ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>

            {/* Key Terms Used */}
            {mockFeedback.technicalAnalysis?.technicalTermsUsed && (
              <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-light text-white">Technical Terms Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {mockFeedback.technicalAnalysis.technicalTermsUsed.map((term: string, index: number) => (
                      <Badge key={index} variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300 rounded-full px-4 py-2 text-sm font-medium">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Action Plan Tab */}
          <TabsContent value="plan" className="space-y-8">
            {/* AI Coach Tips */}
            <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-white text-2xl font-light">
                  <Sparkles className="h-6 w-6 text-cyan-400" />
                  AI Coach Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {mockFeedback.aiCoachTips?.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-light text-white">Recommended Next Steps</CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Follow these steps to improve your interview performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockFeedback.nextSteps?.map((step: string, index: number) => {
                  const stepDetails = getStepDetails(step, index);
                  const isExpanded = expandedSteps[index];
                  
                  return (
                    <div key={index} className="bg-white/[0.04] rounded-2xl overflow-hidden">
                      <div 
                        className="flex items-start gap-4 p-6 hover:bg-white/[0.08] transition-colors cursor-pointer"
                        onClick={() => toggleStep(index)}
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-lg font-light text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white leading-relaxed font-medium">{step}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-6 w-6 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-6"
                        >
                          <div className="ml-14 space-y-4 border-l-2 border-white/10 pl-6">
                            <div>
                              <h4 className="text-white font-medium mb-2">Description</h4>
                              <p className="text-gray-300 leading-relaxed">{stepDetails.description}</p>
                            </div>
                            
                            {stepDetails.tips.length > 0 && (
                              <div>
                                <h4 className="text-white font-medium mb-2">Key Tips</h4>
                                <ul className="space-y-2">
                                  {stepDetails.tips.map((tip, tipIndex) => (
                                    <li key={tipIndex} className="text-gray-300 flex items-start gap-2">
                                      <span className="text-blue-400 mt-1">•</span>
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {stepDetails.estimatedTime && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-400 text-sm">Estimated time: {stepDetails.estimatedTime}</span>
                              </div>
                            )}
                            
                            <div className="pt-2">
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add navigation logic here based on the step
                                  if (index === 0) {
                                    router.push('/applicant/practice/star-method');
                                  } else if (index === 2) {
                                    router.push('/applicant/practice/new?type=behavioral');
                                  } else {
                                    router.push('/applicant/practice/new');
                                  }
                                }}
                              >
                                Start Now
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push('/applicant/practice/new')}
                size="lg"
                className="flex-1 bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-2xl px-8 py-6 text-base font-light"
              >
                Practice Again
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                onClick={() => router.push('/applicant/jobs')}
                size="lg"
                variant="outline"
                className="flex-1 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-2xl px-8 py-6 text-base font-light"
              >
                Browse Jobs
                <Briefcase className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-2xl px-8 py-6 text-base font-light"
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