'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Phone, Mic, Headphones, Sparkles, ArrowRight, CheckCircle,
  Info, Clock, Home, Zap, Volume2, Shield, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FloatingParticles } from '@/components/FloatingParticles';
import { gradients } from '@/lib/theme';
import Link from 'next/link';

function PracticeSessionRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  // Redirect to voice interview page after showing the intro
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/applicant/practice/voice${jobId ? `?jobId=${jobId}` : ''}`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, jobId]);

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
              <Link href="/applicant" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Applicant Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className={`text-xl font-bold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                AI Interview Practice
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div {...fadeInUp} className="text-center mb-12">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
              Voice-Based Interview
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className={`bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                AI Interview Practice
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Practice your interview skills with our AI-powered voice interview system
            </p>
          </motion.div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Mic className="w-6 h-6" />,
                title: 'Voice-Based',
                description: 'Natural conversation with AI interviewer',
                gradient: gradients.primary
              },
              {
                icon: <Headphones className="w-6 h-6" />,
                title: 'Real-time Feedback',
                description: 'Get instant tips and suggestions',
                gradient: gradients.success
              },
              {
                icon: <Award className="w-6 h-6" />,
                title: 'Detailed Analysis',
                description: 'Comprehensive feedback report',
                gradient: gradients.accent
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 h-full">
                  <CardContent className="p-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={`bg-gradient-to-br ${gradients.cardHeader} border-white/10`}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-white">
                  <Phone className="w-6 h-6 text-cyan-400" />
                  Preparing Your Interview Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress indicator */}
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-400" />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-lg">Setting up your AI interview...</p>
                    <p className="text-gray-400">You'll be redirected in a moment</p>
                  </div>

                  {/* What to expect */}
                  <div className="bg-white/5 rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-white">
                      <Info className="w-5 h-5 text-blue-400" />
                      What to Expect
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Choose Your Method</p>
                          <p className="text-sm text-gray-400">Select between phone call or online voice interview</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">AI Interviewer</p>
                          <p className="text-sm text-gray-400">Practice with our intelligent AI that adapts to your responses</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Real-time Tips</p>
                          <p className="text-sm text-gray-400">Get helpful suggestions during your interview</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Detailed Feedback</p>
                          <p className="text-sm text-gray-400">Receive comprehensive analysis and improvement areas</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Quick tips */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="flex items-center gap-2 text-green-300">
                      <Zap className="w-5 h-5" />
                      <span className="font-medium">Pro Tip:</span> Find a quiet space and have water ready!
                    </p>
                  </div>

                  {/* Manual redirect button */}
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => router.push(`/applicant/practice/voice${jobId ? `?jobId=${jobId}` : ''}`)}
                      size="lg"
                      className={`bg-gradient-to-r ${gradients.primary} hover:opacity-90`}
                    >
                      Continue to Voice Interview
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8 text-gray-400"
          >
            <p className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Your practice session is private and secure
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PracticeSessionRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <PracticeSessionRedirectContent />
    </Suspense>
  );
}