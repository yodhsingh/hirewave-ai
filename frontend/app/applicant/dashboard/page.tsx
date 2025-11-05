'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Briefcase, Target, TrendingUp, Play, BookOpen,
  ChevronRight, Clock, AlertCircle, Sparkles, Home,
  BarChart3, MessageSquare, Brain, Trophy, Settings,
  LogOut, Bell, CheckCircle, Code
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
import { FloatingParticles } from '@/components/FloatingParticles';
import Link from 'next/link';
import type { ApplicantProfile, JobMatch, PracticeSession } from '@/types';

export default function ApplicantDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load profile from localStorage or create mock
    const savedProfile = localStorage.getItem('applicantProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile({
        id: '1',
        name: 'Akash Kumar',
        email: '22f2000946@ds.study.iitm.ac.in',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        desiredRoles: ['Software Engineer', 'Full Stack Developer'],
        experience: 5,
        currentRole: 'Software Engineer',
        location: 'Chandigarh, Punjab',
        createdAt: new Date(),
        updatedAt: new Date(),
        practiceSessions: [],
        applications: [],
      });
    }
  }, []);

  // Mock data
  const stats = {
    readinessScore: 78,
    practiceStreak: 3,
    totalSessions: 12,
    averageScore: 75,
    improvementRate: 12,
    applicationsSubmitted: 5,
  };

  const recentActivity = [
    { type: 'practice', title: 'Completed Practice Session', time: '2 hours ago', score: 82 },
    { type: 'application', title: 'Applied to Senior Developer', time: '1 day ago' },
    { type: 'feedback', title: 'Received AI Feedback', time: '2 days ago', improvement: '+5%' },
  ];

  const upcomingInterviews = [
    { company: 'TechCorp', role: 'Senior Engineer', date: 'Tomorrow, 2:00 PM', type: 'Technical' },
    { company: 'StartupXYZ', role: 'Full Stack Dev', date: 'Dec 5, 10:00 AM', type: 'Behavioral' },
  ];

  const skillProgress = [
    { skill: 'Communication', current: 82, target: 90, trend: 'up' },
    { skill: 'Technical', current: 75, target: 85, trend: 'up' },
    { skill: 'Problem Solving', current: 78, target: 85, trend: 'stable' },
    { skill: 'Leadership', current: 70, target: 80, trend: 'up' },
  ];

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const cardClass = 'bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl hover:border-white/30 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)]';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black opacity-90" />
        <FloatingParticles />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/20 bg-white/95 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/applicant" className="flex items-center gap-2 hover:opacity-80 transition-opacity text-black">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Applicant Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-black">
                My Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/applicant/practice/new')}
                className="bg-black text-white hover:opacity-90 rounded-xl"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Practice
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-200 text-black">
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium">{profile.name}</p>
                        <p className="text-xs text-gray-600">Job Seeker</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-gray-200 text-black w-56" align="end">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium">{profile.name}</p>
                    <p className="text-xs text-gray-600">{profile.email}</p>
                  </div>
                  <DropdownMenuItem className="hover:bg-gray-100" onClick={() => router.push('/applicant/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-100" onClick={() => router.push('/applicant/jobs')}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-100" onClick={() => router.push('/applicant/practice')}>
                    <Brain className="w-4 h-4 mr-2" />
                    Practice Sessions
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-100">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem className="hover:bg-gray-100">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-100" onClick={() => router.push('/')}>
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
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          {...fadeInUp}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2 text-white">
            Welcome back, {profile.name.split(' ')[0]}!
          </h2>
          <p className="text-gray-400">
            Your interview readiness score is {stats.readinessScore}% - Keep practicing to improve!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
        >
          {[
            { label: 'Readiness Score', value: `${stats.readinessScore}%`, icon: Target, color: 'text-blue-400' },
            { label: 'Practice Streak', value: `${stats.practiceStreak} days`, icon: Trophy, color: 'text-yellow-400' },
            { label: 'Total Sessions', value: stats.totalSessions, icon: BookOpen, color: 'text-purple-400' },
            { label: 'Average Score', value: `${stats.averageScore}%`, icon: BarChart3, color: 'text-green-400' },
            { label: 'Improvement', value: `+${stats.improvementRate}%`, icon: TrendingUp, color: 'text-blue-400' },
            { label: 'Applications', value: stats.applicationsSubmitted, icon: Briefcase, color: 'text-orange-400' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cardClass}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">{stat.label}</p>
                      <div className={`p-2 rounded-lg bg-white/10`}>
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border-white/20 backdrop-blur-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">Overview</TabsTrigger>
            <TabsTrigger value="practice" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">Practice</TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">Applications</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">Progress</TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <motion.div
                {...fadeInUp}
                className="lg:col-span-2"
              >
                <Card className={cardClass}>
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-gray-400">Your latest actions and achievements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            activity.type === 'practice' ? 'bg-blue-500/20' :
                            activity.type === 'application' ? 'bg-green-500/20' :
                            'bg-orange-500/20'
                          }`}>
                            {activity.type === 'practice' ? <Brain className="w-5 h-5 text-blue-400" /> :
                             activity.type === 'application' ? <Briefcase className="w-5 h-5 text-green-400" /> :
                             <MessageSquare className="w-5 h-5 text-orange-400" />}
                          </div>
                          <div>
                            <p className="font-medium text-white">{activity.title}</p>
                            <p className="text-sm text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                        {activity.score && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            Score: {activity.score}
                          </Badge>
                        )}
                        {activity.improvement && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {activity.improvement}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                {/* AI Recommendations */}
                <Card className={cardClass}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                      <h3 className="font-semibold text-white">AI Recommendations</h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Practice behavioral questions today</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Work on reducing filler words</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Review system design basics</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full mt-4 bg-white text-black hover:bg-gray-100 rounded-xl"
                      onClick={() => router.push('/applicant/improvement-plan')}
                    >
                      View Full Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* Upcoming Interviews */}
                <Card className={cardClass}>
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Upcoming Interviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingInterviews.map((interview, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm text-white">{interview.company}</h4>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {interview.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{interview.role}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {interview.date}
                        </p>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                      onClick={() => router.push('/applicant/interviews')}
                    >
                      View All
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Skill Progress */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className="text-white">Skill Development</CardTitle>
                  <CardDescription className="text-gray-400">Track your improvement across key areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {skillProgress.map((skill, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-white">{skill.skill}</span>
                          <span className="text-sm text-gray-400">{skill.current}%</span>
                        </div>
                        <Progress value={skill.current} className="h-2 mb-2 bg-white/20" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Target: {skill.target}%</span>
                          {skill.trend === 'up' && (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className="text-white">Practice Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: 'General Practice', desc: 'Mixed questions for overall prep', icon: Brain },
                    { title: 'Job-Specific', desc: 'Practice for a specific role', icon: Target },
                    { title: 'Behavioral', desc: 'STAR method practice', icon: MessageSquare },
                    { title: 'Technical', desc: 'Coding and system design', icon: Code },
                  ].map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => router.push('/applicant/practice/new')}
                        className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/10">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{option.title}</h4>
                            <p className="text-sm text-gray-400">{option.desc}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className="text-white">Practice History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Complete practice sessions to see history</p>
                    <Button
                      className="mt-4 bg-white text-black hover:bg-gray-100 rounded-xl"
                      onClick={() => router.push('/applicant/practice/new')}
                    >
                      Start Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs content */}
          <TabsContent value="applications">
            <Card className={cardClass}>
              <CardContent className="py-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Application Tracking</h3>
                <p className="text-gray-400 mb-6">View and manage your job applications</p>
                <Button
                  onClick={() => router.push('/applicant/jobs')}
                  className="bg-white text-black hover:bg-gray-100 rounded-xl"
                >
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className={cardClass}>
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Progress Analytics</h3>
                <p className="text-gray-400">Detailed insights coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card className={cardClass}>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Learning Resources</h3>
                <p className="text-gray-400">Study guides and materials coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}