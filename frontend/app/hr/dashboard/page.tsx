'use client';

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
  Building
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
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-pink-900/30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-purple-600/10" />
        <FloatingParticles />
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
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                HR Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/hr/jobs/new')}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4" />
                Create Job
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
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
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-purple-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Active Jobs</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.activeJobs}
                    </p>
                    <p className="text-green-400 text-sm mt-2 flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-purple-600/30 rounded-lg">
                    <Briefcase className="w-6 h-6 text-purple-400" />
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
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Total Candidates</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.totalCandidates}
                    </p>
                    <p className="text-green-400 text-sm mt-2 flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      +28% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-600/30 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
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
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-green-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Interviews Today</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.interviewsToday}
                    </p>
                    <p className="text-yellow-400 text-sm mt-2 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      5 pending review
                    </p>
                  </div>
                  <div className="p-3 bg-green-600/30 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-400" />
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
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-pink-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Completion Rate</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.avgCompletionRate}%
                    </p>
                    <p className="text-green-400 text-sm mt-2 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Above industry avg
                    </p>
                  </div>
                  <div className="p-3 bg-pink-600/30 rounded-lg">
                    <BarChart className="w-6 h-6 text-pink-400" />
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
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="border-b border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Active Jobs
                  </CardTitle>
                  <p className="text-gray-300 text-sm mt-1">Manage your open positions</p>
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
                    className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Job
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredJobs.map((job: Job, index: number) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-800/50 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/hr/jobs/${job.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-white group-hover:text-purple-400 transition-colors">
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
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {job.questions.filter(q => q.type === 'phone').length > 0 ? 'AI Phone Interview' : 'AI Questions'}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.stats?.total || 0} candidates
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {job.questions && job.questions.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Questions:</span>
                              <Badge variant="outline" className="text-xs border-gray-700">
                                {job.questions.length} total
                              </Badge>
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
          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur border-purple-800 hover:border-purple-600 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
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