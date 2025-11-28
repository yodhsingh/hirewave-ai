'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
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
  Brain,
  Target,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Home,
  Upload
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { backendClient } from '@/lib/api/backend-client';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gradients } from '@/lib/theme';
import { ViewSwitcher } from '@/components/ViewSwitcher';

interface ProfileData {
  userId: number;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  summary: string | null;
  currentJobTitle: string | null;
  currentCompany: string | null;
  yearsOfExperience: string | null;
  education: any | null;
  workExperience: any[] | null;
  skills: any | null;
  certifications: any[] | null;
  projects: any[] | null;
  achievements: string[] | null;
  languagesSpoken: string[] | null;
  expectedSalary: string | null;
  availability: string | null;
  workType: string | null;
  preferredLocation: string | null;
  desiredRoles: string[] | null;
  industries: string[] | null;
  resumeUrl: string | null;
  resumeParsedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  exists: boolean;
}

export default function ApplicantProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({});

  // Fetch profile from backend
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await backendClient.getProfile();
      return response;
    },
    enabled: !!user,
  });

  const profile = profileResponse?.success ? profileResponse.data : null;

  // Mutation for saving profile
  const saveProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return backendClient.saveProfile(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Profile saved successfully');
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setIsEditing(false);
      } else {
        toast.error(response.error?.message || 'Failed to save profile');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save profile');
    },
  });

  // Helper to get current editable data (from profile or user fallback)
  const getEditableData = (): Partial<ProfileData> => {
    return {
      fullName: profile?.fullName || user?.name || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      linkedinUrl: profile?.linkedinUrl || '',
      githubUrl: profile?.githubUrl || '',
      portfolioUrl: profile?.portfolioUrl || '',
      summary: profile?.summary || '',
      currentJobTitle: profile?.currentJobTitle || '',
      currentCompany: profile?.currentCompany || '',
      yearsOfExperience: profile?.yearsOfExperience || '',
      availability: profile?.availability || '',
      expectedSalary: profile?.expectedSalary || '',
      workType: profile?.workType || '',
      preferredLocation: profile?.preferredLocation || '',
    };
  };

  // Start editing - populate with current data
  const startEditing = () => {
    setEditedProfile(getEditableData());
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedProfile({});
    setIsEditing(false);
  };

  const handleSave = () => {
    const dataToSave = {
      full_name: editedProfile.fullName || null,
      email: editedProfile.email || null,
      phone: editedProfile.phone || null,
      location: editedProfile.location || null,
      linkedin_url: editedProfile.linkedinUrl || null,
      github_url: editedProfile.githubUrl || null,
      portfolio_url: editedProfile.portfolioUrl || null,
      summary: editedProfile.summary || null,
      current_job_title: editedProfile.currentJobTitle || null,
      current_company: editedProfile.currentCompany || null,
      years_of_experience: editedProfile.yearsOfExperience || null,
      availability: editedProfile.availability || null,
      expected_salary: editedProfile.expectedSalary || null,
      work_type: editedProfile.workType || null,
      preferred_location: editedProfile.preferredLocation || null,
    };
    console.log('Saving profile data:', dataToSave);
    saveProfileMutation.mutate(dataToSave);
  };

  const handleChange = (field: keyof ProfileData, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Helper to flatten skills from JSONB structure
  const getSkillsList = (skills: any): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'object') {
      const allSkills: string[] = [];
      Object.values(skills).forEach((category: any) => {
        if (Array.isArray(category)) {
          allSkills.push(...category);
        }
      });
      return allSkills;
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  const displayName = profile?.fullName || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const skillsList = getSkillsList(profile?.skills);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Navigation - Standard Header like Dashboard */}
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
                My Profile
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/applicant/jobs')}
                variant="outline"
                className="gap-2 border-white/30 hover:bg-white hover:border-white text-white hover:text-gray-900 rounded-xl font-medium transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </Button>

              <Button
                onClick={() => router.push('/applicant/onboarding-with-parser')}
                variant="outline"
                className="gap-2 border-white/30 hover:bg-white hover:border-white text-white hover:text-gray-900 rounded-xl font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Resume
              </Button>

              <Button
                onClick={() => router.push('/applicant/practice')}
                className="gap-2 bg-black hover:bg-black/90 text-white rounded-xl font-medium shadow-sm"
              >
                <Brain className="w-4 h-4" />
                Practice Interview
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
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/dashboard')}>
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/jobs')}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/practice')}>
                    <Brain className="w-4 h-4 mr-2" />
                    Practice Sessions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem className="hover:bg-gray-800" onClick={() => router.push('/applicant/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 hover:bg-gray-800"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Compact Hero Section */}
      <section className="relative z-10 px-6 lg:px-16 py-8 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-[0.35em] mb-2">
                USER PROFILE
              </p>
              <h1 className="text-3xl md:text-4xl font-light text-white">
                My <span className="font-medium">Profile</span>
              </h1>
            </div>

            {/* Edit Button */}
            <div>
              {!isEditing ? (
                <Button
                  onClick={startEditing}
                  className="bg-white text-black hover:bg-white/90 rounded-lg px-6 py-2 text-sm font-normal inline-flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={saveProfileMutation.isPending}
                    className="bg-white text-black hover:bg-white/90 rounded-lg px-6 py-2 text-sm font-normal inline-flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saveProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    variant="outline"
                    className="border border-white/20 bg-transparent hover:bg-white/10 text-white rounded-lg px-6 py-2 text-sm font-normal"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="relative py-8 z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          {!profile?.exists && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-amber-400" />
                    <p className="text-amber-200">
                      Your profile is incomplete.
                      <Link href="/applicant/onboarding-with-parser" className="underline ml-1 hover:text-amber-100">
                        Upload your resume
                      </Link> to auto-fill your profile and get better job matches.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Picture Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1"
            >
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardContent className="p-8 text-center">
                  <div className="relative inline-block mb-6">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${gradients.primary} flex items-center justify-center text-4xl font-bold text-white`}>
                      {displayName.charAt(0).toUpperCase()}
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
                  <h3 className="text-xl font-medium text-white mb-2">{displayName}</h3>
                  <p className="text-white/70 mb-4">{profile?.currentJobTitle || 'Job Seeker'}</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    {profile?.availability || 'Available'}
                  </Badge>

                  {/* Social Links */}
                  <div className="mt-6 space-y-3">
                    {profile?.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors justify-center"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {profile?.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors justify-center"
                      >
                        <Github className="w-4 h-4" />
                        GitHub Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {profile?.portfolioUrl && (
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors justify-center"
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
              animate={{ opacity: 1, y: 0 }}
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
                          value={editedProfile.fullName || ''}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <User className="w-4 h-4 text-white/60" />
                          {displayName}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Email Address</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.email || ''}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Mail className="w-4 h-4 text-white/60" />
                          {displayEmail || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.phone || ''}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Phone className="w-4 h-4 text-white/60" />
                          {profile?.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Location</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.location || ''}
                          onChange={(e) => handleChange('location', e.target.value)}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="w-4 h-4 text-white/60" />
                          {profile?.location || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">About Me</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedProfile.summary || ''}
                        onChange={(e) => handleChange('summary', e.target.value)}
                        className="bg-white/[0.04] border-white/10 text-white"
                        rows={4}
                        placeholder="Tell us about yourself, your experience, and what you're looking for..."
                      />
                    ) : (
                      <p className="text-white/70">
                        {profile?.summary || 'No description provided'}
                      </p>
                    )}
                  </div>

                  {/* Social Links - Only shown in edit mode */}
                  {isEditing && (
                    <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                      <div className="space-y-2">
                        <Label className="text-white/70">LinkedIn URL</Label>
                        <Input
                          value={editedProfile.linkedinUrl || ''}
                          onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">GitHub URL</Label>
                        <Input
                          value={editedProfile.githubUrl || ''}
                          onChange={(e) => handleChange('githubUrl', e.target.value)}
                          placeholder="https://github.com/..."
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">Portfolio URL</Label>
                        <Input
                          value={editedProfile.portfolioUrl || ''}
                          onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                          placeholder="https://yourportfolio.com"
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      </div>
                    </div>
                  )}
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
                          value={editedProfile.currentJobTitle || ''}
                          onChange={(e) => handleChange('currentJobTitle', e.target.value)}
                          placeholder="e.g., Software Engineer"
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Briefcase className="w-4 h-4 text-white/60" />
                          {profile?.currentJobTitle || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Current Company</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.currentCompany || ''}
                          onChange={(e) => handleChange('currentCompany', e.target.value)}
                          placeholder="e.g., Acme Corp"
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Briefcase className="w-4 h-4 text-white/60" />
                          {profile?.currentCompany || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Years of Experience</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.yearsOfExperience || ''}
                          onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                          placeholder="e.g., 5 years"
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Calendar className="w-4 h-4 text-white/60" />
                          {profile?.yearsOfExperience || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {skillsList.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-white/70">Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {skillsList.map((skill, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile?.desiredRoles && profile.desiredRoles.length > 0 && (
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
                  )}
                </CardContent>
              </Card>

              {/* Work Experience */}
              {profile?.workExperience && profile.workExperience.length > 0 && (
                <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Work Experience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.workExperience.map((exp: any, index: number) => (
                      <div key={index} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                        <h4 className="font-medium text-white">{exp.position || exp.title}</h4>
                        <p className="text-white/70">{exp.company}</p>
                        <p className="text-white/50 text-sm">
                          {exp.startDate || exp.start_date} - {exp.endDate || exp.end_date || 'Present'}
                        </p>
                        {exp.description && (
                          <p className="text-white/60 mt-2 text-sm">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Preferences */}
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Job Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/70">Availability</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.availability || ''}
                          onChange={(e) => handleChange('availability', e.target.value)}
                          placeholder="e.g., Immediate, 2 weeks notice"
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Target className="w-4 h-4 text-white/60" />
                          {profile?.availability || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Work Type Preference</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.workType || ''}
                          onChange={(e) => handleChange('workType', e.target.value)}
                          placeholder="e.g., Remote, Hybrid, On-site"
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="w-4 h-4 text-white/60" />
                          {profile?.workType || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>

                  {profile?.expectedSalary && (
                    <div className="space-y-2">
                      <Label className="text-white/70">Expected Salary</Label>
                      <div className="flex items-center gap-2 text-white">
                        <Target className="w-4 h-4 text-white/60" />
                        {profile.expectedSalary}
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
