'use client';
// Force recompile - color visibility fix
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  ArrowRight,
  Plus,
  Eye,
  Edit,
  Home,
  LogOut,
  Sparkles,
  BarChart,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Building,
  User,
  Settings,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FloatingParticles } from '@/components/FloatingParticles';
import { apiClient } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { Job } from '@/types';

export default function HRDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch jobs from mock API
  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiClient.getJobs(),
  });

  const jobs = jobsResponse?.data || [];

  const stats = {
    activeJobs: jobs.filter((j: Job) => j.status === 'active').length,
    totalCandidates: jobs.reduce((sum: number, job: Job) => sum + (job.stats?.total || 0), 0),
    interviewsToday: 12,
    avgCompletionRate: 78,
  };

  const filteredJobs = jobs.filter((job: Job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gray-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-gray-900/50 to-blue-900/30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/20 via-transparent to-blue-950/20" />
        <FloatingParticles />
      </div>

      {/* Demo Login Info Banner */}
      <div className="relative z-50 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border-b border-blue-500/30">
        <div className="container mx-auto px-6 py-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-200">
              Demo Mode: Try logging in with <code className="px-2 py-0.5 bg-blue-900/50 rounded text-blue-300 font-mono">hr@company.com</code> on the home page
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 border-b border-gray-800 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                HR Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/hr/jobs/new')}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Plus className="w-4 h-4" />
                Create Job
              </Button>

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
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">DS</span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white w-56" align="end">
                  <div className="px-3 py-2 border-b border-gray-800">
                    <p className="text-sm font-medium">Dalyodh Singh</p>
                    <p className="text-xs text-gray-400">dalyodh.singh@seai.com</p>
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
                  <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Active Jobs</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.activeJobs}
                    </p>
                    <p className="text-green-400 text-sm mt-2 flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 hover:border-cyan-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Candidates</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.totalCandidates}
                    </p>
                    <p className="text-green-400 text-sm mt-2 flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      +28% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-600/20 rounded-lg border border-cyan-500/30">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 hover:border-orange-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Interviews Today</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.interviewsToday}
                    </p>
                    <p className="text-orange-400 text-sm mt-2 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      5 pending review
                    </p>
                  </div>
                  <div className="p-3 bg-orange-600/20 rounded-lg border border-orange-500/30">
                    <Calendar className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700 hover:border-green-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Completion Rate</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.avgCompletionRate}%
                    </p>
                    <p className="text-green-400 text-sm mt-2 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Above industry avg
                    </p>
                  </div>
                  <div className="p-3 bg-green-600/20 rounded-lg border border-green-500/30">
                    <BarChart className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Jobs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-900/90 backdrop-blur-md border-gray-700">
            <CardHeader className="border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-white">
                    Active Jobs
                  </CardTitle>
                  <p className="text-gray-400 text-sm mt-1">Manage your open positions</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Search jobs..."
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoadingJobs ? (
                <div className="p-8 text-center text-gray-300">
                  <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
                  Loading jobs...
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">No jobs found</h3>
                  <p className="text-gray-300 mb-4">Create your first job to start interviewing candidates</p>
                  <Button
                    onClick={() => router.push('/hr/jobs/new')}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Job
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredJobs.map((job: Job, index: number) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-8 hover:bg-gray-800/50 transition-all group cursor-pointer"
                      onClick={() => router.push(`/hr/jobs/${job.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                              {job.title}
                            </h3>
                            <Badge
                              className={
                                job.status === 'active'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                  : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                              }
                            >
                              {job.status === 'active' ? 'Active' : job.status}
                            </Badge>
                            {job.questions && job.questions.length > 0 && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {job.questions.filter(q => q.type === 'phone').length > 0 ? 'AI Phone Interview' : 'AI Questions'}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-6 text-sm mb-4 text-gray-400">
                            <span className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span>{job.department}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="text-white font-medium">{job.stats?.total || 0} candidates</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                            </span>
                          </div>

                          {job.questions && job.questions.length > 0 && (
                            <div className="text-sm text-gray-500">
                              {job.questions.length} interview questions
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-gray-700"
                            onClick={() => router.push(`/hr/jobs/${job.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-gray-700"
                            onClick={() => router.push(`/hr/jobs/${job.id}/candidates`)}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Candidates
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-gray-800">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white">
                              <DropdownMenuItem onClick={() => router.push(`/hr/jobs/${job.id}/edit`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Share Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-800" />
                              <DropdownMenuItem className="text-red-400">
                                Archive Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur border-blue-800 hover:border-blue-600 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-semibold mb-2 text-white">AI Interview Assistant</h3>
              <p className="text-sm text-gray-300">Generate interview questions with AI</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur border-blue-800 hover:border-blue-600 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Analytics Dashboard</h3>
              <p className="text-sm text-gray-300">View detailed hiring metrics</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur border-green-800 hover:border-green-600 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Candidate Pipeline</h3>
              <p className="text-sm text-gray-300">Manage all your candidates</p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}