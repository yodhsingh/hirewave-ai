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
import { gradients } from '@/lib/theme';
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
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
});

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
    // <div className="min-h-screen bg-gray-100 text-gray-900 relative">
      <div className="min-h-screen bg-[#0F0F0F] text-white relative">
  {/* Global background image as per HireWave.ai spec */}
  {/* <div
    className="fixed inset-0 -z-20 bg-[#0F0F0F] bg-no-repeat bg-bottom bg-cover"
    style={{ backgroundImage: "url('/Background.svg')" }}
  /> */}

  {/* Subtle glass glow layer */}
  <div
    className="fixed inset-0 pointer-events-none -z-10"
    style={{
      background:
        'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)',
    }}
  />

  {/* ADD THIS: Subtle Glass Glow from Spec */}
  <div className="fixed inset-0 pointer-events-none -z-10"
    // style={{
    //   background:
    //     'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)',
    // }}
  />
      {/* ADD THIS BLOCK - Spec-compliant Scrollbar */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 9999px;
        }
        html {
          scrollbar-color: white transparent;
          scrollbar-width: thin;
        }
      `}
      </style>
      <nav className="relative z-10 border-b border-black/10 bg-white/90 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
  <div className="container mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* UI: Added text-gray-900, changed font-semibold to font-medium (per spec) */}
        <Link href="/" className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity">
          <Home className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </Link>
        {/* UI: Changed divider color to match new border */}
        <div className="h-6 w-px bg-black/10" />
        {/* UI: Removed gradient, set to primary dark text, updated font weight */}
        <h1 className={`text-xl font-medium text-gray-900`}>
          HR Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push('/hr/jobs/new')}
          className="gap-2 bg-black hover:bg-black/90 text-white rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </Button>

        {/*
          UI: This is now a "Secondary (light card)" button
          - bg-white/10 -> bg-black/5
          - hover:bg-white/15 -> hover:bg-black/10
          - border-white/10 -> border-black/10
          - text-white/90 -> text-gray-900
          - Removed redundant backdrop-blur
        */}
        <Button variant="ghost" className="relative p-2 bg-black/5 hover:bg-black/10 border border-black/10 rounded-xl transition-all duration-300">
          <Bell className="w-6 h-6 text-gray-900" />
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
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/hr/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/hr/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/hr/team')}>
                    Team Members
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/hr/help')}>
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
            <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Active Jobs</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.activeJobs}
                    </p>

                  </div>
                  <div className="p-3 bg-white/[0.08] rounded-lg">
                    <Briefcase className="w-6 h-6 text-white/80" />
                  </div>
                </div>
              </CardContent>
            </Card>


 
            <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Candidates</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.totalCandidates}
                    </p>
                    <p className="text-green-400 text-sm mt-2 flex items-center gap-1 font-medium">
                      {/* <TrendingUp className="w-3 h-3" /> */}
                      {/* +28% from last month */}
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.08] rounded-lg">
                    <BarChart className="w-6 h-6 text-white/80" />
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Interviews Today</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.interviewsToday}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-400/20 rounded-lg border border-gray-500/30">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Completion Rate</p>
                    <p className="text-3xl font-bold mt-2 text-white">
                      {stats.avgCompletionRate}%
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.08] rounded-lg">
                    <BarChart className="w-6 h-6 text-white/80" />
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Jobs Section */}
        
          <Card className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.04)]">
            <CardHeader className="border-b border-white/10">
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
                      className="pl-10 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
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
                  <Button onClick={() => router.push('/hr/jobs/new')} className="gap-2 bg-white hover:bg-white/80 text-black rounded-xl font-medium">
                    <Plus className="w-4 h-4" />Create First Job
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
                     className="p-8 hover:bg-white/5 hover:backdrop-blur-sm transition-all group cursor-pointer"
                      onClick={() => router.push(`/hr/jobs/${job.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-white group-hover:text-green-400 transition-colors">
                              {job.title}
                            </h3>
                            <Badge
                              className={
                                job.status === 'active'
                                  ? 'bg-white-500/90 text-green-400 border-green-500/50'
                                  : 'bg-white-500/90 text-red-400 border-red-300/50'
                              }
                            >
                              {job.status === 'active' ? 'Active' : job.status}
                            </Badge>
                            {/* {job.questions && job.questions.length > 0 && (
                              <Badge className="bg-gray-500/20 text-gray-100 border-grey-500/50">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {job.questions.filter(q => q.type === 'phone').length > 0 ? 'AI Interview' : 'AI Questions'}
                              </Badge>
                            )} */}
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

 
      </main>
    </div>
  );
}