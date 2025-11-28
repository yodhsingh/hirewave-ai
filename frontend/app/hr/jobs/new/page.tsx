'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { backendClient } from '@/lib/api/backend-client';
import type { QuestionCreate } from '@/types';
import { gradients } from '@/lib/theme';

const WIZARD_STEPS = [
  { id: 1, title: 'Job Details', icon: Briefcase, description: 'Basic information about the position' },
  { id: 2, title: 'Interview Questions', icon: FileText, description: 'Create custom interview questions' },
  { id: 3, title: 'Review & Publish', icon: Eye, description: 'Preview and publish your job' },
];

export default function NewJobPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for all steps
  const [jobData, setJobData] = useState<Partial<JobCreateInput>>({
    title: '',
    description: '',
    department: '',
    location: '',
    roleType: 'FULL_TIME',
    questions: [],
    requirements: '',
  });

  const form = useForm<JobCreateInput>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      department: '',
      location: '',
      roleType: 'FULL_TIME',
      questions: [],
      requirements: '',
    },
    mode: 'onChange',
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (data: JobCreateInput) => backendClient.createJob(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const status = response.data.status;
        if (status === 'ACTIVE') {
          toast.success('Job published successfully!');
        } else {
          toast.success('Job saved as draft!');
        }
        // Invalidate jobs query so dashboard shows new job
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
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
      // Validate questions (optional)
      const questions = form.getValues('questions') || [];

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

  const handleSubmit = async (status: 'DRAFT' | 'ACTIVE') => {
    setIsSubmitting(true);

    // Final validation
    const isValid = await form.trigger();
    const formValues = form.getValues();

    // Ensure questions array exists (even if empty)
    if (!formValues.questions) {
      formValues.questions = [];
    }

    if (!isValid) {
      const errors = form.formState.errors;
      console.log('Form validation errors:', JSON.stringify(errors, null, 2));

      // Show specific error messages
      if (errors.title) toast.error(`Title: ${errors.title.message}`);
      if (errors.description) toast.error(`Description: ${errors.description.message}`);
      if (errors.department) toast.error(`Department: ${errors.department.message}`);
      if (errors.location) toast.error(`Location: ${errors.location.message}`);
      if (errors.roleType) toast.error(`Employment Type: ${errors.roleType.message}`);
      if (errors.questions) {
        // Questions error can be array-level or item-level
        const questionsError = errors.questions as any;
        console.log('Questions error:', questionsError);
        if (questionsError.message) {
          toast.error(`Questions: ${questionsError.message}`);
        } else if (questionsError.root?.message) {
          toast.error(`Questions: ${questionsError.root.message}`);
        } else if (Array.isArray(questionsError)) {
          // Find first error in array
          for (let i = 0; i < questionsError.length; i++) {
            if (questionsError[i]) {
              const qErr = questionsError[i];
              const fieldErrors = Object.entries(qErr).map(([key, val]: [string, any]) => `${key}: ${val?.message}`).join(', ');
              toast.error(`Question ${i + 1}: ${fieldErrors}`);
              break;
            }
          }
        } else {
          toast.error('Questions: Please check your interview questions for errors');
        }
      }

      setIsSubmitting(false);
      return;
    }

    // Set the status before submitting
    const jobData = { ...formValues, status };
    createJobMutation.mutate(jobData);
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
      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-xl border-b border-black/10 sticky top-0 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/hr/dashboard')}
              // UI: Inverted text and hover for light surface
              className="gap-2 text-black hover:bg-black"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            {/* UI: Changed divider to match new border */}
            <div className="h-8 w-px bg-black/10" />
            <div>
              {/*
                UI: Removed gradient, set to primary dark text.
                - Typography: Updated font-semibold to font-medium (per spec).
              */}
              <h1 className="text-xl font-medium text-gray-900">
                Create New Job
              </h1>
              {/* UI: Updated secondary text from text-gray-300 to text-gray-500 */}
              <p className="text-sm text-gray-500">
                Step {currentStep} of {WIZARD_STEPS.length}
              </p>
            </div>
          </div>
            <Badge
            variant="outline"
            className="border border-black/10 bg-transparent text-gray-500 font-medium text-xs tracking-wide"
          >
            {/* <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Screening */}
          </Badge>
        </div>
      </div>
    </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <Progress
            value={progress}
            className="h-2 bg-white/10"
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
                    isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isActive ? `bg-gray-500/20 text-blue-400 border border-blue-500/30  shadow-blue-400/40 scale-110` :
                      isCompleted ? 'bg-gray-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-gray-400'}
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
                <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-colors cursor-pointer group">
                  <CardHeader className={`border-b border-gray-700 rounded-t-lg`}>
                    <CardTitle className="text-2xl font-medium text-white">Job Details</CardTitle>
                    <CardDescription className="text-gray-300 mt-2">
                      Provide basic information about the position you're hiring for FEW INSIGHTS
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
                <Card className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-colors cursor-pointer group">
                  <CardHeader className={`border-b border-gray-700 rounded-t-lg`}>
                    <CardTitle className="text-2xl font-medium text-white">Interview Questions</CardTitle>
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
                  <CardHeader className={`border-b border-gray-700 rounded-t-lg`}>
                    <CardTitle className={`text-2xl font-bold text-white bg-clip-text text-transparent`}>Review & Publish</CardTitle>
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
              {currentStep === WIZARD_STEPS.length && (
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={isSubmitting}
                  className="gap-2 bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save as Draft
                </Button>
              )}

              {currentStep < WIZARD_STEPS.length ? (
                <Button onClick={handleNext} className={`gap-2 hover:from-blue-700 hover:to-cyan-700 text-white`}>
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit('ACTIVE')}
                  disabled={isSubmitting}
                  className={`gap-2 bg-gradient-to-r ${gradients.primary} hover:from-blue-700 hover:to-cyan-700 text-white disabled:opacity-50`}
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