'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Building,
  Phone,
  Video,
  FileText,
  Code,
  MessageSquare,
  Send,
  Download,
  Filter,
  Search,
  MoreVertical,
  ChevronRight,
  UserPlus,
  Mail,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Eye,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  Home,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockStore } from '@/lib/mock/store';
import type { Job, Candidate } from '@/types';
import { gradients } from '@/lib/theme';
import {
  HiringFunnelChart,
  TimeToHireChart,
  CandidateSourcesChart,
  ApplicationsOverTimeChart,
} from '@/components/hr/AnalyticsCharts';

// Mock pipeline stages
const PIPELINE_STAGES = [
  { id: 'invited', label: 'Invited', color: 'bg-blue-500', textColor: 'text-blue-400' },
  { id: 'started', label: 'Started', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-orange-500', textColor: 'text-orange-400' },
  { id: 'submitted', label: 'Submitted', color: 'bg-blue-500', textColor: 'text-blue-400' },
  { id: 'scored', label: 'AI Scored', color: 'bg-cyan-500', textColor: 'text-cyan-400' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-green-500', textColor: 'text-green-400' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500', textColor: 'text-red-400' },
];

const QUESTION_TYPE_ICONS = {
  phone: Phone,
  video: Video,
  text: FileText,
  code: Code,
  multiple_choice: MessageSquare,
};

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Fetch job details using mock store
    const jobId = params.id as string;
    const jobData = mockStore.getJobById(jobId);
    if (jobData) {
      setJob(jobData);
      // Fetch candidates for this job
      const candidatesData = mockStore.getCandidatesByJobId(jobId);
      setCandidates(candidatesData);
    }
  }, [params.id]);

  if (!job) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
          <p className="text-gray-400 mb-4">The job you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/hr/dashboard')} className={`bg-gradient-to-r ${gradients.primary}`}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;

    // Score filter
    let matchesScore = true;
    if (scoreFilter !== 'all' && candidate.scores?.overall !== undefined) {
      if (scoreFilter === 'high') matchesScore = candidate.scores.overall >= 80;
      else if (scoreFilter === 'medium') matchesScore = candidate.scores.overall >= 50 && candidate.scores.overall < 80;
      else if (scoreFilter === 'low') matchesScore = candidate.scores.overall < 50;
    }

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all' && candidate.submittedAt) {
      const submittedDate = new Date(candidate.submittedAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dateFilter === 'today') matchesDate = daysDiff === 0;
      else if (dateFilter === 'week') matchesDate = daysDiff <= 7;
      else if (dateFilter === 'month') matchesDate = daysDiff <= 30;
    }

    return matchesSearch && matchesStatus && matchesScore && matchesDate;
  });

  const getStatusColor = (status: string) => {
    const stage = PIPELINE_STAGES.find(s => s.id === status);
    return stage ? stage.textColor : 'text-gray-400';
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

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    }
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleBulkMove = (newStatus: string) => {
    // In a real app, this would call an API
    setCandidates(prev =>
      prev.map(c =>
        selectedCandidates.includes(c.id)
          ? { ...c, status: newStatus as any }
          : c
      )
    );
    setSelectedCandidates([]);
  };

  const handleBulkReject = () => {
    handleBulkMove('rejected');
  };

  const handleBulkInvite = () => {
    // In a real app, this would trigger email invitations
    router.push(`/hr/jobs/invite?jobId=${job?.id}&candidates=${selectedCandidates.join(',')}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0">
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
              <div className="h-6 w-px bg-gray-700" />
              <span className="text-white font-semibold">Candidate Pipeline</span>
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
                        <p className="text-sm font-medium text-white">Dalyodh Singh</p>
                        <p className="text-xs text-gray-400">HR Manager</p>
                      </div>
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients.primary} flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold">DS</span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white w-56" align="end">
                  <div className="px-3 py-2 border-b border-gray-800">
                    <p className="text-sm font-medium">Dalyodh Singh</p>
                    <p className="text-xs text-gray-400">22f3001166@ds.study.iitm.ac.in</p>
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
                    onClick={() => router.push('/')}
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
                <h1 className="text-xl font-semibold text-white">{job.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {job.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push(`/hr/jobs/invite?jobId=${params.id}`)}
                className={`gap-2 bg-gradient-to-r ${gradients.primary} hover:from-blue-700 hover:to-cyan-700`}
              >
                <UserPlus className="w-4 h-4" />
                Invite Candidates
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-gray-800 border-gray-600 hover:bg-gray-700">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700">
                  <DropdownMenuItem className="text-gray-200 hover:bg-gray-800">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-200 hover:bg-gray-800">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reminders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Archive Job
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Candidate Pipeline */}
        <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {PIPELINE_STAGES.map((stage) => {
                const count = candidates.filter(c => c.status === stage.id).length;
                const percentage = candidates.length > 0 ? (count / candidates.length) * 100 : 0;

                return (
                  <div key={stage.id} className="text-center">
                    <div className="relative mb-2">
                      <div className="h-32 bg-gray-800 rounded-lg overflow-hidden">
                        <div
                          className={`absolute bottom-0 w-full ${stage.color} opacity-50 transition-all`}
                          style={{ height: `${percentage}%` }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{count}</span>
                      </div>
                    </div>
                    <p className={`text-sm font-medium ${stage.textColor}`}>{stage.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900/90 backdrop-blur-md border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Overview</TabsTrigger>
            <TabsTrigger value="candidates" className="data-[state=active]:bg-gray-700">
              Candidates ({candidates.length})
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-gray-700">
              Questions ({job.questions.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">{job.description}</p>
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2 text-gray-200">Requirements:</h4>
                      <ul className="space-y-1">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Applications</span>
                    <span className="text-2xl font-bold text-white">{job.stats?.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Completion Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={job.stats?.total ? (job.stats.submitted / job.stats.total) * 100 : 0}
                        className="w-24 h-2 bg-gray-700"
                      />
                      <span className="text-sm font-semibold text-white">
                        {job.stats?.total ? Math.round((job.stats.submitted / job.stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">AI Scored</span>
                    <span className="text-lg font-semibold text-cyan-400">{job.stats?.scored || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Shortlisted</span>
                    <span className="text-lg font-semibold text-green-400">{job.stats?.shortlisted || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-6">
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">All Candidates</CardTitle>
                    <CardDescription className="text-gray-300">
                      {selectedCandidates.length > 0
                        ? `${selectedCandidates.length} candidate${selectedCandidates.length > 1 ? 's' : ''} selected`
                        : 'Manage and review all candidates for this position'
                      }
                    </CardDescription>
                  </div>

                  {/* Bulk Actions in Header */}
                  {selectedCandidates.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <Select onValueChange={handleBulkMove}>
                        <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white h-9">
                          <SelectValue placeholder="Move to stage..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700 text-white">
                          {PIPELINE_STAGES.filter(s => s.id !== 'rejected').map(stage => (
                            <SelectItem key={stage.id} value={stage.id} className="text-white hover:bg-gray-800 focus:bg-gray-800">{stage.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkReject}
                        className="gap-2 bg-red-900/20 border-red-500/50 text-red-400 hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                        Reject
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkInvite}
                        className="gap-2 bg-blue-900/20 border-blue-500/50 text-blue-400 hover:bg-blue-900/30"
                      >
                        <Mail className="w-4 h-4" />
                        Invite
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCandidates([])}
                        className="text-gray-400 hover:text-white"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search candidates..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64 bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 ${showFilters ? 'bg-blue-900/30 border-blue-500/50' : ''}`}
                      >
                        <Filter className="w-4 h-4" />
                        Filters
                        {(statusFilter !== 'all' || scoreFilter !== 'all' || dateFilter !== 'all') && (
                          <Badge variant="outline" className="ml-1 bg-blue-500/20 text-blue-400 border-blue-500/50 px-1 py-0">
                            {[statusFilter !== 'all', scoreFilter !== 'all', dateFilter !== 'all'].filter(Boolean).length}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              {/* Advanced Filters Panel */}
              {showFilters && (
                <div className="border-b border-gray-700 bg-gray-800/50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="all">All Status</SelectItem>
                          {PIPELINE_STAGES.map(stage => (
                            <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">AI Score</label>
                      <Select value={scoreFilter} onValueChange={setScoreFilter}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="all">All Scores</SelectItem>
                          <SelectItem value="high">High (80-100)</SelectItem>
                          <SelectItem value="medium">Medium (50-79)</SelectItem>
                          <SelectItem value="low">Low (0-49)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Submitted</label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Last 7 Days</SelectItem>
                          <SelectItem value="month">Last 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-400">
                      Showing {filteredCandidates.length} of {candidates.length} candidates
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatusFilter('all');
                        setScoreFilter('all');
                        setDateFilter('all');
                        setSearchTerm('');
                      }}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              )}

              {/* Bulk Actions Toolbar - Fixed Position */}
              {selectedCandidates.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-blue-900/95 backdrop-blur-lg border border-blue-500/50 rounded-lg shadow-2xl px-6 py-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCandidates.length === filteredCandidates.length}
                        onCheckedChange={handleSelectAll}
                        className="border-blue-400"
                      />
                      <span className="text-sm font-medium text-white">
                        {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected
                      </span>
                    </div>

                    <div className="h-8 w-px bg-blue-400/30" />

                    <div className="flex items-center gap-2">
                      <Select onValueChange={handleBulkMove}>
                        <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white h-9">
                          <SelectValue placeholder="Move to stage..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700 text-white">
                          {PIPELINE_STAGES.filter(s => s.id !== 'rejected').map(stage => (
                            <SelectItem key={stage.id} value={stage.id} className="text-white hover:bg-gray-800 focus:bg-gray-800">{stage.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkReject}
                        className="gap-2 bg-red-900/20 border-red-500/50 text-red-400 hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                        Reject
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkInvite}
                        className="gap-2 bg-blue-900/20 border-blue-500/50 text-blue-400 hover:bg-blue-900/30"
                      >
                        <Mail className="w-4 h-4" />
                        Invite
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCandidates([])}
                        className="text-gray-400 hover:text-white"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-transparent">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-gray-300">Candidate</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">
                        <div className="flex items-center gap-1.5">
                          Overall
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300">Technical</TableHead>
                      <TableHead className="text-gray-300">Communication</TableHead>
                      <TableHead className="text-gray-300">Submitted</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="text-gray-400">
                            {candidates.length === 0 ? 'No candidates yet' : 'No matching candidates found'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <TableRow
                          key={candidate.id}
                          className="border-gray-700 hover:bg-gray-800/50 cursor-pointer"
                          onClick={() => router.push(`/hr/candidates/${candidate.id}`)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedCandidates.includes(candidate.id)}
                              onCheckedChange={() => handleSelectCandidate(candidate.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-white">{candidate.name}</p>
                              <p className="text-sm text-gray-400">{candidate.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeColor(candidate.status)}>
                              {candidate.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {candidate.scores?.overall ? (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{candidate.scores.overall}</span>
                                {candidate.scores.overall >= 80 && (
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {candidate.scores?.breakdown?.technicalSkills ? (
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${
                                  candidate.scores.breakdown.technicalSkills >= 80 ? 'text-green-400' :
                                  candidate.scores.breakdown.technicalSkills >= 60 ? 'text-blue-400' :
                                  'text-gray-400'
                                }`}>
                                  {candidate.scores.breakdown.technicalSkills}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {candidate.scores?.breakdown?.communication ? (
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${
                                  candidate.scores.breakdown.communication >= 80 ? 'text-green-400' :
                                  candidate.scores.breakdown.communication >= 60 ? 'text-blue-400' :
                                  'text-gray-400'
                                }`}>
                                  {candidate.scores.breakdown.communication}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {candidate.submittedAt ? (
                              <span className="text-gray-300">
                                {new Date(candidate.submittedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/hr/candidates/${candidate.id}`)}
                                className="text-blue-400 hover:bg-gray-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="hover:bg-gray-700">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-900 border-gray-700">
                                  <DropdownMenuItem className="text-gray-200 hover:bg-gray-800">
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-gray-200 hover:bg-gray-800">
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-gray-700" />
                                  <DropdownMenuItem className="text-green-400 hover:bg-gray-800">
                                    Shortlist
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                                    Reject
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Interview Questions</CardTitle>
                <CardDescription className="text-gray-300">
                  Review the questions candidates will answer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.questions.map((question, index) => {
                  const Icon = QUESTION_TYPE_ICONS[question.type as keyof typeof QUESTION_TYPE_ICONS] || FileText;

                  return (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 bg-gradient-to-r ${gradients.cardHeader} rounded-lg`}>
                            <Icon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1 text-white">Question {index + 1}</h4>
                            <p className="text-gray-300 mb-2">{question.question}</p>
                            {question.description && (
                              <p className="text-sm text-gray-400">{question.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3">
                              <Badge variant="outline" className="bg-gray-700 border-gray-600 text-gray-300">
                                {question.type.replace('_', ' ')}
                              </Badge>
                              {question.timeLimit && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.floor(question.timeLimit / 60)}:{(question.timeLimit % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                              {question.required && (
                                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white">Average AI Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                    {candidates.filter(c => c.scores?.overall).length > 0
                      ? Math.round(
                          candidates
                            .filter(c => c.scores?.overall)
                            .reduce((sum, c) => sum + (c.scores?.overall || 0), 0) /
                          candidates.filter(c => c.scores?.overall).length
                        )
                      : 0}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Based on AI evaluation</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white">Time to Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">24 min</div>
                  <p className="text-xs text-gray-400 mt-1">Average completion time</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white">Response Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {job.stats?.total && job.stats.total > 0
                      ? Math.round(((job.stats.started + job.stats.inProgress + job.stats.submitted + job.stats.scored + job.stats.shortlisted) / job.stats.total) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Started interviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <HiringFunnelChart />
              <TimeToHireChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CandidateSourcesChart />
              <ApplicationsOverTimeChart />
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}