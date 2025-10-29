'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Clock,
  Eye,
  Save,
  CheckCircle,
  AlertCircle,
  MapPin,
  Building,
  Users,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { JobBasicsForm } from '@/components/hr/JobBasicsForm';
import { QuestionBuilder } from '@/components/hr/QuestionBuilder';
import { JobPreview } from '@/components/hr/JobPreview';
import { jobCreateSchema, type JobCreateInput } from '@/lib/schemas/validation';
import { apiClient } from '@/lib/api/client';
import type { QuestionCreate } from '@/types';

const WIZARD_STEPS = [
  { id: 1, title: 'Job Details', icon: Briefcase, description: 'Basic information about the position' },
  { id: 2, title: 'Interview Questions', icon: FileText, description: 'Create custom interview questions' },
  { id: 3, title: 'Review & Publish', icon: Eye, description: 'Preview and publish your job' },
];

export default function NewJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for all steps
  const [jobData, setJobData] = useState<Partial<JobCreateInput>>({
    title: '',
    description: '',
    department: '',
    location: '',
    roleType: 'Full-time',
    questions: [],
    requirements: [],
  });

  const form = useForm<JobCreateInput>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      department: '',
      location: '',
      roleType: 'Full-time',
      questions: [],
      requirements: [],
    },
    mode: 'onChange',
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (data: JobCreateInput) => apiClient.createJob(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success('Job created and published successfully!');
        router.push('/hr/dashboard');
      }
    },
    onError: () => {
      toast.error('Failed to create job. Please try again.');
      setIsSubmitting(false);
    },
  });

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate job basics
      const isValid = await form.trigger(['title', 'description', 'department', 'location', 'roleType']);
      if (!isValid) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Save basics data
      const values = form.getValues();
      setJobData(prev => ({
        ...prev,
        title: values.title,
        description: values.description,
        department: values.department,
        location: values.location,
        roleType: values.roleType,
        requirements: values.requirements,
      }));
    }

    if (currentStep === 2) {
      // Validate questions
      const questions = form.getValues('questions');
      if (!questions || questions.length < 3) {
        toast.error('Please add at least 3 interview questions');
        return;
      }

      // Ensure questions are properly set in form
      form.setValue('questions', questions, { shouldValidate: true });

      setJobData(prev => ({
        ...prev,
        questions,
      }));
    }

    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Final validation
    const isValid = await form.trigger();
    const formValues = form.getValues();

    // Check questions explicitly
    if (!formValues.questions || formValues.questions.length < 3) {
      toast.error('Please add at least 3 interview questions');
      setIsSubmitting(false);
      return;
    }

    if (!isValid) {
      const errors = form.formState.errors;

      // Show specific error messages
      if (errors.title) toast.error(`Title: ${errors.title.message}`);
      if (errors.description) toast.error(`Description: ${errors.description.message}`);
      if (errors.department) toast.error(`Department: ${errors.department.message}`);
      if (errors.location) toast.error(`Location: ${errors.location.message}`);
      if (errors.roleType) toast.error(`Employment Type: ${errors.roleType.message}`);
      if (errors.questions) toast.error(`Questions: ${errors.questions.message}`);

      setIsSubmitting(false);
      return;
    }

    createJobMutation.mutate(formValues);
  };

  const updateQuestions = (questions: QuestionCreate[]) => {
    form.setValue('questions', questions, { shouldValidate: true });
    setJobData(prev => ({ ...prev, questions }));
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const progress = (currentStep / WIZARD_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-pink-900/30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-purple-600/10" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/50 backdrop-blur-lg border-b border-gray-800 sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/hr/dashboard')}
                className="gap-2 text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="h-8 w-px bg-gray-700" />
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Create New Job
                </h1>
                <p className="text-sm text-gray-300">
                  Step {currentStep} of {WIZARD_STEPS.length}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-300"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Screening
            </Badge>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <Progress
            value={progress}
            className="h-2 bg-gray-800"
          />

          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {WIZARD_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-2 ${
                    isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isActive ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-110' :
                      isCompleted ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-[150px]">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" {...fadeInUp}>
                <Card className="bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Job Details</CardTitle>
                    <CardDescription className="text-gray-200 mt-2">
                      Provide basic information about the position you're hiring for
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <JobBasicsForm form={form} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" {...fadeInUp}>
                <Card className="bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-700 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Interview Questions</CardTitle>
                    <CardDescription className="text-gray-200 mt-2">
                      Create custom questions for candidates to answer. Mix different types for best results.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <QuestionBuilder
                      questions={form.watch('questions') || []}
                      onQuestionsChange={updateQuestions}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" {...fadeInUp}>
                <Card className="bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-600/20 to-teal-600/20 border-b border-gray-700 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Review & Publish</CardTitle>
                    <CardDescription className="text-gray-200 mt-2">
                      Preview your job posting before publishing it to candidates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <JobPreview jobData={form.getValues()} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2 bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/hr/dashboard')}
                className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:text-white"
              >
                Save as Draft
              </Button>

              {currentStep < WIZARD_STEPS.length ? (
                <Button onClick={handleNext} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Publish Job
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}