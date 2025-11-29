'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Footer from '@/components/layout/Footer';
import {
  ArrowLeft,
  Users,
  Phone,
  Video,
  FileText,
  Code,
  MessageSquare,
  Filter,
  Search,
  MoreVertical,
  UserPlus,
  Mail,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  User,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  Edit,
  Copy,
  ExternalLink,
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
import type { Job, Candidate } from '@/types';
import { gradients } from '@/lib/theme';
import { useAuthStore } from '@/lib/store/authStore';
import {
  HiringFunnelChart,
  TimeToHireChart,
  CandidateSourcesChart,
  ApplicationsOverTimeChart,
} from '@/components/hr/AnalyticsCharts';
import { useQuery } from '@tanstack/react-query';
import { backendClient, apiKeys } from '@/lib/api/backend-client';
import { toast } from 'sonner';

// Pipeline stages with theme-consistent colors (uppercase IDs to match backend)
const PIPELINE_STAGES = [
  { id: 'INVITED', label: 'Invited', color: 'from-blue-600 to-blue-500', textColor: 'text-blue-400', bgColor: 'bg-blue-600' },
  { id: 'STARTED', label: 'Started', color: 'from-yellow-500 to-yellow-400', textColor: 'text-yellow-400', bgColor: 'bg-yellow-500' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'from-orange-500 to-orange-400', textColor: 'text-orange-400', bgColor: 'bg-orange-500' },
  { id: 'SUBMITTED', label: 'Submitted', color: 'from-blue-600 to-cyan-600', textColor: 'text-blue-400', bgColor: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
  { id: 'SCORED', label: 'AI Scored', color: 'from-cyan-600 to-cyan-500', textColor: 'text-cyan-400', bgColor: 'bg-cyan-600' },
  { id: 'SHORTLISTED', label: 'Shortlisted', color: 'from-green-600 to-green-500', textColor: 'text-green-400', bgColor: 'bg-green-600' },
  { id: 'REJECTED', label: 'Rejected', color: 'from-red-600 to-red-500', textColor: 'text-red-400', bgColor: 'bg-red-600' },
];

const QUESTION_TYPE_ICONS = {
  PHONE: Phone,
  VIDEO: Video,
  TEXT: FileText,
  CODE: Code,
  MULTIPLE_CHOICE: MessageSquare,
};

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('candidates');

  const jobId = params.id as string;

  // Fetch job details from backend
  const { data: jobResponse, isLoading: isLoadingJob, error: jobError } = useQuery({
    queryKey: apiKeys.jobs.detail(jobId),
    queryFn: async () => {
      console.log('Fetching job details for:', jobId);
      const response = await backendClient.getJob(jobId);
      console.log('Job API response:', response);
      if (!response.success) {
        console.error('Failed to fetch job:', response.error);
        toast.error('Failed to load job', {
          description: response.error?.message || 'Could not load job details',
        });
      }
      return response;
    },
    enabled: !!user && !!jobId,
  });

  // Fetch candidates for this job from backend
  const { data: candidatesResponse, isLoading: isLoadingCandidates, error: candidatesError } = useQuery({
    queryKey: apiKeys.candidates.list(jobId),
    queryFn: async () => {
      console.log('Fetching candidates for job:', jobId);
      const response = await backendClient.getCandidates(jobId);
      console.log('Candidates API response:', response);
      if (!response.success) {
        console.error('Failed to fetch candidates:', response.error);
      }
      return response;
    },
    enabled: !!user && !!jobId,
  });

  const job = jobResponse?.success ? jobResponse.data : null;
  const candidates = candidatesResponse?.success ? candidatesResponse.data : [];

  // Show loading state
  if (isLoadingJob || isLoadingCandidates) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        <div className="fixed inset-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradients.bgPrimary}`} />
          <div className={`absolute inset-0 bg-gradient-to-tr ${gradients.bgSecondary}`} />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-2xl font-light mb-2">Loading job details...</h2>
          <p className="text-gray-400">Please wait</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (!job) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        <div className="fixed inset-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradients.bgPrimary}`} />
          <div className={`absolute inset-0 bg-gradient-to-tr ${gradients.bgSecondary}`} />
        </div>
        <div className="relative z-10 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-light mb-2">Job Not Found</h2>
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
    if (scoreFilter !== 'all' && candidate.score?.overall !== undefined) {
      if (scoreFilter === 'high') matchesScore = candidate.score.overall >= 80;
      else if (scoreFilter === 'medium') matchesScore = candidate.score.overall >= 50 && candidate.score.overall < 80;
      else if (scoreFilter === 'low') matchesScore = candidate.score.overall < 50;
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
      invited: 'bg-blue-500/10 text-blue-400 border-blue-400/30',
      started: 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30',
      in_progress: 'bg-orange-500/10 text-orange-400 border-orange-400/30',
      submitted: 'bg-blue-500/10 text-blue-400 border-blue-400/30',
      scored: 'bg-cyan-500/10 text-cyan-400 border-cyan-400/30',
      shortlisted: 'bg-green-500/10 text-green-400 border-green-400/30',
      rejected: 'bg-red-500/10 text-red-400 border-red-400/30',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-400/30';
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

  const handleBulkMove = async (newStatus: string) => {
    try {
      // Call bulk update API
      const response = await backendClient.bulkUpdateCandidates(selectedCandidates, newStatus as any);
      if (response.success) {
        toast.success('Updated successfully', {
          description: `Moved ${selectedCandidates.length} candidate(s) to ${newStatus}`,
        });
        // Refetch candidates to get updated data
        await candidatesResponse;
        setSelectedCandidates([]);
      } else {
        toast.error('Update failed', {
          description: response.error?.message || 'Could not update candidates',
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  const handleBulkReject = () => {
    handleBulkMove('rejected');
  };

  const handleBulkInvite = () => {
    // In a real app, this would trigger email invitations
    router.push(`/hr/jobs/invite?jobId=${job?.id}&candidates=${selectedCandidates.join(',')}`);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header - Same style as HR Dashboard */}
      <nav className="relative z-10 border-b border-black/10 bg-white/90 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/hr/dashboard')}
                className="gap-2 text-black hover:bg-black/10"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="h-8 w-px bg-black/10" />
              <div>
                <h1 className="text-xl font-medium text-gray-900">{job.title}</h1>
                <p className="text-sm text-gray-500">{job.department} • {job.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push(`/hr/jobs/invite?jobId=${params.id}`)}
                className="gap-2 bg-black hover:bg-black/90 text-white rounded-xl font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Invite Candidates
              </Button>

              <Button variant="ghost" className="relative p-2 bg-black/5 hover:bg-black/10 border border-black/10 rounded-xl">
                <Bell className="w-5 h-5 text-gray-900" />
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-black/10">
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-600">HR Manager</p>
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
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/hr/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/hr/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    className="text-red-400 hover:bg-gray-800"
                    onClick={() => {
                      logout();
                      router.push('/login');
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Compact Stats Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-light text-white">{candidates.length}</div>
            <div className="text-white/60 text-sm">Total Candidates</div>
          </div>
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-light text-green-400">{job.stats?.shortlisted || 0}</div>
            <div className="text-white/60 text-sm">Shortlisted</div>
          </div>
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-light text-cyan-400">{job.stats?.scored || 0}</div>
            <div className="text-white/60 text-sm">AI Scored</div>
          </div>
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-light text-white">
              {job.stats?.total ? Math.round((job.stats.submitted / job.stats.total) * 100) : 0}%
            </div>
            <div className="text-white/60 text-sm">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="relative bg-[#0F0F0F] pb-12 z-10 overflow-hidden text-white">
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          {/* Pipeline Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-light text-white mb-6">Candidate Pipeline</h2>

            {/* Compact Pipeline View */}
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              {PIPELINE_STAGES.map((stage) => {
                const count = candidates.filter(c => c.status === stage.id).length;
                const percentage = candidates.length > 0 ? (count / candidates.length) * 100 : 0;

                return (
                  <div
                    key={stage.id}
                    className="relative bg-white/[0.04] border border-white/10 rounded-xl p-3 text-center"
                  >
                    <div className="text-xl font-light text-white">{count}</div>
                    <div className="text-white/60 text-xs">{stage.label}</div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full bg-gradient-to-r ${stage.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-center">
              <TabsList className="bg-white/[0.06] backdrop-blur-xl border border-white/20 rounded-2xl p-1.5 shadow-2xl">
                <TabsTrigger
                  value="overview"
                  className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-300 rounded-xl px-6 py-3 text-sm font-medium"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="candidates"
                  className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-300 rounded-xl px-6 py-3 text-sm font-medium"
                >
                  <span>Candidates</span>
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-light">
                    {candidates.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="questions"
                  className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-300 rounded-xl px-6 py-3 text-sm font-medium"
                >
                  <span>Questions</span>
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-light">
                    {job.questions.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-300 rounded-xl px-6 py-3 text-sm font-medium"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Job Details Card */}
              <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white">{job.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge
                          className={
                            job.status === 'ACTIVE'
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : job.status === 'DRAFT'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                          }
                        >
                          {job.status}
                        </Badge>
                        <span className="text-white/50 text-sm">
                          Created {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/hr/jobs/${job.id}/edit`)}
                        className="gap-2 bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.08]"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Job
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.id}/apply`);
                          alert('Job link copied to clipboard!');
                        }}
                        className="gap-2 bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.08]"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Job Meta Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Building className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Department</p>
                        <p className="text-sm text-white font-medium">{job.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <MapPin className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Location</p>
                        <p className="text-sm text-white font-medium">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Employment Type</p>
                        <p className="text-sm text-white font-medium">{job.roleType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Questions</p>
                        <p className="text-sm text-white font-medium">{job.questions?.length || 0} interview questions</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Job Description</h4>
                    <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                  </div>

                  {/* Requirements */}
                  {job.requirements && (
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Requirements</h4>
                      <div className="text-white/70 leading-relaxed whitespace-pre-wrap">{job.requirements}</div>
                    </div>
                  )}

                  {/* Interview Questions Summary */}
                  {job.questions && job.questions.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Interview Questions Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['PHONE', 'VIDEO', 'TEXT', 'MULTIPLE_CHOICE', 'CODE'].map((type) => {
                          const count = job.questions.filter(q => q.type === type).length;
                          const Icon = QUESTION_TYPE_ICONS[type as keyof typeof QUESTION_TYPE_ICONS];
                          return (
                            <div key={type} className="p-3 bg-white/[0.02] rounded-lg border border-white/5 text-center">
                              <Icon className="w-5 h-5 text-white/60 mx-auto mb-1" />
                              <p className="text-xl font-light text-white">{count}</p>
                              <p className="text-xs text-white/50">{type.replace('_', ' ')}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metrics Row */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Application Funnel */}
                <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-white">Application Funnel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Invited</span>
                      <span className="text-white font-medium">{job.stats?.invited || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Started</span>
                      <span className="text-white font-medium">{job.stats?.started || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Submitted</span>
                      <span className="text-white font-medium">{job.stats?.submitted || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">AI Scored</span>
                      <span className="text-cyan-400 font-medium">{job.stats?.scored || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Outcomes */}
                <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-white">Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Shortlisted</span>
                      <span className="text-green-400 font-medium">{job.stats?.shortlisted || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Rejected</span>
                      <span className="text-red-400 font-medium">{job.stats?.rejected || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">In Progress</span>
                      <span className="text-yellow-400 font-medium">{job.stats?.inProgress || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Total</span>
                      <span className="text-white font-medium">{job.stats?.total || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Rates */}
                <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-white">Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60 text-sm">Completion Rate</span>
                        <span className="text-white font-medium">
                          {job.stats?.total ? Math.round((job.stats.submitted / job.stats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                          style={{ width: `${job.stats?.total ? (job.stats.submitted / job.stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60 text-sm">Shortlist Rate</span>
                        <span className="text-white font-medium">
                          {job.stats?.submitted ? Math.round((job.stats.shortlisted / job.stats.submitted) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-600 to-green-400"
                          style={{ width: `${job.stats?.submitted ? (job.stats.shortlisted / job.stats.submitted) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60 text-sm">Rejection Rate</span>
                        <span className="text-white font-medium">
                          {job.stats?.submitted ? Math.round((job.stats.rejected / job.stats.submitted) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-red-400"
                          style={{ width: `${job.stats?.submitted ? (job.stats.rejected / job.stats.submitted) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Candidates Tab */}
            <TabsContent value="candidates" className="space-y-6">
              <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">All Candidates</CardTitle>
                      <CardDescription className="text-gray-400">
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
                          <SelectTrigger className="w-48 bg-white/[0.04] backdrop-blur-sm border-white/10 text-white h-9">
                            <SelectValue placeholder="Move to stage..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white/[0.08] backdrop-blur-md border-white/20 text-white">
                            {PIPELINE_STAGES.filter(s => s.id !== 'rejected').map(stage => (
                              <SelectItem key={stage.id} value={stage.id} className="text-white hover:bg-white/[0.04] focus:bg-white/[0.04]">{stage.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkReject}
                          className="gap-2 bg-red-500/10 border-red-400/30 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Reject
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkInvite}
                          className={`gap-2 bg-gradient-to-r ${gradients.primary} hover:from-blue-700 hover:to-cyan-700 text-white border-0`}
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
                            className="pl-10 w-64 bg-white/[0.04] backdrop-blur-sm border-white/10 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setShowFilters(!showFilters)}
                          className={`gap-2 bg-white/[0.04] backdrop-blur-sm border-white/10 text-white hover:bg-white/[0.08] ${showFilters ? 'bg-blue-500/10 border-blue-400/30' : ''}`}
                        >
                          <Filter className="w-4 h-4" />
                          Filters
                          {(statusFilter !== 'all' || scoreFilter !== 'all' || dateFilter !== 'all') && (
                            <Badge variant="outline" className="ml-1 bg-blue-500/10 text-blue-400 border-blue-400/30 px-1 py-0">
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
                  <div className="border-b border-white/10 bg-white/[0.02] backdrop-blur-sm p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="bg-white/[0.04] backdrop-blur-sm border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white/[0.08] backdrop-blur-md border-white/20">
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
                          <SelectTrigger className="bg-white/[0.04] backdrop-blur-sm border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white/[0.08] backdrop-blur-md border-white/20">
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
                          <SelectTrigger className="bg-white/[0.04] backdrop-blur-sm border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white/[0.08] backdrop-blur-md border-white/20">
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
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bulk Actions Toolbar - Fixed Position */}
                {selectedCandidates.length > 0 && (
                  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/[0.08] backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl px-6 py-4">
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
                          <SelectTrigger className="w-48 bg-white/[0.04] backdrop-blur-sm border-white/10 text-white h-9">
                            <SelectValue placeholder="Move to stage..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white/[0.08] backdrop-blur-md border-white/20 text-white">
                            {PIPELINE_STAGES.filter(s => s.id !== 'rejected').map(stage => (
                              <SelectItem key={stage.id} value={stage.id} className="text-white hover:bg-white/[0.04] focus:bg-white/[0.04]">{stage.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkReject}
                          className="gap-2 bg-red-500/10 backdrop-blur-sm border-red-400/30 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Reject
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkInvite}
                          className={`gap-2 bg-gradient-to-r ${gradients.primary} hover:from-blue-700 hover:to-cyan-700 text-white border-0`}
                        >
                          <Mail className="w-4 h-4" />
                          Invite
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCandidates([])}
                          className="text-gray-400 hover:text-white hover:bg-white/[0.04]"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <CardContent className="p-0">
                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
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
                              className="border-white/10 hover:bg-white/[0.02] cursor-pointer"
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
                                {candidate.score?.overall ? (
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{candidate.score.overall}</span>
                                    {candidate.score.overall >= 80 && (
                                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {candidate.score?.breakdown?.technicalSkills ? (
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${candidate.score.breakdown.technicalSkills >= 80 ? 'text-green-400' :
                                      candidate.score.breakdown.technicalSkills >= 60 ? 'text-cyan-400' :
                                        'text-gray-400'
                                      }`}>
                                      {candidate.score.breakdown.technicalSkills}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {candidate.score?.breakdown?.communication ? (
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${candidate.score.breakdown.communication >= 80 ? 'text-green-400' :
                                      candidate.score.breakdown.communication >= 60 ? 'text-cyan-400' :
                                        'text-gray-400'
                                      }`}>
                                      {candidate.score.breakdown.communication}
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
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/hr/candidates/${candidate.id}`)}
                                    className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="hover:bg-white/[0.04]">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-white/[0.08] backdrop-blur-md border-white/20">
                                      <DropdownMenuItem className="text-gray-200 hover:bg-white/[0.04]">
                                        View Profile
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-gray-200 hover:bg-white/[0.04]">
                                        Send Message
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-white/10" />
                                      <DropdownMenuItem className="text-green-400 hover:bg-white/[0.04]">
                                        Shortlist
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-400 hover:bg-white/[0.04]">
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
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4 p-4">
                    {filteredCandidates.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400">
                          {candidates.length === 0 ? 'No candidates yet' : 'No matching candidates found'}
                        </div>
                      </div>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
                          onClick={() => router.push(`/hr/candidates/${candidate.id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedCandidates.includes(candidate.id)}
                                onCheckedChange={() => handleSelectCandidate(candidate.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div>
                                <p className="font-medium text-white">{candidate.name}</p>
                                <p className="text-sm text-gray-400">{candidate.email}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={getStatusBadgeColor(candidate.status)}>
                              {candidate.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center">
                              <p className="text-xs text-gray-400 mb-1">Overall</p>
                              {candidate.score?.overall ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="font-semibold text-white">{candidate.score.overall}</span>
                                  {candidate.score.overall >= 80 && (
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-400 mb-1">Technical</p>
                              {candidate.score?.breakdown?.technicalSkills ? (
                                <span className={`font-medium ${candidate.score.breakdown.technicalSkills >= 80 ? 'text-green-400' :
                                  candidate.score.breakdown.technicalSkills >= 60 ? 'text-cyan-400' :
                                    'text-gray-400'
                                  }`}>
                                  {candidate.score.breakdown.technicalSkills}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-400 mb-1">Communication</p>
                              {candidate.score?.breakdown?.communication ? (
                                <span className={`font-medium ${candidate.score.breakdown.communication >= 80 ? 'text-green-400' :
                                  candidate.score.breakdown.communication >= 60 ? 'text-cyan-400' :
                                    'text-gray-400'
                                  }`}>
                                  {candidate.score.breakdown.communication}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-400">Submitted</p>
                              {candidate.submittedAt ? (
                                <span className="text-sm text-gray-300">
                                  {new Date(candidate.submittedAt).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/hr/candidates/${candidate.id}`)}
                                className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="hover:bg-white/[0.04]">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white/[0.08] backdrop-blur-md border-white/20">
                                  <DropdownMenuItem className="text-gray-200 hover:bg-white/[0.04]">
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-gray-200 hover:bg-white/[0.04]">
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem className="text-green-400 hover:bg-white/[0.04]">
                                    Shortlist
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-400 hover:bg-white/[0.04]">
                                    Reject
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Questions Tab - Enhanced with Realistic Content */}
            <TabsContent value="questions" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl lg:text-5xl font-light text-white mb-4">Interview Questions</h2>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  AI-powered questions designed to evaluate technical skills, problem-solving abilities, and cultural fit
                </p>
              </motion.div>

              <div className="space-y-8">
                {/* Question 1 - Technical Problem Solving */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 md:p-10">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <Code className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-xl font-light text-white">Technical Problem Solving</h3>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-400/30">
                            Code Challenge
                          </Badge>
                          <div className="flex items-center gap-2 text-white/60">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">45 min</span>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-medium text-white mb-3">Question:</h4>
                            <p className="text-white/80 leading-relaxed">
                              "Design a scalable system architecture for a real-time chat application that can handle 100,000 concurrent users.
                              Explain your choice of technologies, database design, and how you would handle message delivery, user presence,
                              and data consistency across multiple servers."
                            </p>
                          </div>

                          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                            <h4 className="text-lg font-medium text-green-400 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Sample Strong Answer:
                            </h4>
                            <div className="text-white/70 leading-relaxed space-y-3">
                              <p>
                                "I'd design a microservices architecture with the following components: WebSocket servers for real-time connections,
                                Redis for session management and pub/sub messaging, and PostgreSQL with read replicas for persistent data."
                              </p>
                              <p>
                                "For scalability, I'd use horizontal scaling with load balancers, implement message queues with Apache Kafka
                                for reliable delivery, and use CDN for static assets. User presence would be tracked via heartbeat mechanisms
                                with Redis TTL keys."
                              </p>
                              <p>
                                "Data consistency would be maintained through event sourcing patterns and eventual consistency models,
                                with critical operations using distributed locks when necessary."
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Question 2 - Leadership & Communication */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="relative group"
                >
                  <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 md:p-10">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-xl font-light text-white">Leadership & Team Management</h3>
                          <Badge className="bg-purple-500/10 text-purple-400 border-purple-400/30">
                            Behavioral
                          </Badge>
                          <div className="flex items-center gap-2 text-white/60">
                            <Video className="w-4 h-4" />
                            <span className="text-sm">Video Response</span>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-medium text-white mb-3">Question:</h4>
                            <p className="text-white/80 leading-relaxed">
                              "Tell me about a time when you had to lead a cross-functional team through a challenging project with tight deadlines.
                              How did you handle conflicting priorities, ensure team alignment, and maintain quality while meeting the deadline?"
                            </p>
                          </div>

                          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                            <h4 className="text-lg font-medium text-green-400 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Sample Strong Answer:
                            </h4>
                            <div className="text-white/70 leading-relaxed space-y-3">
                              <p>
                                <strong className="text-white">Situation:</strong> "I led a 12-person cross-functional team to launch a new product feature
                                in 6 weeks instead of the planned 10 weeks due to a competitive threat."
                              </p>
                              <p>
                                <strong className="text-white">Action:</strong> "I implemented daily standups, created a shared priority matrix,
                                and established clear communication channels. I negotiated scope with stakeholders, focusing on MVP features
                                while maintaining quality standards."
                              </p>
                              <p>
                                <strong className="text-white">Result:</strong> "We delivered on time with 95% of planned features,
                                increased user engagement by 40%, and the team reported high satisfaction with the collaborative process."
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Question 3 - Strategic Thinking */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="relative group"
                >
                  <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 md:p-10">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-xl font-light text-white">Strategic Vision & Planning</h3>
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-400/30">
                            Case Study
                          </Badge>
                          <div className="flex items-center gap-2 text-white/60">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">Written Response</span>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-medium text-white mb-3">Question:</h4>
                            <p className="text-white/80 leading-relaxed">
                              "Our company is considering expanding into the AI/ML space. As a Development Manager, how would you assess this opportunity,
                              build the necessary team capabilities, and create a 12-month roadmap that balances innovation with business objectives?"
                            </p>
                          </div>

                          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                            <h4 className="text-lg font-medium text-green-400 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Sample Strong Answer:
                            </h4>
                            <div className="text-white/70 leading-relaxed space-y-3">
                              <p>
                                <strong className="text-white">Market Assessment:</strong> "I'd start with competitive analysis, customer research,
                                and ROI projections. Identify specific AI use cases that align with our core business and customer pain points."
                              </p>
                              <p>
                                <strong className="text-white">Team Building:</strong> "Phase 1: Hire 2-3 senior ML engineers and 1 data scientist.
                                Phase 2: Upskill existing developers through training programs. Phase 3: Scale based on initial project success."
                              </p>
                              <p>
                                <strong className="text-white">Roadmap:</strong> "Q1-Q2: MVP development and proof of concept. Q3: Beta testing with key customers.
                                Q4: Full launch with success metrics tracking. Focus on quick wins while building long-term capabilities."
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Question 4 - Problem Solving Under Pressure */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="relative group"
                >
                  <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 md:p-10">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-xl font-light text-white">Crisis Management</h3>
                          <Badge className="bg-red-500/10 text-red-400 border-red-400/30">
                            Critical Thinking
                          </Badge>
                          <div className="flex items-center gap-2 text-white/60">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">Phone Interview</span>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-medium text-white mb-3">Scenario:</h4>
                            <p className="text-white/80 leading-relaxed">
                              "It's Friday evening, and your team's latest deployment has caused a critical bug affecting 80% of users.
                              The CEO is asking for immediate resolution, your senior developer is unreachable, and you have a skeleton crew.
                              Walk me through your decision-making process and immediate actions."
                            </p>
                          </div>

                          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                            <h4 className="text-lg font-medium text-green-400 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Sample Strong Answer:
                            </h4>
                            <div className="text-white/70 leading-relaxed space-y-3">
                              <p>
                                <strong className="text-white">Immediate Response:</strong> "First, I'd assess the severity and implement a rollback
                                if possible. Simultaneously, I'd communicate with stakeholders about the issue and expected timeline."
                              </p>
                              <p>
                                <strong className="text-white">Resource Management:</strong> "I'd quickly assemble available team members,
                                assign clear roles, and establish a war room for coordination. Contact backup developers if needed."
                              </p>
                              <p>
                                <strong className="text-white">Resolution Strategy:</strong> "Focus on the quickest path to stability - whether that's
                                a hotfix, rollback, or temporary workaround. Document everything for post-mortem analysis and process improvement."
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* AI Evaluation Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="relative group"
                >
                  <div className="relative bg-gradient-to-r from-blue-600/10 to-cyan-600/10 backdrop-blur-xl border border-blue-400/20 rounded-[28px] p-8 md:p-10">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-light text-white mb-4">AI Evaluation Criteria</h3>
                      <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                        Our AI system evaluates responses across multiple dimensions to provide comprehensive candidate assessment
                      </p>

                      <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-light text-blue-400 mb-2">Technical Depth</div>
                          <div className="text-white/60 text-sm">Architecture, scalability, best practices</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-light text-purple-400 mb-2">Leadership</div>
                          <div className="text-white/60 text-sm">Team management, decision making</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-light text-orange-400 mb-2">Strategic Thinking</div>
                          <div className="text-white/60 text-sm">Vision, planning, business acumen</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-light text-green-400 mb-2">Problem Solving</div>
                          <div className="text-white/60 text-sm">Critical thinking, adaptability</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white">Average AI Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
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

                <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white">Time to Complete</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {(() => {
                        const completedCandidates = candidates.filter(c => c.startedAt && c.submittedAt);
                        if (completedCandidates.length === 0) return '—';
                        const totalMinutes = completedCandidates.reduce((sum, c) => {
                          const started = new Date(c.startedAt!);
                          const submitted = new Date(c.submittedAt!);
                          return sum + Math.round((submitted.getTime() - started.getTime()) / (1000 * 60));
                        }, 0);
                        const avgMinutes = Math.round(totalMinutes / completedCandidates.length);
                        if (avgMinutes < 60) return `${avgMinutes} min`;
                        const hours = Math.floor(avgMinutes / 60);
                        const mins = avgMinutes % 60;
                        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
                      })()}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Average completion time</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.04] backdrop-blur-md border-white/10 sm:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white">Response Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl md:text-3xl font-bold text-green-400">
                      {job.stats?.total && job.stats.total > 0
                        ? Math.round(((job.stats.started + job.stats.inProgress + job.stats.submitted + job.stats.scored + job.stats.shortlisted) / job.stats.total) * 100)
                        : 0}%
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Started interviews</p>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6">
                <HiringFunnelChart stats={job.stats} />
                <TimeToHireChart candidates={candidates} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                <CandidateSourcesChart candidates={candidates} />
                <ApplicationsOverTimeChart candidates={candidates} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}