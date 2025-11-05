'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Upload, Search, Briefcase, Target, TrendingUp, Users,
  Star, ChevronRight, Brain, Sparkles, Play, Award,
  Zap, Home, ArrowRight, Clock, CheckCircle, BarChart3,
  BookOpen, MessageSquare, Trophy, User, Bell, Settings, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function ApplicantLandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/applicant/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI Interview Coach',
      description: 'Practice with our intelligent AI that adapts to your responses',
      stats: 'Real-time feedback'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Smart Job Matching',
      description: 'Get matched with jobs that fit your skills and experience',
      stats: '95% accuracy'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Track Progress',
      description: 'Monitor your improvement with detailed analytics',
      stats: 'Skill insights'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Get Certified',
      description: 'Earn readiness certificates to showcase to employers',
      stats: 'Industry recognized'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Jobs', icon: <Briefcase className="w-5 h-5" /> },
    { value: '87%', label: 'Success Rate', icon: <Trophy className="w-5 h-5" /> },
    { value: '500+', label: 'Companies', icon: <Users className="w-5 h-5" /> },
    { value: '24/7', label: 'AI Available', icon: <Clock className="w-5 h-5" /> }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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
            <Link href="/about" className="transition-colors text-sm text-black/60 hover:text-black">
              About
            </Link>
            <Link href="/pricing" className="transition-colors text-sm text-black/60 hover:text-black">
              Pricing
            </Link>
            <Link href="/features" className="transition-colors text-sm text-black/60 hover:text-black">
              Features
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push('/applicant/dashboard')}
              className="text-black/60 hover:text-black"
            >
              Dashboard
            </Button>
            <Button
              onClick={() => router.push('/applicant/onboarding')}
              className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-6 py-2 text-sm font-normal inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-black/5">
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-black">Profile</p>
                      <p className="text-xs text-black/60">Job Seeker</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-black/10 text-black w-56 shadow-lg" align="end">
                <div className="px-3 py-2 border-b border-black/10">
                  <p className="text-sm font-medium text-black">Guest User</p>
                  <p className="text-xs text-black/60">Not logged in</p>
                </div>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/profile')}>
                  <User className="w-4 h-4 mr-2 text-black" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/jobs')}>
                  <Briefcase className="w-4 h-4 mr-2 text-black" />
                  Browse Jobs
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/practice')}>
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
          <div className="grid gap-12 items-center lg:grid-cols-[0.66fr_0.34fr] xl:grid-cols-[0.62fr_0.38fr] 2xl:grid-cols-[0.6fr_0.4fr]">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 text-left"
              >
                <span className="text-[10px] font-light text-black/50 uppercase tracking-[0.35em]">
                  AI-POWERED INTERVIEW PRACTICE
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <h1 className="relative text-left text-[32px] md:text-[56px] lg:text-[72px] font-light leading-[1.07] tracking-tight text-black">
                  ACE YOUR
                  <br />
                  <span className="font-medium">INTERVIEW</span>
                  <br />
                  WITH AI COACHING
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-black/70 leading-relaxed max-w-2xl"
              >
                Practice interviews with our AI coach, get instant feedback, and land your dream job.
                Join thousands who improved their interview skills.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-2xl"
              >
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/40" />
                  <Input
                    type="text"
                    placeholder="Search for jobs by title, skills, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 pr-32 h-14 bg-white/80 border-black/20 text-black placeholder:text-black/40 text-lg backdrop-blur-lg"
                  />
                  <Button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]"
                  >
                    Search Jobs
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <Button
                    onClick={() => router.push('/applicant/jobs')}
                    variant="outline"
                    className="border-black/20 bg-white/50 hover:bg-white/70 text-black"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse All Jobs
                  </Button>
                  <Button
                    onClick={() => router.push('/applicant/practice/new')}
                    variant="outline"
                    className="border-black/20 bg-white/50 hover:bg-white/70 text-black"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Practice Now
                  </Button>
                  <Button
                    onClick={() => router.push('/applicant/onboarding')}
                    variant="outline"
                    className="border-black/20 bg-white/50 hover:bg-white/70 text-black"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Resume
                  </Button>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Robot Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden md:flex justify-center items-center lg:justify-end min-h-[280px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[520px]"
            >
              <div className="absolute right-0 bottom-110">
                <Image
                  src="/image16.png"
                  alt="AI Robot"
                  width={500}
                  height={1500}
                  className="w-[260px] sm:w-[320px] md:w-[420px] lg:w-auto h-auto z-[100] lg:scale-105 mb-9 max-[1600px]:mb-20"
                  priority
                />

                {/* 85% Floating Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute top-[36%] right-2 lg:top-[30%] lg:-right-2 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/10 z-20"
                >
                  <div className="text-[44px] leading-none font-light text-black mb-1">85<span className="text-2xl align-top">%</span></div>
                  <div className="text-[12px] text-black/60 font-light">More Efficient</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 border-y border-black/10 bg-white/50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-black mb-2">
                  {stat.value}
                </div>
                <div className="text-black/60">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 mb-4">
              Features
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-black">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-black/60 max-w-3xl mx-auto">
              Our platform provides comprehensive tools to prepare you for any interview
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative group"
              >
                <Card className="relative bg-white/80 backdrop-blur-xl border-black/10 hover:bg-white/90 transition-all duration-300 h-full shadow-lg">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-black">
                      {feature.title}
                    </h3>
                    <p className="text-black/60 text-sm mb-4">
                      {feature.description}
                    </p>
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                      {feature.stats}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 border-t border-black/10 bg-white/50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30 mb-4">
              Process
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-black">
              Simple 4-Step Process
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Profile', desc: 'Upload resume or build profile', icon: <User className="w-6 h-6" /> },
              { step: '2', title: 'Browse Jobs', desc: 'Find matching opportunities', icon: <Search className="w-6 h-6" /> },
              { step: '3', title: 'Practice Interview', desc: 'AI-powered mock sessions', icon: <MessageSquare className="w-6 h-6" /> },
              { step: '4', title: 'Get Feedback', desc: 'Improve with insights', icon: <BarChart3 className="w-6 h-6" /> }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-black">{item.title}</h3>
                <p className="text-black/60 text-sm">{item.desc}</p>
                {index < 3 && (
                  <ChevronRight className="hidden md:block absolute top-10 -right-4 h-6 w-6 text-black/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-gray-50 to-white backdrop-blur-xl border border-black/10 rounded-3xl p-12 text-center shadow-xl"
          >
            <h2 className="text-4xl font-bold mb-6 text-black">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-black/70 mb-8 max-w-2xl mx-auto">
              Join thousands of successful candidates who landed their dream jobs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/applicant/onboarding')}
                size="lg"
                className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]"
              >
                Get Started Free
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => router.push('/applicant/practice/demo')}
                size="lg"
                variant="outline"
                className="border-black/20 bg-transparent hover:bg-black/5 text-black"
              >
                Try Demo Interview
                <Play className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}