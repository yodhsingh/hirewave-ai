'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload, FileText, User, Briefcase, Code, Target,
  Home, Loader2, CheckCircle, AlertCircle, X, Bell,
  Settings, LogOut, ChevronRight, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { toast } from 'sonner';
import { backendClient } from '@/lib/api/backend-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/store/authStore';
import { gradients } from '@/lib/theme';

const skillCategories = {
  'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby'],
  'Frontend': ['React', 'Vue.js', 'Angular', 'Next.js', 'HTML/CSS', 'Tailwind CSS', 'Redux', 'GraphQL'],
  'Backend': ['Node.js', 'Express', 'Django', 'Spring Boot', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Redis'],
  'Cloud & DevOps': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Jenkins'],
  'Soft Skills': ['Leadership', 'Communication', 'Problem Solving', 'Team Work', 'Agile', 'Mentoring'],
};

export default function OnboardingWithParser() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [parsedExperience, setParsedExperience] = useState<any[]>([]); // Store parsed work history
  const [formData, setFormData] = useState({
    // Personal Info
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',

    // Experience
    currentRole: '',
    currentCompany: '',
    experience: '',
    education: '',

    // Skills & Preferences
    skills: [] as string[],
    expectedSalary: '',
    availability: 'immediate',
    workType: 'full-time',
    preferredLocation: 'remote',

    // Additional
    summary: '',
  });

  // Load existing profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await backendClient.getProfile();

        if (response.success && response.data?.exists) {
          const profile = response.data;

          // Populate form with existing profile data
          setFormData({
            name: profile.fullName || profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            linkedinUrl: profile.linkedinUrl || profile.linkedin_url || '',
            githubUrl: profile.githubUrl || profile.github_url || '',
            portfolioUrl: profile.portfolioUrl || profile.portfolio_url || '',
            currentRole: profile.currentJobTitle || profile.current_job_title || '',
            currentCompany: profile.currentCompany || profile.current_company || '',
            experience: profile.yearsOfExperience || profile.years_of_experience || '',
            education: profile.education || '',
            expectedSalary: profile.expectedSalary || profile.expected_salary || '',
            availability: profile.availability || 'immediate',
            workType: profile.workType || profile.work_type || 'full-time',
            preferredLocation: profile.preferredLocation || profile.preferred_location || 'remote',
            summary: profile.summary || '',
            skills: [],
          });

          // Set skills
          if (profile.skills) {
            if (Array.isArray(profile.skills)) {
              setSelectedSkills(profile.skills);
            } else if (profile.skills.all) {
              setSelectedSkills(profile.skills.all);
            } else {
              const allSkills = [
                ...(profile.skills.technical || []),
                ...(profile.skills.soft || []),
                ...(profile.skills.languages || []),
                ...(profile.skills.tools || []),
              ];
              setSelectedSkills(allSkills);
            }
          }

          // Set work experience
          if (profile.workExperience || profile.work_experience) {
            setParsedExperience(profile.workExperience || profile.work_experience);
          }

          console.log('Loaded existing profile data');
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Don't show error toast - profile might not exist yet which is fine
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user) {
      loadProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a PDF or Word document',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please upload a file smaller than 5MB',
      });
      return;
    }

    setResumeFile(file);
    setIsParsing(true);

    try {
      // Call backend resume parser API using backendClient
      const response = await backendClient.parseResume(file);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to parse resume');
      }

      const parsedData = response.data;

      // Debug: Log the parsed data structure
      console.log('Parsed data received:', parsedData);
      console.log('Personal info:', parsedData.personalInfo || parsedData.personal_info);

      // Update form with parsed data - check both camelCase and snake_case
      const personalInfo = parsedData.personalInfo || parsedData.personal_info || {};

      // Smart merge: Only override if the parsed value exists and is not empty
      setFormData(prev => ({
        ...prev,
        // Personal info - keep existing if parsed is empty
        name: (personalInfo.name && personalInfo.name.trim()) ? personalInfo.name : prev.name,
        email: (personalInfo.email && personalInfo.email.trim()) ? personalInfo.email : prev.email,
        phone: (personalInfo.phone && personalInfo.phone.trim()) ? personalInfo.phone : prev.phone,
        location: (personalInfo.location && personalInfo.location.trim()) ? personalInfo.location : prev.location,
        linkedinUrl: (personalInfo.linkedin && personalInfo.linkedin.trim()) ? personalInfo.linkedin : prev.linkedinUrl,
        githubUrl: (personalInfo.github && personalInfo.github.trim()) ? personalInfo.github : prev.githubUrl,
        portfolioUrl: (personalInfo.portfolio && personalInfo.portfolio.trim()) ? personalInfo.portfolio : prev.portfolioUrl,
        summary: (personalInfo.summary && personalInfo.summary.trim()) ? personalInfo.summary : prev.summary,

        // Experience - only update if new data exists
        currentRole: (parsedData.experience?.[0]?.position) || prev.currentRole,
        currentCompany: (parsedData.experience?.[0]?.company) || prev.currentCompany,
        // Calculate years of experience from dates or leave blank for manual entry
        experience: (() => {
          if (parsedData.experience && parsedData.experience.length > 0) {
            // Try to calculate total years from experience dates
            const firstJob = parsedData.experience[parsedData.experience.length - 1];
            // Handle both camelCase and snake_case for dates
            const startDate = firstJob?.startDate || firstJob?.start_date;
            if (startDate) {
              const startYear = parseInt(startDate.match(/\d{4}/)?.[0] || '');
              const currentYear = new Date().getFullYear();
              if (startYear) {
                const years = currentYear - startYear;
                return `${years} years`;
              }
            }
            // If we can't calculate, just show number of positions
            return `${parsedData.experience.length} positions`;
          }
          return prev.experience;
        })(),

        // Education - only update if new education data exists
        education: (parsedData.education && parsedData.education.length > 0)
          ? parsedData.education.map((edu: any) =>
              `${edu.degree} in ${edu.field} from ${edu.institution}`
            ).join(', ')
          : prev.education,

        // Skills - keep existing, don't override with empty array
        skills: [],  // Skills handled separately below

        // Preferences - only update if new values exist
        workType: ((parsedData.preferences?.jobType || parsedData.preferences?.job_type)
          ? (parsedData.preferences?.jobType || parsedData.preferences?.job_type)?.toLowerCase()
          : prev.workType),

        // Keep other preference fields unchanged unless explicitly in parsed data
        expectedSalary: prev.expectedSalary,
        availability: prev.availability,
        preferredLocation: prev.preferredLocation,
      }));

      // Smart merge for skills - combine new skills with existing ones
      const newParsedSkills = [
        ...(parsedData.skills?.technical || []),
        ...(parsedData.skills?.languages || []),
        ...(parsedData.skills?.tools || []),
        ...(parsedData.skills?.soft || []),
      ];

      if (newParsedSkills.length > 0) {
        // Merge new skills with existing ones, removing duplicates
        setSelectedSkills(prev => {
          const combined = [...prev, ...newParsedSkills];
          return [...new Set(combined)]; // Remove duplicates
        });
      }

      // Store parsed experience for display - merge with existing
      if (parsedData.experience && parsedData.experience.length > 0) {
        // Replace experience only if new resume has experience data
        setParsedExperience(parsedData.experience);
      }

      toast.success('Resume parsed and merged!', {
        description: 'New information has been added while preserving your existing data. You can manually edit any field.',
      });
    } catch (error) {
      console.error('Resume parsing error:', error);
      toast.error('Failed to parse resume', {
        description: error instanceof Error ? error.message : 'Please fill in the form manually or try another file',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      // Prepare profile data for backend
      const profileData = {
        ...formData,
        skills: selectedSkills.length > 0 ? { all: selectedSkills } : null,
        workExperience: parsedExperience.length > 0 ? parsedExperience : null,
      };

      // Save profile to backend
      const response = await backendClient.saveProfile(profileData);

      if (response.success) {
        toast.success('Profile saved successfully!');
        router.push('/applicant/dashboard');
      } else {
        throw new Error(response.error?.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsUploading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // Show loading spinner while profile is being fetched
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-white/60" />
          <p className="text-white/80">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white relative">
      {/* Subtle glass glow layer - same as dashboard */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      {/* Navigation - matching dashboard style */}
      <nav className="relative z-10 border-b border-black/10 bg-white/90 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/applicant/dashboard" className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-black/10" />
              <h1 className="text-xl font-medium text-gray-900">
                Profile Setup
              </h1>
            </div>

            <div className="flex items-center gap-4">
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
                  <DropdownMenuItem className="hover:bg-gray-800">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    className="text-red-400 hover:bg-gray-800"
                    onClick={() => {
                      logout();
                      router.push('/login');
                    }}
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

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-white">
            Complete Your Profile
          </h2>
          <p className="text-gray-400">
            Upload your resume to auto-fill your information, or fill in manually
          </p>
        </motion.div>

        {/* Resume Upload Section */}
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                AI-Powered Resume Parser
              </CardTitle>
              <CardDescription className="text-gray-400">
                Upload your resume and we'll extract your information automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isParsing}
                />
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-colors">
                  {isParsing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-white/60 animate-spin" />
                      <p className="text-white/80">Parsing your resume...</p>
                      <p className="text-sm text-gray-400">This may take a few seconds</p>
                    </div>
                  ) : resumeFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                      <p className="text-white/80">{resumeFile.name}</p>
                      <p className="text-sm text-gray-400">Successfully parsed! Check the form below</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-12 h-12 text-white/60" />
                      <p className="text-white/80">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-400">PDF, DOC, DOCX (max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form Sections */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Full Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                      placeholder="New York, NY"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">LinkedIn URL</Label>
                  <Input
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">GitHub URL</Label>
                  <Input
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                    placeholder="https://github.com/johndoe"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Professional Experience */}
          <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
            <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experience & Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Current Role</Label>
                  <Input
                    value={formData.currentRole}
                    onChange={(e) => handleInputChange('currentRole', e.target.value)}
                    className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                    placeholder="Senior Software Engineer"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Current Company</Label>
                  <Input
                    value={formData.currentCompany}
                    onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                    className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                    placeholder="Tech Corp"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Years of Experience</Label>
                  <Input
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                    placeholder="5 years"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Education</Label>
                  <Textarea
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                    placeholder="Bachelor's in Computer Science from MIT"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Professional Summary</Label>
                  <Textarea
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                    placeholder="Brief summary of your experience and goals..."
                    rows={4}
                  />
                </div>

                {/* Work History Display (if parsed from resume) */}
                {parsedExperience && parsedExperience.length > 0 && (
                  <div className="mt-4 p-3 bg-white/[0.03] rounded-lg border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Parsed Work History:</p>
                    <div className="space-y-1">
                      {parsedExperience.map((exp: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-300">
                          • {exp.position} at {exp.company}
                          {(exp.startDate || exp.start_date) && <span className="text-gray-500"> ({exp.startDate || exp.start_date} - {exp.endDate || exp.end_date || 'Present'})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Skills Section */}
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5" />
                Skills & Expertise
              </CardTitle>
              <CardDescription className="text-gray-400">
                Select all skills that apply to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(skillCategories).map(([category, skills]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          selectedSkills.includes(skill)
                            ? 'bg-white/20 text-white border-white/40 hover:bg-white/30'
                            : 'bg-transparent text-gray-400 border-white/20 hover:border-white/40 hover:text-white'
                        }`}
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences Section */}
        <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
          <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Job Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Work Type</Label>
                  <Select value={formData.workType} onValueChange={(value) => handleInputChange('workType', value)}>
                    <SelectTrigger className="bg-white/[0.08] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Availability</Label>
                  <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                    <SelectTrigger className="bg-white/[0.08] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="2-weeks">2 Weeks</SelectItem>
                      <SelectItem value="1-month">1 Month</SelectItem>
                      <SelectItem value="2-months">2 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Preferred Location</Label>
                  <Select value={formData.preferredLocation} onValueChange={(value) => handleInputChange('preferredLocation', value)}>
                    <SelectTrigger className="bg-white/[0.08] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-gray-300">Expected Salary Range</Label>
                <Input
                  value={formData.expectedSalary}
                  onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                  className="bg-white/[0.08] border-white/10 text-white placeholder:text-gray-500"
                  placeholder="$80,000 - $120,000"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.6 }}
          className="flex justify-between mt-8"
        >
          <Button
            variant="outline"
            onClick={() => router.push('/applicant/dashboard')}
            className="gap-2 border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
          >
            Skip for Now
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isUploading}
            className="gap-2 bg-white text-black hover:bg-white/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Profile
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}