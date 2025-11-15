'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Brain, Mic, Target, Trophy, Clock, ChevronRight,
  Sparkles, GraduationCap, Zap, BarChart, Home,
  Settings, Play, AlertCircle, User, LogOut,
  Bell, Briefcase, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FloatingParticles } from '@/components/FloatingParticles';
import { gradients } from '@/lib/theme';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { backendClient } from '@/lib/api/backend-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ViewSwitcher } from '@/components/ViewSwitcher';

export default function PracticeHomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, logout } = useAuthStore();

  const [config, setConfig] = useState({
    interview_type: 'technical',
    difficulty: 'medium',
    questions_count: 3,
    target_role: 'Data Engineer',
    focus_areas: [] as string[],
    user_id: user?.id,  // Include user_id from auth store
  });

  // Update config when user changes
  useEffect(() => {
    if (user) {
      setConfig(prev => ({
        ...prev,
        user_id: user.id,
        // Could also set target_role from user's profile if available
      }));
    }
  }, [user]);

  const interviewTypes = [
    { value: 'behavioral', label: 'Behavioral', icon: '💬', description: 'Focus on past experiences and soft skills' },
    { value: 'technical', label: 'Technical', icon: '🔧', description: 'Technical knowledge and problem-solving' },
    { value: 'situational', label: 'Situational', icon: '🎯', description: 'How you handle hypothetical scenarios' },
    { value: 'mixed', label: 'Mixed', icon: '🎲', description: 'Combination of all question types' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'hard', label: 'Hard', color: 'text-red-400' },
  ];

  const focusAreas = [
    'Leadership',
    'Teamwork',
    'Problem Solving',
    'Communication',
    'Technical Skills',
    'Time Management',
    'Adaptability',
    'Creativity',
  ];

  const handleStartSession = () => {
    // Save config to localStorage for the interview page
    localStorage.setItem('practiceSessionConfig', JSON.stringify(config));

    // Navigate to the interview page
    router.push('/applicant/practice/interview');
  };

  const toggleFocusArea = (area: string) => {
    setConfig(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients.bgPrimary}`} />
        <div className={`absolute inset-0 bg-gradient-to-tr ${gradients.bgSecondary}`} />
        <FloatingParticles />
      </div>

      {/* Navigation - Matching Dashboard Style */}
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
                Practice Interview Setup
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
                onClick={() => router.push('/applicant/dashboard')}
                className="gap-2 bg-black hover:bg-black/90 text-white rounded-xl font-medium shadow-sm"
              >
                <Home className="w-4 h-4" />
                Dashboard
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
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'Guest User'}</p>
                        <p className="text-xs text-gray-600">{user?.email || 'Candidate'}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients.primary} flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold">
                          {(user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white w-56" align="end">
                  <div className="px-3 py-2 border-b border-gray-800">
                    <p className="text-sm font-medium">{user?.name || 'Guest User'}</p>
                    <p className="text-xs text-gray-400">{user?.email || 'Not logged in'}</p>
                  </div>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/jobs')}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/dashboard')}>
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/practice/history')}>
                    <Trophy className="w-4 h-4 mr-2" />
                    Practice History
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    className="hover:bg-red-900/50 text-red-400"
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
            AI-Powered Practice
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className={`bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
              Practice Makes Perfect
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Sharpen your interview skills with personalized AI-generated questions based on your profile
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Brain, label: 'AI Questions', value: 'Personalized', color: 'from-blue-500 to-cyan-500' },
            { icon: Mic, label: 'Voice Answers', value: 'Real-time', color: 'from-cyan-500 to-teal-500' },
            { icon: BarChart, label: 'Instant Feedback', value: 'Detailed', color: 'from-green-500 to-emerald-500' },
            { icon: Trophy, label: 'Track Progress', value: 'Improve', color: 'from-orange-500 to-red-500' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-4">
                  <div className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg mb-2`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Configuration Form */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-white">
                  <Settings className="w-6 h-6 text-blue-400" />
                  Configure Your Practice Session
                </CardTitle>
                <CardDescription>
                  Customize your practice interview to match your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Interview Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300">Interview Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {interviewTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setConfig(prev => ({ ...prev, interview_type: type.value }))}
                        className={`p-4 rounded-lg border transition-all ${
                          config.interview_type === type.value
                            ? 'bg-blue-500/20 border-blue-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="font-medium text-white">{type.label}</div>
                        <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300">Difficulty Level</Label>
                  <div className="flex gap-3">
                    {difficulties.map(diff => (
                      <button
                        key={diff.value}
                        onClick={() => setConfig(prev => ({ ...prev, difficulty: diff.value }))}
                        className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                          config.difficulty === diff.value
                            ? 'bg-blue-500/20 border-blue-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className={`font-medium ${config.difficulty === diff.value ? 'text-white' : diff.color}`}>
                          {diff.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-300">Number of Questions</Label>
                    <span className="text-2xl font-bold text-blue-400">{config.questions_count}</span>
                  </div>
                  <Slider
                    value={[config.questions_count]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, questions_count: value }))}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>1 question</span>
                    <span>~{config.questions_count * 5} minutes</span>
                    <span>10 questions</span>
                  </div>
                </div>

                {/* Target Role (Optional) */}
                <div className="space-y-3">
                  <Label htmlFor="target-role" className="text-sm font-medium text-gray-300">
                    Target Role (Optional)
                  </Label>
                  <input
                    id="target-role"
                    type="text"
                    placeholder="e.g., Data Engineer, Software Engineer, Product Manager"
                    value={config.target_role}
                    onChange={(e) => setConfig(prev => ({ ...prev, target_role: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none text-white placeholder-gray-500"
                  />
                </div>

                {/* Focus Areas */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300">Focus Areas (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {focusAreas.map(area => (
                      <button
                        key={area}
                        onClick={() => toggleFocusArea(area)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          config.focus_areas.includes(area)
                            ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Session Summary */}
            <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Session Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Type</span>
                  <span className="font-medium text-white capitalize">{config.interview_type}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Difficulty</span>
                  <span className="font-medium text-white capitalize">{config.difficulty}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Questions</span>
                  <span className="font-medium text-white">{config.questions_count}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Duration</span>
                  <span className="font-medium text-white">~{config.questions_count * 5} min</span>
                </div>
                {config.target_role && (
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Role</span>
                    <span className="font-medium text-white">{config.target_role}</span>
                  </div>
                )}
                {config.focus_areas.length > 0 && (
                  <div className="py-2">
                    <span className="text-gray-400 text-sm">Focus Areas</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {config.focus_areas.map(area => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Start Button */}
            <Button
              onClick={handleStartSession}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Practice Session
            </Button>

            {/* Tips */}
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-yellow-300">Pro Tips</p>
                    <ul className="text-sm text-yellow-200 space-y-1">
                      <li>• Find a quiet environment</li>
                      <li>• Test your microphone first</li>
                      <li>• Speak clearly and naturally</li>
                      <li>• Take your time to think</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}