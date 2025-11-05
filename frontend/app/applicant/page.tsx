'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload, Search, Briefcase, Target, TrendingUp, Users,
  Award, Sparkles, Play, ArrowRight, Clock, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FloatingParticles } from '@/components/FloatingParticles';
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
      icon: <Target className="w-6 h-6 text-white" />,
      title: 'Smart Job Matching',
      description: 'Get matched with jobs that fit your skills and experience.',
      stats: '95% accuracy',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      title: 'Track Progress',
      description: 'Monitor your improvement with detailed analytics.',
      stats: 'Skill insights',
    },
    {
      icon: <Award className="w-6 h-6 text-white" />,
      title: 'Get Certified',
      description: 'Earn readiness certificates to showcase to employers.',
      stats: 'Industry recognized',
    },
    {
      icon: <Briefcase className="w-6 h-6 text-white" />,
      title: 'Career Opportunities',
      description: 'Explore exclusive openings from top companies.',
      stats: 'Exclusive access',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Jobs', icon: <Briefcase className="w-5 h-5 text-white" /> },
    { value: '87%', label: 'Success Rate', icon: <Trophy className="w-5 h-5 text-white" /> },
    { value: '500+', label: 'Companies', icon: <Users className="w-5 h-5 text-white" /> },
    { value: '24/7', label: 'Support', icon: <Clock className="w-5 h-5 text-white" /> },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const cardClass =
    'bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl hover:border-white/30 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)]';

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black opacity-90" />
        <FloatingParticles />
      </div>

      {/* Navbar - Inverted Colors */}
      <nav className="relative z-20 border-b border-gray-700 bg-white/95 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Sparkles className="w-5 h-5 text-black" />
            <span className="font-semibold text-black">HireWave</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/applicant/dashboard')}
              className="text-gray-700 hover:text-black transition"
            >
              Dashboard
            </Button>
            <Button
              onClick={() => router.push('/applicant/onboarding')}
              className="bg-black text-white rounded-xl hover:opacity-90"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-6 pt-24 pb-32 text-center">
        <motion.h1
          {...fadeInUp}
          className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white"
        >
          Build Your Career
          <br />
          <span className="text-white">With Confidence</span>
        </motion.h1>

        <motion.p
          {...fadeInUp}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Explore top job opportunities, prepare for interviews, and showcase your skills — all in one place.
        </motion.p>

        {/* Search */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for jobs by title, skills, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-12 pr-32 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg backdrop-blur-lg rounded-2xl focus:ring-2 focus:ring-white/20"
            />
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-black rounded-xl hover:opacity-90 transition"
            >
              Search
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4 flex-wrap"
        >
          <Button
            onClick={() => router.push('/applicant/jobs')}
            variant="outline"
            className="border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
          >
            <Briefcase className="w-4 h-4 mr-2" /> Browse Jobs
          </Button>
          <Button
            onClick={() => router.push('/applicant/practice/new')}
            variant="outline"
            className="border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
          >
            <Play className="w-4 h-4 mr-2" /> Practice Now
          </Button>
          <Button
            onClick={() => router.push('/applicant/onboarding')}
            variant="outline"
            className="border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
          >
            <Upload className="w-4 h-4 mr-2" /> Upload Resume
          </Button>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-20 border-y border-white/10">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              {...fadeInUp}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <Card className={cardClass}>
                <CardContent className="space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="bg-white/10 text-white border-white/20 mb-4">Features</Badge>
            <h2 className="text-4xl font-bold mb-4 text-white">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Tools, insights, and opportunities to help you reach your next career goal.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className={cardClass}>
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{feature.description}</p>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {feature.stats}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-12 text-center shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful candidates who landed their dream jobs with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/applicant/onboarding')}
                size="lg"
                className="bg-white text-black hover:opacity-90 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Get Started Free
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => router.push('/applicant/practice/demo')}
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
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