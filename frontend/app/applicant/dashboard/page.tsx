'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Briefcase, Target, TrendingUp, Play, BookOpen,
  ChevronRight, Clock, AlertCircle, Sparkles, Home,
  BarChart3, MessageSquare, Brain, Trophy, Settings,
  LogOut, Bell, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { gradients } from '@/lib/theme';
import Link from 'next/link';
import type { ApplicantProfile, JobMatch, PracticeSession } from '@/types';
import { ViewSwitcher } from '@/components/ViewSwitcher';
import { backendClient } from '@/lib/api/backend-client';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PracticeSessionsSection } from '@/components/PracticeSessionsSection';

export default function ApplicantDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch applicant dashboard data from backend
  const { data: dashboardResponse, isLoading } = useQuery({
    queryKey: ['applicant-dashboard'],
    queryFn: async () => {
      console.log('Fetching applicant dashboard data from backend...');
      const response = await backendClient.getApplicantDashboard();
      console.log('Dashboard API response:', response);
      if (!response.success) {
        console.error('Failed to fetch dashboard:', response.error);
      }
      return response;
    },
    enabled: !!user,
  });

  // Show error toast if dashboard failed to load
  useEffect(() => {
    if (dashboardResponse && !dashboardResponse.success) {
      toast.error('Failed to load dashboard', {
        description: dashboardResponse.error?.message || 'Could not fetch dashboard data',
      });
    }
  }, [dashboardResponse]);

  const dashboardData = dashboardResponse?.success ? dashboardResponse.data : null;

  // Use data from backend or fallback to defaults
  const profile = dashboardData?.user || user;
  const stats = dashboardData?.stats || {
    totalApplications: 0,
    completedInterviews: 0,
    inProgress: 0,
    pending: 0,
    averageScore: 0,
    readinessScore: 0,
    practiceStreak: 0,
    improvementRate: 0,
  };

  const recentActivity = dashboardData?.recentActivity || [];
  const recentApplications = dashboardData?.recentApplications || [];
  const skillProgress = dashboardData?.skillProgress || [];

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white relative">
      {/* Subtle glass glow layer */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-black/10 bg-white/90 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <div className="h-6 w-px bg-black/10" />
              <h1 className="text-xl font-medium text-gray-900">
                Candidate Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/applicant/jobs')}
                variant="outline"
                className="gap-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-xl font-medium transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </Button>

              <Button
                onClick={() => router.push('/applicant/onboarding-with-parser')}
                variant="outline"
                className="gap-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-xl font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Resume
              </Button>

              <Button
                onClick={() => router.push('/applicant/practice')}
                className="gap-2 bg-black hover:bg-black/90 text-white rounded-xl font-medium shadow-sm"
              >
                <Brain className="w-4 h-4" />
                Practice Interview
              </Button>

              {/* Only show ViewSwitcher for Admin, HR users, or demo mode */}
              {(user?.role === 'ADMIN' || user?.role === 'HR' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') && (
                <ViewSwitcher />
              )}

              <Button variant="ghost" className="relative p-2 bg-black/5 hover:bg-black/10 border border-black/10 rounded-xl transition-all duration-300">
                <Bell className="w-6 h-6 text-gray-900" />
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-black/10">
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-gray-900">{user?.name || profile?.name || 'Guest User'}</p>
                        <p className="text-xs text-gray-600">{user?.email || profile?.email || 'Candidate'}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients.primary} flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold">
                          {(user?.name || profile?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white w-56" align="end">
                  <div className="px-3 py-2 border-b border-gray-800">
                    <p className="text-sm font-medium">{user?.name || profile?.name || 'Guest User'}</p>
                    <p className="text-xs text-gray-400">{user?.email || profile?.email || 'Not logged in'}</p>
                  </div>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/jobs')}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/practice')}>
                    <Brain className="w-4 h-4 mr-2" />
                    Practice Sessions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem className="hover:bg-gray-800">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
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

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          {...fadeInUp}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2 text-white">
            Welcome back, {profile?.name?.split(' ')[0] || 'User'}!
          </h2>
          <p className="text-gray-400">
            Your interview readiness score is {stats.readinessScore}% - Keep practicing to improve!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold mt-2 text-white">
                    {stats.totalApplications}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.pending} pending
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Practice Streak</p>
                  <p className="text-3xl font-bold mt-2 text-white">
                    {stats.practiceStreak}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    consecutive days
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Average Score</p>
                  <p className="text-3xl font-bold mt-2 text-white">
                    {stats.averageScore}
                  </p>
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    {stats.improvementRate > 0 && '+'}
                    {stats.improvementRate}% improvement
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Readiness Score</p>
                  <p className="text-3xl font-bold mt-2 text-white">
                    {stats.readinessScore}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.inProgress} in progress
                  </p>
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications & Activity */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Applications */}
          <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Applications</CardTitle>
              <CardDescription className="text-gray-400">Your latest job applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentApplications.length > 0 ? (
                recentApplications.map((app: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/5">
                    <div>
                      <p className="font-medium text-white">{app.jobTitle}</p>
                      <p className="text-sm text-gray-400">{app.company}</p>
                    </div>
                    <Badge
                      className={
                        app.status === 'scored' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        app.status === 'submitted' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                        'bg-gray-500/20 text-gray-300 border-gray-500/30'
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No applications yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">Your latest actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-lg border border-white/5">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'interview' ? 'bg-blue-500/20' :
                      activity.type === 'started' ? 'bg-green-500/20' :
                      'bg-orange-500/20'
                    }`}>
                      {activity.type === 'interview' ? <Brain className="w-5 h-5 text-blue-400" /> :
                       activity.type === 'started' ? <Play className="w-5 h-5 text-green-400" /> :
                       <MessageSquare className="w-5 h-5 text-orange-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{activity.title}</p>
                      <p className="text-sm text-gray-400">{activity.details}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Practice Sessions */}
        <div className="mb-8">
          <PracticeSessionsSection />
        </div>

        {/* Skill Progress */}
        <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Skill Development
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Track your interview skills progress from practice sessions
                </CardDescription>
              </div>
              <Button
                onClick={() => router.push('/applicant/practice')}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Brain className="w-4 h-4 mr-2" />
                Practice
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {skillProgress.length > 0 && skillProgress.some(s => s.current > 0) ? (
              skillProgress.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {skill.current}% / {skill.target}%
                      </span>
                      {skill.trend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </div>
                  <Progress value={skill.current} className="h-2 bg-white/10" />
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                  <Brain className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-gray-400 mb-2">No skill data yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Complete practice sessions to track your skill development
                </p>
                <Button
                  onClick={() => router.push('/applicant/practice')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Your First Practice
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
