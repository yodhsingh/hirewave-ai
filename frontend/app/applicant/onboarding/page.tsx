'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Briefcase, Code, Target, FileText, CheckCircle,
  Home, Sparkles, ArrowRight, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { FloatingParticles } from '@/components/FloatingParticles';
import { gradients } from '@/lib/theme';
import Link from 'next/link';
import type { ApplicantProfile } from '@/types';

const skillCategories = {
  'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby'],
  'Frontend': ['React', 'Vue.js', 'Angular', 'Next.js', 'HTML/CSS', 'Tailwind CSS', 'Redux', 'GraphQL'],
  'Backend': ['Node.js', 'Express', 'Django', 'Spring Boot', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Redis'],
  'Cloud & DevOps': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Jenkins'],
  'Soft Skills': ['Leadership', 'Communication', 'Problem Solving', 'Team Work', 'Agile', 'Mentoring'],
};

const roleOptions = [
  'Software Engineer',
  'Senior Developer',
  'Full Stack Engineer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'UX Designer',
  'QA Engineer',
];

export default function ApplicantOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<Partial<ApplicantProfile>>({
    name: '',
    email: '',
    phone: '',
    currentRole: '',
    experience: 0,
    location: '',
    willingToRelocate: false,
    skills: [],
    desiredRoles: [],
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    availability: 'immediate',
    expectedSalary: {
      min: 0,
      max: 0,
      currency: 'USD',
    },
  });

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Experience', icon: Briefcase },
    { number: 3, title: 'Skills', icon: Code },
    { number: 4, title: 'Preferences', icon: Target },
    { number: 5, title: 'Review', icon: FileText },
  ];

  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save profile and redirect to dashboard
      localStorage.setItem('applicantProfile', JSON.stringify(profile));
      router.push('/applicant/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills?.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...(prev.skills || []), skill],
    }));
  };

  const toggleRole = (role: string) => {
    setProfile(prev => ({
      ...prev,
      desiredRoles: prev.desiredRoles?.includes(role)
        ? prev.desiredRoles.filter(r => r !== role)
        : [...(prev.desiredRoles || []), role],
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute inset-0 bg-gray-800/50" />

        <FloatingParticles />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-200 bg-white sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/applicant"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
                Back to Home
              </Link>
              <div className="h-8 w-px bg-gray-700" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                 Profile Setup
                </h1>

                <p className="text-sm text-black">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>
      
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress
            value={(currentStep / totalSteps) * 100}
            className="h-2 bg-gray-700 [&>div]:bg-gray-400 mb-4"
          />

          {/* Progress Steps */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;

              return (
                <div
                  key={step.number}
                  className={`flex flex-col items-center gap-2 ${
                    isActive ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isActive ? 'bg-gray-700 text-white shadow-md scale-110' :
                      isCompleted ? 'bg-gray-600 text-gray-200 border border-gray-500' : 'bg-gray-800 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          key={currentStep}
        >
          <Card className="mt-12 bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-xl">
            <CardHeader className="bg-gray-800 border-b border-gray-700 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-white">
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-gray-200 mt-2">
                {currentStep === 1 && 'Let\'s start with your basic information'}
                {currentStep === 2 && 'Tell us about your professional experience'}
                {currentStep === 3 && 'Select your skills and expertise'}
                {currentStep === 4 && 'Set your job preferences and expectations'}
                {currentStep === 5 && 'Review your profile before getting started'}
              </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Akash Kumar"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="22f2000946@ds.study.iitm.ac.in"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-300">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="Chandigarh, Punjab"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="linkedin" className="text-gray-300">LinkedIn Profile (Optional)</Label>
                  <Input
                    id="linkedin"
                    value={profile.linkedinUrl}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/johndoe"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>
              </>
            )}

            {/* Step 2: Experience */}
            {currentStep === 2 && (
              <>
                <div>
                  <Label htmlFor="currentRole" className="text-gray-300">Current Role</Label>
                  <Input
                    id="currentRole"
                    value={profile.currentRole}
                    onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })}
                    placeholder="Senior Software Engineer"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-gray-300">Years of Experience</Label>
                  <Select
                    value={profile.experience?.toString()}
                    onValueChange={(value) => setProfile({ ...profile, experience: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '10+'].map(year => (
                        <SelectItem key={year} value={year.toString()} className="text-white hover:bg-gray-800">
                          {year === 0 ? 'Entry Level' : year === '10+' ? '10+ years' : `${year} ${year === 1 ? 'year' : 'years'}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="github" className="text-gray-300">GitHub Profile (Optional)</Label>
                    <Input
                      id="github"
                      value={profile.githubUrl}
                      onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                      placeholder="https://github.com/johndoe"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolio" className="text-gray-300">Portfolio Website (Optional)</Label>
                    <Input
                      id="portfolio"
                      value={profile.portfolioUrl}
                      onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                      placeholder="https://johndoe.dev"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="resume" className="text-gray-300">About You (Optional)</Label>
                  <Textarea
                    id="resume"
                    value={profile.resumeText}
                    onChange={(e) => setProfile({ ...profile, resumeText: e.target.value })}
                    placeholder="Brief summary of your experience and what you're looking for..."
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>
              </>
            )}

            {/* Step 3: Skills */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {Object.entries(skillCategories).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="font-semibold mb-3 text-white">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(skill => (
                        <Badge
                          key={skill}
                          variant={profile.skills?.includes(skill) ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${
                            profile.skills?.includes(skill)
                              ? 'bg-gray-700 border-0 text-white'
                              : 'bg-gray-800/20 border-gray-600 hover:bg-gray-700 text-white'
                          }`}
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <Label htmlFor="otherSkills" className="text-gray-300">Other Skills (comma-separated)</Label>
                  <Input
                    id="otherSkills"
                    placeholder="Skill 1, Skill 2, Skill 3"
                    onBlur={(e) => {
                      const newSkills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setProfile(prev => ({
                        ...prev,
                        skills: [...new Set([...(prev.skills || []), ...newSkills])],
                      }));
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {currentStep === 4 && (
              <>
                <div>
                  <Label className="text-white">Desired Roles</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {roleOptions.map(role => (
                      <Badge
                        key={role}
                        variant={profile.desiredRoles?.includes(role) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-colors ${
                          profile.desiredRoles?.includes(role)
                            ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
                            : 'hover:bg-gray-800/20 text-gray-300 border-gray-500'
                        }`}
                        onClick={() => toggleRole(role)}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minSalary" className="text-gray-300">Minimum Salary (USD)</Label>
                    <Input
                      id="minSalary"
                      type="number"
                      value={profile.expectedSalary?.min}
                      onChange={(e) => setProfile({
                        ...profile,
                        expectedSalary: {
                          ...profile.expectedSalary!,
                          min: parseInt(e.target.value),
                        },
                      })}
                      placeholder="60000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxSalary" className="text-gray-300">Maximum Salary (USD)</Label>
                    <Input
                      id="maxSalary"
                      type="number"
                      value={profile.expectedSalary?.max}
                      onChange={(e) => setProfile({
                        ...profile,
                        expectedSalary: {
                          ...profile.expectedSalary!,
                          max: parseInt(e.target.value),
                        },
                      })}
                      placeholder="120000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="availability" className="text-gray-300">Availability</Label>
                  <Select
                    value={profile.availability}
                    onValueChange={(value) => setProfile({ ...profile, availability: value as any })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="immediate" className="text-white hover:bg-gray-800">Immediate</SelectItem>
                      <SelectItem value="2_weeks" className="text-white hover:bg-gray-800">2 Weeks Notice</SelectItem>
                      <SelectItem value="1_month" className="text-white hover:bg-gray-800">1 Month Notice</SelectItem>
                      <SelectItem value="2_months" className="text-white hover:bg-gray-800">2 Months Notice</SelectItem>
                      <SelectItem value="other" className="text-white hover:bg-gray-800">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="relocate"
                    checked={profile.willingToRelocate}
                    onCheckedChange={(checked) => setProfile({ ...profile, willingToRelocate: !!checked })}
                  />
                  <Label htmlFor="relocate" className="text-gray-300">Willing to relocate</Label>
                </div>
              </>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-gray-800 text-white">
                  <h3 className="text-xl font-semibold mb-2">Profile Summary</h3>
                  <p className="opacity-95">Review your information before proceeding</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-white">Personal Information</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Name:</dt>
                        <dd>{profile.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Email:</dt>
                        <dd>{profile.email}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Location:</dt>
                        <dd>{profile.location}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-white">Experience</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Current Role:</dt>
                        <dd>{profile.currentRole}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Experience:</dt>
                        <dd>{profile.experience} years</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Availability:</dt>
                        <dd>{profile.availability?.replace('_', ' ')}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-white">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-white">Desired Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.desiredRoles?.map(role => (
                      <Badge key={role} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-white">Preferences</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Salary Range:</dt>
                      <dd>${profile.expectedSalary?.min?.toLocaleString()} - ${profile.expectedSalary?.max?.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Willing to Relocate:</dt>
                      <dd>{profile.willingToRelocate ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                {currentStep === 5 ? (
                  <>
                    Complete Setup
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}