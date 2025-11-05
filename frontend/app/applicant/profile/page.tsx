'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera,
  Bell,
  Settings,
  LogOut,
  Briefcase,
  Code,
  Target,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ApplicantProfile } from '@/types';

export default function ApplicantProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);

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
        phone: '+91 98765 43210',
        location: 'Chandigarh, Punjab',
        currentRole: 'Software Engineer',
        experience: 5,
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        desiredRoles: ['Software Engineer', 'Full Stack Developer'],
        linkedinUrl: 'https://linkedin.com/in/akashkumar',
        githubUrl: 'https://github.com/akashkumar',
        portfolioUrl: 'https://akashkumar.dev',
        resumeText: 'Experienced software engineer with 5+ years in full-stack development.',
        availability: 'immediate',
        willingToRelocate: true,
        expectedSalary: {
          min: 80000,
          max: 120000,
          currency: 'USD'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        practiceSessions: [],
        applications: [],
      });
    }
  }, []);

  const handleSave = () => {
    if (profile) {
      localStorage.setItem('applicantProfile', JSON.stringify({
        ...profile,
        updatedAt: new Date()
      }));
      setIsEditing(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (profile) {
      setProfile(prev => ({
        ...prev!,
        [field]: value
      }));
    }
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
            <Button variant="ghost" className="relative p-2 hover:bg-black/5">
              <Bell className="w-5 h-5 text-black/60" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5">
                  <User className="w-4 h-4 mr-2 text-black" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/jobs')}>
                  <Briefcase className="w-4 h-4 mr-2 text-black" />
                  Browse Jobs
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/practice')}>
                  <Code className="w-4 h-4 mr-2 text-black" />
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
                USER PROFILE
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
                MY
                <br />
                <span className="font-medium">PROFILE</span>
              </h1>
            </motion.div>

            {/* Edit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center pt-8"
            >
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border border-black/20 bg-transparent hover:bg-black/5 text-black rounded-lg px-8 py-3 text-sm font-normal"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Profile Content - Dark Section */}
      <section className="relative bg-[#0F0F0F] py-24 z-10 overflow-hidden text-white">
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Picture Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardContent className="p-8 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-4xl font-bold text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-white/20 hover:bg-white/30"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">{profile.name}</h3>
                  <p className="text-white/70 mb-4">{profile.currentRole}</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    Available
                  </Badge>

                  {/* Social Links */}
                  <div className="mt-6 space-y-3">
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        GitHub Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {profile.portfolioUrl && (
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Portfolio Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Personal Information */}
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/70">Full Name</Label>
                      {isEditing ? (
                        <Input
                          value={profile.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <User className="w-4 h-4 text-white/60" />
                          {profile.name}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Email Address</Label>
                      {isEditing ? (
                        <Input
                          value={profile.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Mail className="w-4 h-4 text-white/60" />
                          {profile.email}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          value={profile.phone || ''}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Phone className="w-4 h-4 text-white/60" />
                          {profile.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Location</Label>
                      {isEditing ? (
                        <Input
                          value={profile.location || ''}
                          onChange={(e) => handleChange('location', e.target.value)}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="w-4 h-4 text-white/60" />
                          {profile.location || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">About Me</Label>
                    {isEditing ? (
                      <Textarea
                        value={profile.resumeText || ''}
                        onChange={(e) => handleChange('resumeText', e.target.value)}
                        className="bg-white/[0.04] border-white/10 text-white"
                        rows={4}
                        placeholder="Tell us about yourself, your experience, and what you're looking for..."
                      />
                    ) : (
                      <p className="text-white/70">
                        {profile.resumeText || 'No description provided'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/70">Current Role</Label>
                      {isEditing ? (
                        <Input
                          value={profile.currentRole || ''}
                          onChange={(e) => handleChange('currentRole', e.target.value)}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Briefcase className="w-4 h-4 text-white/60" />
                          {profile.currentRole || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Years of Experience</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={profile.experience}
                          onChange={(e) => handleChange('experience', parseInt(e.target.value))}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Calendar className="w-4 h-4 text-white/60" />
                          {profile.experience} years
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">Desired Roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {profile.desiredRoles.map((role, index) => (
                        <Badge
                          key={index}
                          className="bg-green-500/20 text-green-300 border-green-500/30"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Job Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/70">Availability</Label>
                      <div className="flex items-center gap-2 text-white">
                        <Target className="w-4 h-4 text-white/60" />
                        {profile.availability === 'immediate' ? 'Immediate' : 
                         profile.availability === '2_weeks' ? '2 Weeks Notice' :
                         profile.availability === '1_month' ? '1 Month Notice' :
                         profile.availability === '2_months' ? '2 Months Notice' : 'Other'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Willing to Relocate</Label>
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="w-4 h-4 text-white/60" />
                        {profile.willingToRelocate ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>

                  {profile.expectedSalary && (
                    <div className="space-y-2">
                      <Label className="text-white/70">Expected Salary Range</Label>
                      <div className="flex items-center gap-2 text-white">
                        <Target className="w-4 h-4 text-white/60" />
                        ${profile.expectedSalary.min?.toLocaleString()} - ${profile.expectedSalary.max?.toLocaleString()} {profile.expectedSalary.currency}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}