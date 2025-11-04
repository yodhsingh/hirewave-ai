'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
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

// Mock pipeline stages with theme-consistent colors
const PIPELINE_STAGES = [
  { id: 'invited', label: 'Invited', color: 'from-blue-600 to-blue-500', textColor: 'text-blue-400', bgColor: 'bg-blue-600' },
  { id: 'started', label: 'Started', color: 'from-yellow-500 to-yellow-400', textColor: 'text-yellow-400', bgColor: 'bg-yellow-500' },
  { id: 'in_progress', label: 'In Progress', color: 'from-orange-500 to-orange-400', textColor: 'text-orange-400', bgColor: 'bg-orange-500' },
  { id: 'submitted', label: 'Submitted', color: 'from-blue-600 to-cyan-600', textColor: 'text-blue-400', bgColor: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
  { id: 'scored', label: 'AI Scored', color: 'from-cyan-600 to-cyan-500', textColor: 'text-cyan-400', bgColor: 'bg-cyan-600' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'from-green-600 to-green-500', textColor: 'text-green-400', bgColor: 'bg-green-600' },
  { id: 'rejected', label: 'Rejected', color: 'from-red-600 to-red-500', textColor: 'text-red-400', bgColor: 'bg-red-600' },
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
  const [activeTab, setActiveTab] = useState('candidates');

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
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* White Background Section - Matching Home Page */}
      <div className="relative bg-white">
        {/* Background SVG - fixed aspect, full viewport width, no cropping */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 min-[1400px]:-translate-y-[150px] z-0 pointer-events-none">
          <div className="relative w-screen aspect-[1920/1172]">
            {/* Mask that crops from the TOP after 1400px while preserving bottom integrity */}
            <div className="absolute inset-x-0 bottom-0 h-full min-[1400px]:h-[calc(100%_-_150px)] overflow-hidden">
              <Image
                src="/Background.svg"
                alt="Background"
                fill
                sizes="100vw"
                className="object-cover object-bottom"
                priority
              />
            </div>
          </div>
        </div>

        {/* Navigation - Matching Home Page Exactly */}
        <nav className="relative z-50 px-6 lg:px-16 py-6">
          <div className="max-w-[1400px] mx-auto relative flex items-center justify-between">
            {/* Logo with Brain.svg */}
            <div className="flex items-center space-x-2">
              <Image src="/Brain.svg" alt="Logo" width={24} height={24} />
              <span className="text-xl font-semibold text-black">
                HireWave.ai
              </span>
            </div>
            {/* Navigation Links - centered absolutely */}
            <div className="hidden md:flex items-center space-x-10 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
              <Link href="/hr/dashboard" className="text-black/60 hover:text-black transition-colors text-sm">
                Dashboard
              </Link>
              <button className="text-black/60 hover:text-black transition-colors text-sm">
                Jobs
              </button>
              <button className="text-black font-medium transition-colors text-sm">
                Job Details
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push(`/hr/jobs/invite?jobId=${params.id}`)}
                className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-6 py-2.5 text-sm font-normal"
              >
                Invite Candidates
              </Button>
              {/* Mobile hamburger */}
              <button
                aria-label="Open navigation menu"
                className="md:hidden w-10 h-10 rounded-lg border border-black/10 bg-white/80 hover:bg-white transition-colors flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black">
                  <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section - Matching Home Page Style */}
        <section className="relative z-10 px-6 lg:px-16 pt-12 pb-28 lg:pt-12 lg:pb-32 min-h-[720px] lg:min-h-[780px] xl:min-h-[840px]">
          {/* Mobile-only white backdrop to ensure sufficient white area under hero text */}
          <div className="absolute inset-x-0 translate-y-[-200px] bottom-0 h-full overflow-hidden lg:hidden">
            <Image
              src="/Background.svg"
              alt="Background"
              fill
              sizes="100vw"
              className="object-cover object-bottom"
              priority
            />
          </div>
          <div className="relative z-[2] max-w-[1400px] mx-auto">
            {/* Full-width vector curve behind heading */}
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-[calc(100%-180px)] top-[clamp(300px,23vw,440px)] pb-20 w-screen opacity-40 z-[1] hidden sm:block">
              <Image
                src="/Vector 1.svg"
                alt=""
                width={1920}
                height={160}
                className="w-screen h-auto"
              />
            </div>
            <div className="text-center space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 text-left"
              >
                <span className="text-[10px] font-light text-black/50 uppercase tracking-[0.35em]">
                  HIRING DASHBOARD
                </span>
              </motion.div>

              {/* Main Heading with decorative elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                {/* Left-aligned text */}
                <h1 className="relative text-center text-[32px] md:text-[56px] lg:text-[72px] font-light leading-[1.07] tracking-tight text-black">
                  MANAGE
                  <span className="ml-2 font-medium inline-flex items-baseline relative overflow-visible">
                    {candidates.length}+
                  </span>
                  <br />
                  CANDIDATES FOR
                  <br />
                  <span className="font-medium">{job.title.toUpperCase()}</span>
                </h1>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 pt-8 justify-center"
              >
                <Button
                  onClick={() => router.push(`/hr/jobs/invite?jobId=${params.id}`)}
                  className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2"
                >
                  <span>Invite More Candidates</span>
                  <Image src="/Forward.svg" alt="" width={16} height={16} className="opacity-90" />
                </Button>

                <Button
                  onClick={() => setActiveTab('analytics')}
                  variant="outline"
                  className="border border-black/20 bg-transparent hover:bg-black/5 text-black rounded-lg px-8 py-3 text-sm font-normal transition-all inline-flex items-center gap-2"
                >
                  <span>View Analytics</span>
                  <Image src="/Double Right.svg" alt="" width={18} height={18} className="opacity-90" />
                </Button>
              </motion.div>

              {/* Stats Row - Bottom Center */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-8 pt-8"
              >
                {/* Key Stats */}
                <div className="flex flex-col gap-2 text-center">
                  <p className="text-[10px] text-black/40 uppercase tracking-wider">Pipeline Progress</p>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xl font-normal text-black">{job.stats?.shortlisted || 0}</div>
                      <div className="text-xs text-black/60">Shortlisted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-normal text-black">{job.stats?.scored || 0}</div>
                      <div className="text-xs text-black/60">AI Scored</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-normal text-black">
                        {job.stats?.total ? Math.round((job.stats.submitted / job.stats.total) * 100) : 0}%
                      </div>
                      <div className="text-xs text-black/60">Completion</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* Main Content - Dark Section - Matching Home Page */}
      <section className="relative bg-[#0F0F0F] py-24 z-10 overflow-hidden text-white">
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          {/* Quick Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[20px] p-6 text-center">
                <div className="text-3xl font-light text-white mb-2">{candidates.length}</div>
                <div className="text-white/70 text-sm">Total Candidates</div>
              </div>
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[20px] p-6 text-center">
                <div className="text-3xl font-light text-green-400 mb-2">{job.stats?.shortlisted || 0}</div>
                <div className="text-white/70 text-sm">Shortlisted</div>
              </div>
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[20px] p-6 text-center">
                <div className="text-3xl font-light text-cyan-400 mb-2">{job.stats?.scored || 0}</div>
                <div className="text-white/70 text-sm">AI Scored</div>
              </div>
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[20px] p-6 text-center">
                <div className="text-3xl font-light text-white mb-2">
                  {job.stats?.total ? Math.round((job.stats.submitted / job.stats.total) * 100) : 0}%
                </div>
                <div className="text-white/70 text-sm">Completion Rate</div>
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-light text-white mb-12">Candidate Pipeline</h2>

            {/* Simplified Pipeline View */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {PIPELINE_STAGES.map((stage) => {
                const count = candidates.filter(c => c.status === stage.id).length;
                const percentage = candidates.length > 0 ? (count / candidates.length) * 100 : 0;

                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative group"
                  >
                    <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[20px] p-6 text-center">
                      <div className="text-2xl font-light text-white mb-2">{count}</div>
                      <div className="text-white/70 text-xs font-light mb-3">{stage.label}</div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-500 ease-in-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Main Content Tabs - Modern Design */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-16">
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
            <TabsContent value="overview" className="space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-8"
              >
                {/* Job Description Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 md:p-12 min-h-[400px] flex flex-col">
                    <h3 className="text-2xl lg:text-3xl font-light text-white leading-snug mb-6">
                      Job Description
                    </h3>
                    <p className="text-white/70 leading-relaxed mb-8 flex-1">{job.description}</p>
                    {job.requirements && job.requirements.length > 0 && (
                      <div>
                        <h4 className="text-lg font-light mb-4 text-white">Requirements</h4>
                        <ul className="space-y-3">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="text-sm text-white/70 flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Key Metrics Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="relative group"
                >
                  <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 md:p-12 min-h-[400px] flex flex-col">
                    <h3 className="text-2xl lg:text-3xl font-light text-white leading-snug mb-8">
                      Key Metrics
                    </h3>
                    <div className="space-y-8 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Total Applications</span>
                        <span className="text-3xl md:text-4xl font-light text-white">{job.stats?.total || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Completion Rate</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300 ease-in-out"
                              style={{ width: `${job.stats?.total ? (job.stats.submitted / job.stats.total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-lg font-light text-white">
                            {job.stats?.total ? Math.round((job.stats.submitted / job.stats.total) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">AI Scored</span>
                        <span className="text-2xl font-light text-cyan-400">{job.stats?.scored || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Shortlisted</span>
                        <span className="text-2xl font-light text-green-400">{job.stats?.shortlisted || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
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
                                    <span className={`font-medium ${candidate.scores.breakdown.technicalSkills >= 80 ? 'text-green-400' :
                                      candidate.scores.breakdown.technicalSkills >= 60 ? 'text-cyan-400' :
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
                                    <span className={`font-medium ${candidate.scores.breakdown.communication >= 80 ? 'text-green-400' :
                                      candidate.scores.breakdown.communication >= 60 ? 'text-cyan-400' :
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
                              {candidate.scores?.overall ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="font-semibold text-white">{candidate.scores.overall}</span>
                                  {candidate.scores.overall >= 80 && (
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-400 mb-1">Technical</p>
                              {candidate.scores?.breakdown?.technicalSkills ? (
                                <span className={`font-medium ${candidate.scores.breakdown.technicalSkills >= 80 ? 'text-green-400' :
                                  candidate.scores.breakdown.technicalSkills >= 60 ? 'text-cyan-400' :
                                    'text-gray-400'
                                  }`}>
                                  {candidate.scores.breakdown.technicalSkills}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-400 mb-1">Communication</p>
                              {candidate.scores?.breakdown?.communication ? (
                                <span className={`font-medium ${candidate.scores.breakdown.communication >= 80 ? 'text-green-400' :
                                  candidate.scores.breakdown.communication >= 60 ? 'text-cyan-400' :
                                    'text-gray-400'
                                  }`}>
                                  {candidate.scores.breakdown.communication}
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
                    <div className="text-2xl md:text-3xl font-bold text-white">24 min</div>
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
                <HiringFunnelChart />
                <TimeToHireChart />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                <CandidateSourcesChart />
                <ApplicationsOverTimeChart />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

    </div>
  );
}