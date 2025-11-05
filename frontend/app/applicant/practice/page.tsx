'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Home,
  User,
  Bell,
  Play,
  Brain,
  Target,
  MessageSquare,
  Code,
  Trophy,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  Star,
  ChevronRight,
  Settings,
  LogOut,
  Briefcase,
  Plus,
  History,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ApplicantProfile } from '@/types';

interface PracticeSession {
  id: string;
  type: 'behavioral' | 'technical' | 'general' | 'job-specific';
  title: string;
  score: number;
  duration: number;
  completedAt: Date;
  feedback: string[];
}

export default function ApplicantPracticePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [practiceHistory, setPracticeHistory] = useState<PracticeSession[]>([]);

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('applicantProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      // Default profile
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

    // Mock practice history
    setPracticeHistory([
      {
        id: '1',
        type: 'behavioral',
        title: 'Behavioral Interview Practice',
        score: 85,
        duration: 25,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        feedback: ['Great use of STAR method', 'Could improve on specific examples']
      },
      {
        id: '2',
        type: 'technical',
        title: 'Technical Interview - React',
        score: 78,
        duration: 35,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        feedback: ['Strong technical knowledge', 'Work on explaining complex concepts']
      },
      {
        id: '3',
        type: 'general',
        title: 'General Interview Practice',
        score: 82,
        duration: 20,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        feedback: ['Good confidence level', 'Practice speaking more clearly']
      }
    ]);
  }, []);

  const practiceOptions = [
    {
      type: 'general',
      title: 'General Practice',
      description: 'Mixed questions for overall interview preparation',
      icon: Brain,
      color: 'from-blue-600 to-cyan-600',
      duration: '15-30 min',
      difficulty: 'Beginner'
    },
    {
      type: 'behavioral',
      title: 'Behavioral Interview',
      description: 'STAR method practice with common behavioral questions',
      icon: MessageSquare,
      color: 'from-purple-600 to-pink-600',
      duration: '20-40 min',
      difficulty: 'Intermediate'
    },
    {
      type: 'technical',
      title: 'Technical Interview',
      description: 'Coding problems and system design questions',
      icon: Code,
      color: 'from-green-600 to-teal-600',
      duration: '30-60 min',
      difficulty: 'Advanced'
    },
    {
      type: 'job-specific',
      title: 'Job-Specific Practice',
      description: 'Tailored questions based on your target roles',
      icon: Target,
      color: 'from-orange-600 to-red-600',
      duration: '25-45 min',
      difficulty: 'Intermediate'
    }
  ];

  const stats = {
    totalSessions: practiceHistory.length,
    averageScore: Math.round(practiceHistory.reduce((acc, session) => acc + session.score, 0) / practiceHistory.length),
    totalTime: practiceHistory.reduce((acc, session) => acc + session.duration, 0),
    streak: 3, // Mock streak
    improvement: 12 // Mock improvement percentage
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      {/* Background SVG */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 min-[1400px]:-translate-y-[150px] z-0 pointer-events-none">
        <div className="relative w-screen aspect-[1920/1172]">
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

      {/* Navigation */}
      <nav className="relative z-50 px-6 lg:px-16 py-6">
        <div className="max-w-[1400px] mx-auto relative flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/Brain.svg" alt="Logo" width={24} height={24} />
            <span className="text-xl font-semibold text-black">
              HireWave.ai
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <Link href="/applicant/dashboard" className="transition-colors text-sm text-black/60 hover:text-black">
              Dashboard
            </Link>
            <Link href="/applicant/jobs" className="transition-colors text-sm text-black/60 hover:text-black">
              Jobs
            </Link>
            <Link href="/applicant/practice" className="transition-colors text-sm text-black/60 hover:text-black">
              Practice
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/applicant/practice/new')}
              className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-6 py-2 text-sm font-normal inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Practice
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-black/5">
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-black">{profile.name}</p>
                      <p className="text-xs text-black/60">Job Seeker</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-black/10 text-black w-56 shadow-lg" align="end">
                <div className="px-3 py-2 border-b border-black/10">
                  <p className="text-sm font-medium text-black">{profile.name}</p>
                  <p className="text-xs text-black/60">{profile.email}</p>
                </div>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/profile')}>
                  <User className="w-4 h-4 mr-2 text-black" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/jobs')}>
                  <Briefcase className="w-4 h-4 mr-2 text-black" />
                  Browse Jobs
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5">
                  <Brain className="w-4 h-4 mr-2 text-black" />
                  Practice Sessions
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/notifications')}>
                  <Bell className="w-4 h-4 mr-2 text-black" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/10" />
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/settings')}>
                  <Settings className="w-4 h-4 mr-2 text-black" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                  onClick={() => router.push('/')}
                >
                  <LogOut className="w-4 h-4 mr-2 text-red-600" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-16 pt-12 pb-28 lg:pt-12 lg:pb-32 min-h-[720px] lg:min-h-[780px] xl:min-h-[840px]">
        <div className="relative z-[2] max-w-[1400px] mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 text-left"
            >
              <span className="text-[10px] font-light text-black/50 uppercase tracking-[0.35em]">
                PRACTICE CENTER
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <h1 className="relative text-center text-[32px] md:text-[56px] lg:text-[72px] font-light leading-[1.07] tracking-tight text-black">
                PRACTICE
                <br />
                <span className="font-medium">SESSIONS</span>
              </h1>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center pt-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { label: 'Sessions', value: stats.totalSessions, icon: History },
                  { label: 'Avg Score', value: `${stats.averageScore}%`, icon: Trophy },
                  { label: 'Total Time', value: formatDuration(stats.totalTime), icon: Clock },
                  { label: 'Streak', value: `${stats.streak} days`, icon: Award },
                  { label: 'Improvement', value: `+${stats.improvement}%`, icon: TrendingUp },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-black mb-1">{stat.value}</div>
                      <div className="text-sm text-black/60">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Practice Content - Dark Section */}
      <section className="relative bg-[#0F0F0F] py-24 z-10 overflow-hidden text-white">
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Practice Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Choose Practice Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {practiceOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => router.push(`/applicant/practice/new?type=${option.type}`)}
                        className="w-full p-6 bg-white/[0.04] rounded-lg hover:bg-white/[0.08] transition-all text-left border border-white/10 hover:border-white/20"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${option.color}`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1">{option.title}</h4>
                              <p className="text-sm text-white/60 mb-2">{option.description}</p>
                              <div className="flex items-center gap-4">
                                <Badge variant="outline" className="border-white/20 text-white/70">
                                  {option.duration}
                                </Badge>
                                <Badge variant="outline" className="border-white/20 text-white/70">
                                  {option.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/40" />
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {practiceHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 mx-auto text-white/30 mb-3" />
                      <p className="text-white/60">No practice sessions yet</p>
                      <Button
                        className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600"
                        onClick={() => router.push('/applicant/practice/new')}
                      >
                        Start Practice
                      </Button>
                    </div>
                  ) : (
                    practiceHistory.map((session, index) => (
                      <div key={session.id} className="p-4 bg-white/[0.04] rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm text-white">{session.title}</h4>
                          <Badge className={`${getScoreColor(session.score)} bg-transparent border-current`}>
                            {session.score}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/60 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.duration}m
                          </span>
                          <span>{formatTimestamp(session.completedAt)}</span>
                        </div>
                        <Progress value={session.score} className="h-1 mb-2" />
                        <p className="text-xs text-white/50">{session.feedback[0]}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => router.push('/applicant/practice/new')}
                    className="w-full justify-start bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10"
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start New Practice
                  </Button>
                  <Button
                    onClick={() => router.push('/applicant/practice/feedback')}
                    className="w-full justify-start bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10"
                    variant="outline"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button
                    onClick={() => router.push('/applicant/practice/voice')}
                    className="w-full justify-start bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10"
                    variant="outline"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Voice Practice
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}