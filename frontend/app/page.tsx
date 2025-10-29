'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FloatingParticles } from '@/components/FloatingParticles';
import {
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  BarChart3,
  Video,
  Clock,
  Shield,
  Star,
  Play,
  Check,
  TrendingUp,
  Award,
  Globe,
  Briefcase,
  ChevronRight,
  Brain,
  Target,
  Rocket
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleHRLogin = () => {
    login('hr@company.com', 'hr');
    router.push('/hr/dashboard');
  };

  const handleCandidateDemo = () => {
    router.push('/i/demo-token-123');
  };

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

  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: 'AI-Powered Video Screening',
      description: 'Advanced AI analyzes responses, body language, and communication skills automatically',
      gradient: 'from-blue-500 to-cyan-600',
      stats: '95% Accuracy'
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Smart Scoring Algorithm',
      description: 'Multi-dimensional evaluation based on technical skills, culture fit, and potential',
      gradient: 'from-cyan-500 to-blue-600',
      stats: '10x Faster'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Zero Bias Hiring',
      description: 'Focus on skills and competencies, not resumes. Every candidate gets equal opportunity',
      gradient: 'from-green-500 to-teal-600',
      stats: '100% Fair'
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Scale Without Limits',
      description: 'Handle thousands of interviews simultaneously without adding headcount',
      gradient: 'from-orange-500 to-orange-600',
      stats: '∞ Scale'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'VP of Talent, TechCorp',
      content: 'Reduced our screening time by 85% while improving quality of hires. Game-changing platform.',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'HR Director, StartupX',
      content: 'Finally, a solution that lets candidates showcase their true potential beyond the resume.',
      avatar: '👨‍💻',
      rating: 5
    },
    {
      name: 'Emma Watson',
      role: 'People Ops, ScaleUp Inc',
      content: 'The AI insights are incredibly accurate. It\'s like having 10 expert recruiters working 24/7.',
      avatar: '👩‍🦰',
      rating: 5
    }
  ];

  const stats = [
    { value: '50M+', label: 'Interviews Completed', icon: <Video className="w-5 h-5" /> },
    { value: '92%', label: 'Satisfaction Rate', icon: <Star className="w-5 h-5" /> },
    { value: '500+', label: 'Enterprise Clients', icon: <Briefcase className="w-5 h-5" /> },
    { value: '3hrs', label: 'Avg. Time to Hire', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 bg-gray-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-gray-900/50 to-blue-900/30" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/20 via-transparent to-blue-950/20" />
        {/* Floating particles */}
        <FloatingParticles />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50 px-6 py-6"
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              HireAI
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-gray-300 hover:text-white transition-colors">Features</button>
            <button className="text-gray-300 hover:text-white transition-colors">Pricing</button>
            <button className="text-gray-300 hover:text-white transition-colors">About</button>
            <Button
              onClick={handleHRLogin}
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      </motion.nav>

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">AI-Powered Hiring Platform</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Interview 10,000+
            </span>
            <br />
            <span className="text-white">
              Candidates at Once
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Revolutionary AI screening that eliminates bias, saves 85% of time, and ensures
            every candidate gets a fair chance to showcase their true potential.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={handleHRLogin}
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg rounded-2xl shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Start as HR Manager
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              onClick={handleCandidateDemo}
              size="lg"
              variant="outline"
              className="group border-2 border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white px-8 py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <Play className="w-5 h-5 mr-2" />
              Try Demo Interview
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Video Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-20 relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="aspect-video relative group cursor-pointer" onClick={() => setIsVideoPlaying(!isVideoPlaying)}>
                {!isVideoPlaying ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-cyan-600/20">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl"
                    >
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </motion.div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <span className="text-white text-2xl">Demo Video Playing...</span>
                  </div>
                )}
                {/* Dashboard Preview Image */}
                <div className="p-8">
                  <div className="bg-black/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl" />
                        <div>
                          <div className="h-4 bg-white/20 rounded w-32 mb-2" />
                          <div className="h-3 bg-white/10 rounded w-24" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg" />
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg" />
                        <div className="w-8 h-8 bg-cyan-500/20 rounded-lg" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-4">
                          <div className="h-8 bg-white/10 rounded mb-2" />
                          <div className="h-4 bg-white/5 rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="h-32 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -left-6 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm shadow-lg"
            >
              ✨ Live Now
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-6 -right-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm shadow-lg"
            >
              🚀 10x Faster
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 border-y border-white/10">
        <div className="container mx-auto px-6">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32">
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
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Next-Gen Hiring Technology
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Powered by advanced AI to transform how companies hire and how candidates showcase their talent
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"
                     style={{ backgroundImage: `linear-gradient(to right, ${feature.gradient.split(' ')[1]}, ${feature.gradient.split(' ')[3]})` }} />

                <Card className="relative bg-white/5 backdrop-blur-xl border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6`}>
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 mb-4">
                    {feature.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                      {feature.stats}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-32 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-4">
              Testimonials
            </Badge>
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Loved by HR Teams Worldwide
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                <p className="text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-3xl" />

            <div className="relative bg-gradient-to-br from-blue-600/10 to-cyan-600/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12 md:p-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Ready to Transform Your Hiring?
                  </span>
                </h2>

                <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                  Join 500+ companies already using AI to build better teams faster
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleHRLogin}
                      size="lg"
                      className="group bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl font-semibold transition-all duration-300"
                    >
                      Get Started Free
                      <Rocket className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white/20 bg-transparent hover:bg-white/10 text-white px-8 py-6 text-lg rounded-2xl font-semibold transition-all duration-300"
                    >
                      Schedule Demo
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </div>

                <div className="flex items-center justify-center gap-8 mt-12">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400">SOC2 Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400">ISO Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <span className="text-gray-400">GDPR Ready</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">HireAI</span>
            </div>

            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span>© 2024 HireAI. All rights reserved.</span>
              <button className="hover:text-white transition-colors">Privacy</button>
              <button className="hover:text-white transition-colors">Terms</button>
              <button className="hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}