'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Briefcase, MapPin, Clock, DollarSign, Building, Users,
  ChevronRight, Home, ArrowLeft, Star, Target, Brain,
  Play, CheckCircle, AlertCircle, Calendar, Globe,
  Heart, Shield, TrendingUp, BookOpen, MessageSquare,
  Sparkles, Award, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloatingParticles } from '@/components/FloatingParticles';
import { gradients } from '@/lib/theme';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const [isApplied, setIsApplied] = useState(false);

  // Fetch job details
  const { data: jobResponse, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => apiClient.getJobById(jobId),
  });

  const job = jobResponse?.data;

  // Mock data for demonstration
  const matchScore = 85;
  const salary = { min: 120000, max: 180000, currency: 'USD' };
  const benefits = [
    { icon: Heart, label: 'Health Insurance', description: 'Comprehensive medical, dental, vision' },
    { icon: Shield, label: '401k Match', description: '6% company match' },
    { icon: Calendar, label: 'PTO', description: '20 days + holidays' },
    { icon: Globe, label: 'Remote Work', description: 'Flexible work from home' },
  ];

  const companyInfo = {
    name: 'TechCorp Inc.',
    size: '500-1000 employees',
    industry: 'Technology',
    founded: '2010',
    website: 'www.techcorp.com',
    culture: 'Innovation-driven with focus on work-life balance'
  };

  const interviewProcess = [
    { step: 1, title: 'Application Review', duration: '2-3 days', status: 'current' },
    { step: 2, title: 'Phone Screen', duration: '30 min', status: 'upcoming' },
    { step: 3, title: 'Technical Interview', duration: '1 hour', status: 'upcoming' },
    { step: 4, title: 'On-site/Virtual Panel', duration: '3 hours', status: 'upcoming' },
    { step: 5, title: 'Final Decision', duration: '3-5 days', status: 'upcoming' },
  ];

  const prepResources = [
    { icon: Brain, title: 'AI Mock Interview', desc: 'Practice with our AI interviewer', action: 'Start Practice' },
    { icon: BookOpen, title: 'Study Guide', desc: 'Review common questions', action: 'View Guide' },
    { icon: MessageSquare, title: 'Answer Bank', desc: 'Prepare your responses', action: 'Build Answers' },
    { icon: TrendingUp, title: 'Skill Assessment', desc: 'Test your knowledge', action: 'Take Test' },
  ];

  if (isLoading || !job) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
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
              <Button
                variant="ghost"
                onClick={() => router.push('/applicant/jobs')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Jobs
              </Button>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className={`text-xl font-bold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                Job Details
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Badge className={`${
                matchScore >= 80 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                matchScore >= 60 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
              }`}>
                {matchScore}% Match
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
                      <div className="flex flex-wrap gap-4 text-gray-300">
                        <span className="flex items-center gap-2">
                          <Building className="w-5 h-5" />
                          {companyInfo.name}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          {job.roleType}
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {job.department}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400 mb-1">
                        {matchScore}%
                      </div>
                      <p className="text-sm text-gray-400">Match Score</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                    <span className="flex items-center gap-2 text-lg">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span className="font-semibold">
                        ${salary.min / 1000}k - ${salary.max / 1000}k
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-5 h-5" />
                      Posted 3 days ago
                    </span>
                    <span className="flex items-center gap-2 text-gray-400">
                      <Users className="w-5 h-5" />
                      {job.stats?.total || 0} applicants
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Job Details Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white/5 border-white/10">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="process">Interview Process</TabsTrigger>
                  <TabsTrigger value="company">Company</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle>About the Role</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed">
                        {job.description}
                      </p>
                      <p className="text-gray-300 leading-relaxed mt-4">
                        We are looking for a talented individual to join our growing team. You will work on cutting-edge
                        projects and collaborate with cross-functional teams to deliver innovative solutions.
                      </p>

                      <h3 className="text-lg font-semibold mt-6 mb-3">Key Responsibilities</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">Design and develop scalable applications</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">Collaborate with product and design teams</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">Mentor junior team members</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">Participate in code reviews and technical discussions</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Benefits */}
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle>Benefits & Perks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {benefits.map((benefit, index) => {
                          const Icon = benefit.icon;
                          return (
                            <div key={index} className="flex gap-4 p-4 bg-white/5 rounded-lg">
                              <div className={`p-3 rounded-lg bg-gradient-to-br ${gradients.cardHeader}`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{benefit.label}</h4>
                                <p className="text-sm text-gray-400">{benefit.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="requirements" className="space-y-6">
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle>Required Skills & Experience</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">Technical Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements?.map(req => (
                            <Badge
                              key={req}
                              className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                            >
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Experience Level</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-gray-300">3+ years of professional experience</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-gray-300">Experience with modern frameworks</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-gray-300">Strong problem-solving skills</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Nice to Have</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <span className="text-gray-300">Experience with cloud platforms</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <span className="text-gray-300">Open source contributions</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="process" className="space-y-6">
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle>Interview Process</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {interviewProcess.map((step, index) => (
                          <div key={index} className="flex gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              step.status === 'current'
                                ? `bg-gradient-to-br ${gradients.primary}`
                                : 'bg-gray-800'
                            }`}>
                              <span className="font-semibold">{step.step}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{step.title}</h4>
                              <p className="text-sm text-gray-400">{step.duration}</p>
                            </div>
                            {index < interviewProcess.length - 1 && (
                              <div className="w-px bg-gray-700 ml-6" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="company">
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle>About {companyInfo.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Company Size</p>
                          <p className="font-semibold">{companyInfo.size}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Industry</p>
                          <p className="font-semibold">{companyInfo.industry}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Founded</p>
                          <p className="font-semibold">{companyInfo.founded}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Website</p>
                          <p className="font-semibold">{companyInfo.website}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Culture</p>
                        <p className="text-gray-300">{companyInfo.culture}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className={`bg-gradient-to-br ${gradients.cardHeader} border-white/10`}>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Target className="w-12 h-12 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Apply?</h3>
                    <p className="text-sm text-gray-300">
                      Your profile is {matchScore}% match for this role
                    </p>
                  </div>

                  {!isApplied ? (
                    <>
                      <Button
                        className="w-full bg-white text-black hover:bg-gray-100 mb-3"
                        onClick={() => setIsApplied(true)}
                      >
                        Apply Now
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-white/20 bg-transparent hover:bg-white/10"
                        onClick={() => router.push(`/applicant/practice/new?jobId=${jobId}`)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Practice First
                      </Button>
                    </>
                  ) : (
                    <Alert className="bg-green-500/20 border-green-500/30">
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>
                        Application submitted successfully!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Preparation Resources */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle>Interview Preparation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {prepResources.map((resource, index) => {
                    const Icon = resource.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (index === 0) {
                            router.push(`/applicant/practice/new?jobId=${jobId}`);
                          }
                        }}
                        className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <Icon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{resource.title}</h4>
                            <p className="text-xs text-gray-400">{resource.desc}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-2">Pro Tip</h4>
                      <p className="text-sm text-gray-300">
                        Practice with our AI interviewer to increase your chances by 40%.
                        Get personalized feedback on your responses.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}