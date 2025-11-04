'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload, Search, Briefcase, Target, TrendingUp, Users,
  Star, ChevronRight, Brain, Sparkles, Play, Award,
  Zap, Home, ArrowRight, Clock, CheckCircle, BarChart3,
  BookOpen, MessageSquare, Trophy, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FloatingParticles } from '@/components/FloatingParticles';
import { gradients } from '@/lib/theme';
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
      gradient: gradients.primary,
      stats: 'Real-time feedback'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Smart Job Matching',
      description: 'Get matched with jobs that fit your skills and experience',
      gradient: gradients.cardHeaderAlt,
      stats: '95% accuracy'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Track Progress',
      description: 'Monitor your improvement with detailed analytics',
      gradient: gradients.success,
      stats: 'Skill insights'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Get Certified',
      description: 'Earn readiness certificates to showcase to employers',
      gradient: gradients.accent,
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients.bgPrimary}`} />
        <div className={`absolute inset-0 bg-gradient-to-tr ${gradients.bgSecondary}`} />
        <FloatingParticles />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-800 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className={`text-xl font-bold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                Applicant Portal
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/applicant/dashboard')}
                className="text-gray-300 hover:text-white"
              >
                Dashboard
              </Button>
              <Button
                onClick={() => router.push('/applicant/onboarding')}
                className={`bg-gradient-to-r ${gradients.primary} hover:opacity-90`}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${gradients.cardHeader} border border-blue-500/30 mb-8`}
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">AI-Powered Interview Practice</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            {...fadeInUp}
            className="text-6xl md:text-7xl font-bold mb-6"
          >
            <span className={`bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
              Ace Your Interview
            </span>
            <br />
            <span className="text-white">
              With AI Coaching
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Practice interviews with our AI coach, get instant feedback, and land your dream job.
            Join thousands who improved their interview skills.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for jobs by title, skills, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-32 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg backdrop-blur-lg"
              />
              <Button
                onClick={handleSearch}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r ${gradients.primary}`}
              >
                Search Jobs
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                onClick={() => router.push('/applicant/jobs')}
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Browse All Jobs
              </Button>
              <Button
                onClick={() => router.push('/applicant/practice/new')}
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10"
              >
                <Play className="w-4 h-4 mr-2" />
                Practice Now
              </Button>
              <Button
                onClick={() => router.push('/applicant/onboarding')}
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 border-y border-gray-800">
        <div className="container mx-auto px-6">
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
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${gradients.cardHeader} rounded-xl mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
              Features
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              <span className={`bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                Everything You Need to Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                <Card className="relative bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {feature.description}
                    </p>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
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
      <section className="relative z-10 py-24 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-4">
              Process
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              <span className={`bg-gradient-to-r ${gradients.success} bg-clip-text text-transparent`}>
                Simple 4-Step Process
              </span>
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
                className="text-center"
              >
                <div className={`relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${gradients.cardHeader} rounded-2xl mb-4`}>
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
                {index < 3 && (
                  <ChevronRight className="hidden md:block absolute top-10 -right-4 h-6 w-6 text-gray-600" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`relative bg-gradient-to-br ${gradients.cardHeader} backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center`}
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Start Your Journey?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful candidates who landed their dream jobs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/applicant/onboarding')}
                size="lg"
                className="bg-white text-black hover:bg-gray-100"
              >
                Get Started Free
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => router.push('/applicant/practice/demo')}
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent hover:bg-white/10"
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