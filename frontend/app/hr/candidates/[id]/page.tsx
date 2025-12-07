'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Video,
  FileText,
  Code,
  MessageSquare,
  Play,
  Pause,
  Download,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Sparkles,
  FileAudio,
  Brain,
  TrendingUp,
  Award,
  BarChart3,
  Mic,
  PhoneCall,
  MessageCircle,
  Briefcase,
  Bell,
  Settings,
  LogOut,
  Home,
  Shield,
  Camera,
  AlertTriangle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { backendClient } from '@/lib/api/backend-client';
import type { Candidate, Job, InterviewResponse } from '@/types';
import { gradients } from '@/lib/theme';
import { useAuthStore } from '@/lib/store/authStore';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

const QUESTION_TYPE_ICONS = {
  PHONE: Phone,
  VIDEO: Video,
  TEXT: FileText,
  CODE: Code,
  MULTIPLE_CHOICE: MessageSquare,
};

// Helper to format duration in seconds to MM:SS
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper to extract key topics from transcript
const extractKeyTopics = (transcript: any[]): string[] => {
  // Simple keyword extraction - in production this would use NLP
  const keywords = new Set<string>();
  const techKeywords = ['AWS', 'Azure', 'Kubernetes', 'Docker', 'Lambda', 'DynamoDB', 'Microservices', 'Event Sourcing', 'CQRS', 'Istio', 'Serverless', 'CloudWatch', 'X-Ray', 'Jaeger'];

  transcript.forEach(entry => {
    techKeywords.forEach(keyword => {
      if (entry.text.includes(keyword)) {
        keywords.add(keyword);
      }
    });
  });

  return Array.from(keywords);
};

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const candidateId = params.id as string;

        // Fetch candidate details from backend
        const candidateResponse = await backendClient.getCandidate(candidateId);

        if (candidateResponse.success && candidateResponse.data) {
          const candidateData = candidateResponse.data;
          setCandidate(candidateData);

          // Fetch job details
          const jobResponse = await backendClient.getJob(candidateData.jobId.toString());
          if (jobResponse.success && jobResponse.data) {
            setJob(jobResponse.data);
          } else {
            setError('Failed to load job details');
          }

          // Set notes
          setNotes(candidateData.notes || '');

          // Set interview responses from backend
          setResponses(candidateData.responses || []);
        } else {
          setError(candidateResponse.error?.message || 'Candidate not found');
        }
      } catch (err) {
        setError('Failed to load candidate data');
        console.error('Error fetching candidate:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateData();
  }, [params.id]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading candidate data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !candidate || !job) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Candidate Not Found</h2>
          <p className="text-gray-400 mb-4">{error || "The candidate you're looking for doesn't exist."}</p>
          <Button onClick={() => router.back()} className={`bg-gradient-to-r ${gradients.primary} hover:from-blue-700 hover:to-cyan-700 text-white`}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Get phone interview response from responses (type is uppercase from backend)
  const phoneResponse = responses.find(r => r.type === 'PHONE');
  const phoneTranscript = phoneResponse && phoneResponse.transcript
    ? JSON.parse(phoneResponse.transcript)
    : [];
  const phoneData = {
    duration: phoneResponse ? formatDuration(phoneResponse.duration || 0) : '0:00',
    transcript: phoneTranscript,
    audioUrl: phoneResponse?.content || '',
    sentiment: 'positive', // Could be calculated from transcript analysis
    confidence: 87, // Could be calculated from AI analysis
    keyTopics: phoneTranscript.length > 0 ? extractKeyTopics(phoneTranscript) : [],
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      invited: 'text-blue-400',
      started: 'text-yellow-400',
      in_progress: 'text-orange-400',
      submitted: 'text-blue-400',
      scored: 'text-cyan-400',
      shortlisted: 'text-green-400',
      rejected: 'text-red-400',
    };
    return colors[status] || 'text-gray-400';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      invited: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      started: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      in_progress: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      scored: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      shortlisted: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gray-950">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients.bgPrimary}`} />
        <div className={`absolute inset-0 bg-gradient-to-tr ${gradients.bgSecondary}`} />
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 border-b border-gray-800 bg-black/50 backdrop-blur-lg sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <Link href="/hr/dashboard" className="hover:opacity-80 transition-opacity">
                <span className="text-gray-300 hover:text-white">Dashboard</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" className="relative p-2 hover:bg-gray-800">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400">{user?.role || 'HR'}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients.primary} flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold">
                          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white w-56" align="end">
                  <div className="px-3 py-2 border-b border-gray-800">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-400">{user?.email || ''}</p>
                  </div>
                  <DropdownMenuItem className="hover:bg-gray-800">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem className="hover:bg-gray-800">
                    Team Members
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800">
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    className="text-red-400 hover:bg-gray-800"
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="relative z-10 bg-black/30 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-semibold text-white">{candidate.name}</h1>
                  <Badge variant="outline" className={getStatusBadgeColor(candidate.status)}>
                    {candidate.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {candidate.email}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <Briefcase className="w-3 h-3" />
                    {job.title}
                  </span>
                  {candidate.score?.overall && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      AI Score: {candidate.score.overall}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {candidate.status?.toUpperCase() === 'SCORED' && (
                <>
                  <Button
                    variant="outline"
                    className="gap-2 bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Shortlist
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="gap-2 bg-gray-800 border-gray-600 hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900/90 backdrop-blur-md border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Overview</TabsTrigger>
            <TabsTrigger value="phone-interview" className="data-[state=active]:bg-gray-700">
              <Phone className="w-4 h-4 mr-2" />
              Phone Interview
            </TabsTrigger>
            <TabsTrigger value="responses" className="data-[state=active]:bg-gray-700">All Responses</TabsTrigger>
            <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-gray-700">
              <Brain className="w-4 h-4 mr-2" />
              AI Analysis
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Candidate Info */}
              <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Candidate Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Applied for</p>
                    <p className="font-medium text-white">{job.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Department</p>
                    <p className="font-medium text-white">{job.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="font-medium text-white">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Interview Date</p>
                    <p className="font-medium text-white">
                      {candidate.submittedAt ? new Date(candidate.submittedAt).toLocaleDateString() : 'Not submitted'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Score Breakdown */}
              <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    AI Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {candidate.score ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-2xl font-bold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                          Overall Score: {candidate.score.overall}/100
                        </span>
                        {candidate.score.overall && candidate.score.overall >= 80 && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Top Performer
                          </Badge>
                        )}
                      </div>

                      {/* Radar Chart for Competency Visualization */}
                      {candidate.score.breakdown && (
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-300 mb-4 text-center">Competency Overview</h4>
                          <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={[
                              { subject: 'Communication', value: candidate.score.breakdown.communication || 0, fullMark: 100 },
                              { subject: 'Technical', value: candidate.score.breakdown.technicalSkills || 0, fullMark: 100 },
                              { subject: 'Problem Solving', value: candidate.score.breakdown.problemSolving || 0, fullMark: 100 },
                              { subject: 'Culture Fit', value: candidate.score.breakdown.cultureFit || 0, fullMark: 100 },
                              { subject: 'Experience', value: candidate.score.breakdown.experience || 0, fullMark: 100 },
                            ]}>
                              <PolarGrid stroke="#374151" />
                              <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                              />
                              <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                              />
                              <Radar
                                name="Score"
                                dataKey="value"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.5}
                                strokeWidth={2}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Progress Bars for Detailed Breakdown */}
                      <div className="space-y-4">
                        {candidate.score.breakdown && Object.entries(candidate.score.breakdown).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="text-white font-medium">{value}/100</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${gradients.primary} rounded-full transition-all duration-300`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">No AI scoring available yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Section */}
            {candidate.score?.aiInsights && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Summary & Insights */}
                <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                  <CardHeader className="border-b border-gray-800">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-400" />
                      AI Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {candidate.score.aiInsights.summary}
                    </p>

                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        Key Strengths
                      </h4>
                      <ul className="space-y-1.5">
                        {candidate.score.aiInsights.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Areas for Development
                      </h4>
                      <ul className="space-y-1.5">
                        {candidate.score.aiInsights.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {candidate.score.aiInsights.redFlags && candidate.score.aiInsights.redFlags.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          Red Flags
                        </h4>
                        <ul className="space-y-1">
                          {candidate.score.aiInsights.redFlags.map((flag, idx) => (
                            <li key={idx} className="text-sm text-red-300 flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations & Skills */}
                <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                  <CardHeader className="border-b border-gray-800">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      Recommendations & Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <h4 className="text-sm font-semibold text-cyan-400 mb-3">HR Recommendations</h4>
                      <ul className="space-y-2">
                        {candidate.score.aiInsights.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-300 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {candidate.score.skillsExtracted && (
                      <div>
                        <h4 className="text-sm font-semibold text-blue-400 mb-3">Extracted Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.score.skillsExtracted.map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={`${
                                skill.matchesJobRequirement
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              }`}
                            >
                              {skill.name}
                              {skill.yearsOfExperience && (
                                <span className="ml-1 text-xs opacity-75">({skill.yearsOfExperience}y)</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {candidate.score.competencyRanking && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-blue-400 mb-2">Performance Ranking</h4>
                        <p className="text-sm text-gray-300 mb-1">{candidate.score.competencyRanking.comparisonText}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>Rank {candidate.score.competencyRanking.rank} of {candidate.score.competencyRanking.totalCandidates}</span>
                          <span>•</span>
                          <span>{candidate.score.competencyRanking.percentile}th percentile</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                      <span className="text-xs text-gray-400">AI Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                            style={{ width: `${candidate.score.aiInsights.confidenceLevel}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-blue-400">
                          {candidate.score.aiInsights.confidenceLevel}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Proctoring & Integrity Section */}
            <Card className={`bg-gray-900/90 backdrop-blur-md border-gray-700 ${
              candidate.score?.cheating_detected 
                ? 'border-red-500/50 shadow-red-500/20 shadow-lg' 
                : 'border-green-500/30'
            }`}>
              <CardHeader className={`border-b border-gray-800 ${
                (candidate.score?.cheating_detected || candidate.score?.cheatingDetected)
                  ? 'bg-red-500/10' 
                  : 'bg-green-500/10'
              }`}>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${
                    (candidate.score?.cheating_detected || candidate.score?.cheatingDetected) ? 'text-red-400' : 'text-green-400'
                  }`} />
                  Proctoring & Integrity Report
                  {(candidate.score?.cheating_detected || candidate.score?.cheatingDetected) ? (
                    <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Violations Detected
                    </Badge>
                  ) : (
                    <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      No Issues
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {(candidate.score?.cheating_detected || candidate.score?.cheatingDetected) ? (
                  <>
                    {/* Violation Summary */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h4 className="font-semibold text-red-400">Integrity Violations Found</h4>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        Our AI proctoring system detected potential violations during the interview session.
                        Review the evidence below.
                      </p>
                      {(candidate.score?.proctoring_score_penalty || candidate.score?.proctoringScorePenalty) && (candidate.score?.proctoring_score_penalty || candidate.score?.proctoringScorePenalty) > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Score Penalty Applied:</span>
                          <span className="font-semibold text-red-400">
                            -{(candidate.score?.proctoring_score_penalty || candidate.score?.proctoringScorePenalty)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Evidence Details */}
                    {(candidate.score?.cheating_evidence || candidate.score?.cheatingEvidence) && (candidate.score?.cheating_evidence || candidate.score?.cheatingEvidence)?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Violation Evidence ({(candidate.score?.cheating_evidence || candidate.score?.cheatingEvidence)?.length} incidents)
                        </h4>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                          {(candidate.score?.cheating_evidence || candidate.score?.cheatingEvidence)?.map((evidence: { question_id?: number; timestamp?: string; evidence_type?: string; reason?: string; confidence?: number; frame_data?: string }, idx: number) => (
                            <div key={idx} className="bg-gray-800/50 border border-red-500/20 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Camera className="w-4 h-4 text-red-400" />
                                  <span className="text-sm font-medium text-white">
                                    {evidence.evidence_type ? evidence.evidence_type.charAt(0).toUpperCase() + evidence.evidence_type.slice(1) : 'Evidence'} {idx + 1}
                                  </span>
                                </div>
                                {evidence.timestamp && (
                                  <span className="text-xs text-gray-400">
                                    {new Date(evidence.timestamp).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2">
                                {evidence.evidence_type && (
                                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                    {evidence.evidence_type.toUpperCase()}
                                  </Badge>
                                )}
                                {evidence.reason && (
                                  <p className="text-sm text-gray-300">{evidence.reason}</p>
                                )}
                                {evidence.confidence && (
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>AI Confidence:</span>
                                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-red-500 rounded-full"
                                        style={{ width: `${Math.round(evidence.confidence * 100)}%` }}
                                      />
                                    </div>
                                    <span>{Math.round(evidence.confidence * 100)}%</span>
                                  </div>
                                )}
                                {evidence.frame_data && (
                                  <div className="mt-2">
                                    <img
                                      src={evidence.frame_data.startsWith('data:') ? evidence.frame_data : `data:image/jpeg;base64,${evidence.frame_data}`}
                                      alt={`Violation evidence ${idx + 1}`}
                                      className="w-full max-w-[200px] h-auto rounded border border-red-500/30"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-green-400">Interview Integrity Verified</h4>
                    </div>
                    <p className="text-sm text-gray-300">
                      Our AI proctoring system did not detect any violations during the interview session.
                      The candidate maintained proper interview conduct throughout.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Interview Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes about this candidate..."
                  className="min-h-[150px] bg-gray-800 border-gray-600 text-white"
                />
                <Button className={`mt-4 bg-gradient-to-r ${gradients.primary} hover:from-blue-700 hover:to-cyan-700 text-white`}>
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Phone Interview Tab */}
          <TabsContent value="phone-interview" className="space-y-6">
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
              <CardHeader className={`bg-gradient-to-r ${gradients.cardHeader} border-b border-gray-700 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <PhoneCall className="w-6 h-6 text-blue-400" />
                      AI Phone Interview Recording
                    </CardTitle>
                    <CardDescription className="text-gray-300 mt-2">
                      Automated technical screening call conducted by our AI assistant
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                    <span className="text-sm text-gray-300 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {phoneData.duration}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Audio Player */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`bg-gradient-to-r ${gradients.primary} hover:from-blue-700 hover:to-cyan-700 text-white`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-medium">Interview Recording</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-gray-700 border-gray-600">
                      <Download className="w-4 h-4" />
                      Download Audio
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div className={`h-2 bg-gradient-to-r ${gradients.primary} rounded-full`} style={{ width: '35%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>5:23</span>
                      <span>15:32</span>
                    </div>
                  </div>
                </div>

                {/* Key Topics */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-200 mb-3">Key Topics Discussed</h4>
                  <div className="flex flex-wrap gap-2">
                    {phoneData.keyTopics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sentiment Analysis */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Candidate Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-green-400">{phoneData.confidence}%</div>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Overall Sentiment</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Positive
                      </Badge>
                      <MessageCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Interview Transcript
                  </h4>
                  <div className="bg-gray-800 rounded-lg p-4 max-h-[500px] overflow-y-auto space-y-4">
                    {phoneData.transcript.map((entry, index) => (
                      <div key={index} className={`flex gap-3 ${entry.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] ${entry.speaker === 'AI' ? 'order-2' : 'order-1'}`}>
                          <div className={`rounded-lg p-3 ${
                            entry.speaker === 'AI'
                              ? `bg-gradient-to-r ${gradients.cardHeader} border border-blue-500/30`
                              : 'bg-gray-700'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-semibold ${
                                entry.speaker === 'AI' ? 'text-blue-400' : 'text-cyan-400'
                              }`}>
                                {entry.speaker === 'AI' ? (
                                  <>
                                    <Sparkles className="w-3 h-3 inline mr-1" />
                                    AI Assistant
                                  </>
                                ) : (
                                  <>
                                    <User className="w-3 h-3 inline mr-1" />
                                    {entry.speaker}
                                  </>
                                )}
                              </span>
                              <span className="text-xs text-gray-500">{entry.time}</span>
                            </div>
                            <p className="text-sm text-gray-200">{entry.text}</p>
                          </div>
                        </div>
                        <div className={`flex-shrink-0 ${entry.speaker === 'AI' ? 'order-1' : 'order-2'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            entry.speaker === 'AI'
                              ? `bg-gradient-to-r ${gradients.primary}`
                              : 'bg-cyan-600'
                          }`}>
                            {entry.speaker === 'AI' ? (
                              <Mic className="w-4 h-4 text-white" />
                            ) : (
                              <span className="text-xs font-semibold text-white">
                                {entry.speaker.split(' ').map(n => n[0]).join('')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Responses Tab */}
          <TabsContent value="responses" className="space-y-6">
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Interview Responses</CardTitle>
                <CardDescription className="text-gray-300">
                  All answers provided by the candidate ({responses.length} responses)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {responses.length > 0 ? (
                  <Accordion type="single" collapsible className="space-y-4">
                    {responses.map((response, index) => {
                      const Icon = QUESTION_TYPE_ICONS[response.type as keyof typeof QUESTION_TYPE_ICONS] || FileText;

                      return (
                        <AccordionItem key={response.id} value={`response-${response.id}`} className="bg-gray-800 rounded-lg border border-gray-700">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                              <div className={`p-2 bg-gradient-to-r ${gradients.cardHeader} rounded-lg`}>
                                <Icon className="w-5 h-5 text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white">Question {index + 1}</p>
                                <p className="text-sm text-gray-400">{response.questionText || 'Interview Question'}</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-3">
                              <div className="bg-gray-700 rounded-lg p-4">
                                <p className="text-sm text-gray-200 whitespace-pre-wrap">
                                  {response.transcript || response.content || 'No transcript available'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {response.questionScore != null && (
                                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                    AI Score: {Math.round(response.questionScore)}/100
                                  </Badge>
                                )}
                                {response.duration != null && response.duration > 0 && (
                                  <span className="text-xs text-gray-400">
                                    Duration: {Math.floor(response.duration / 60)}:{(response.duration % 60).toString().padStart(2, '0')}
                                  </span>
                                )}
                                {response.type && (
                                  <Badge variant="outline" className="text-gray-400 border-gray-600">
                                    {response.type}
                                  </Badge>
                                )}
                              </div>
                              {response.questionFeedback && (
                                <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                                  <p className="text-xs text-gray-400 mb-1">AI Feedback:</p>
                                  <p className="text-sm text-gray-300">
                                    {typeof response.questionFeedback === 'object' && 'feedback' in response.questionFeedback
                                      ? String(response.questionFeedback.feedback)
                                      : JSON.stringify(response.questionFeedback)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">No responses recorded yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai-analysis" className="space-y-6">
            {candidate.score?.aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-cyan-400" />
                      AI Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className={`bg-gradient-to-r ${candidate.score.overall && candidate.score.overall >= 85 ? gradients.success : 'from-yellow-500/10 to-orange-500/10'} border ${candidate.score.overall && candidate.score.overall >= 85 ? 'border-green-500/30' : 'border-yellow-500/30'} rounded-lg p-4`}>
                        <p className={`${candidate.score.overall && candidate.score.overall >= 85 ? 'text-green-400' : 'text-yellow-400'} font-semibold mb-2`}>
                          {candidate.score.overall && candidate.score.overall >= 85 ? 'Strong Candidate' : 'Moderate Candidate'}
                        </p>
                        <p className="text-sm text-gray-200">
                          {candidate.score.aiInsights.summary}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200 mb-2">Key Strengths:</p>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {candidate.score.aiInsights.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Comparison with Other Candidates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {candidate.score?.competencyRanking ? (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Overall Ranking</span>
                          <span className="text-white font-semibold">
                            #{candidate.score.competencyRanking.rank} of {candidate.score.competencyRanking.totalCandidates}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                            style={{ width: `${candidate.score.competencyRanking.percentile}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{candidate.score.competencyRanking.comparisonText}</p>
                      </div>

                      {candidate.score.breakdown && (
                        <>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Technical Skills</span>
                              <span className="text-white font-semibold">{candidate.score.breakdown.technicalSkills}/100</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${gradients.success} rounded-full transition-all duration-300`}
                                style={{ width: `${candidate.score.breakdown.technicalSkills || 0}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Communication</span>
                              <span className="text-white font-semibold">{candidate.score.breakdown.communication}/100</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${gradients.accent} rounded-full transition-all duration-300`}
                                style={{ width: `${candidate.score.breakdown.communication || 0}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Problem Solving</span>
                              <span className="text-white font-semibold">{candidate.score.breakdown.problemSolving}/100</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${gradients.primary} rounded-full transition-all duration-300`}
                                style={{ width: `${candidate.score.breakdown.problemSolving || 0}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Culture Fit</span>
                              <span className="text-white font-semibold">{candidate.score.breakdown.cultureFit || 0}/100</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${gradients.cardHeaderAlt} rounded-full transition-all duration-300`}
                                style={{ width: `${candidate.score.breakdown.cultureFit || 0}%` }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No ranking data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
            ) : (
              <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                <CardContent>
                  <p className="text-gray-400 text-center py-8">No AI insights available yet</p>
                </CardContent>
              </Card>
            )}

            {/* Skills Match */}
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Skills Match Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Cloud Computing', 'Microservices', 'Docker/Kubernetes', 'Event Sourcing', 'API Design', 'Problem Solving', 'Team Collaboration', 'Communication'].map((skill) => (
                    <div key={skill} className="bg-gray-800 rounded-lg p-3 text-center">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-300">{skill}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}