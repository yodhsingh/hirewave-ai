'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Building,
  Type,
  FileText,
  Users,
  Clock,
  DollarSign,
  Plus,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import type { JobCreateInput } from '@/lib/schemas/validation';

interface JobBasicsFormProps {
  form: UseFormReturn<JobCreateInput>;
}

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Customer Success',
  'Operations',
  'Finance',
  'Legal',
  'HR',
];

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Temporary',
];

const LOCATION_TYPES = [
  { value: 'remote', label: 'Remote', icon: '🌍' },
  { value: 'hybrid', label: 'Hybrid', icon: '🏢' },
  { value: 'onsite', label: 'On-site', icon: '🏛️' },
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)', icon: '🌱' },
  { value: 'mid', label: 'Mid Level (3-5 years)', icon: '🌿' },
  { value: 'senior', label: 'Senior Level (6-10 years)', icon: '🌳' },
  { value: 'lead', label: 'Lead/Principal (10+ years)', icon: '🎯' },
  { value: 'executive', label: 'Executive', icon: '👔' },
];

export function JobBasicsForm({ form }: JobBasicsFormProps) {
  const [newRequirement, setNewRequirement] = useState('');
  const requirements = form.watch('requirements') || [];
  const errors = form.formState.errors;

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const currentReqs = form.getValues('requirements') || [];
      form.setValue('requirements', [...currentReqs, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    const currentReqs = form.getValues('requirements') || [];
    form.setValue('requirements', currentReqs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Job Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Label htmlFor="title" className="flex items-center gap-2 mb-2 text-gray-200">
          <Briefcase className="w-4 h-4 text-blue-400" />
          Job Title *
        </Label>
        <Input
          id="title"
          {...form.register('title')}
          placeholder="e.g., Senior Frontend Developer"
          className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
        />
        {errors.title && (
          <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>
        )}
      </motion.div>

      {/* Department and Employment Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <Label htmlFor="department" className="flex items-center gap-2 mb-2 text-gray-200">
            <Building className="w-4 h-4 text-purple-400" />
            Department *
          </Label>
          <Controller
            name="department"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500">
                  <SelectValue placeholder="Select department" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem
                      key={dept}
                      value={dept}
                      className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white cursor-pointer"
                    >
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.department && (
            <p className="text-sm text-red-400 mt-1">{errors.department.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="roleType" className="flex items-center gap-2 mb-2 text-gray-200">
            <Clock className="w-4 h-4 text-green-400" />
            Employment Type *
          </Label>
          <Controller
            name="roleType"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500">
                  <SelectValue placeholder="Select employment type" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white cursor-pointer"
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.roleType && (
            <p className="text-sm text-red-400 mt-1">{errors.roleType.message}</p>
          )}
        </div>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Label htmlFor="location" className="flex items-center gap-2 mb-2 text-gray-200">
          <MapPin className="w-4 h-4 text-pink-400" />
          Location *
        </Label>
        <Input
          id="location"
          {...form.register('location')}
          placeholder="e.g., New Delhi or Remote"
          className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
        />
        {errors.location && (
          <p className="text-sm text-red-400 mt-1">{errors.location.message}</p>
        )}

        {/* Location Type Cards */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {LOCATION_TYPES.map((type) => (
            <Card
              key={type.value}
              className="p-3 cursor-pointer bg-gray-800 border-gray-600 hover:border-blue-500 transition-colors text-center"
              onClick={() => {
                const currentLocation = form.getValues('location');
                if (!currentLocation.includes(type.label)) {
                  form.setValue('location', type.label);
                }
              }}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <p className="text-sm font-medium text-gray-200">{type.label}</p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Experience Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Label className="flex items-center gap-2 mb-3 text-gray-200">
          <Users className="w-4 h-4 text-orange-400" />
          Experience Level
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <Card
              key={level.value}
              className="p-3 cursor-pointer bg-gray-800 border-gray-600 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{level.icon}</span>
                <p className="text-sm font-medium text-gray-200">{level.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Job Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Label htmlFor="description" className="flex items-center gap-2 mb-2 text-gray-200">
          <FileText className="w-4 h-4 text-cyan-400" />
          Job Description *
        </Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
          className="min-h-[150px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
        />
        {errors.description && (
          <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          Tip: A clear, engaging description helps attract the right candidates
        </p>
      </motion.div>

      {/* Key Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Label className="flex items-center gap-2 mb-2 text-gray-200">
          <Type className="w-4 h-4 text-yellow-400" />
          Key Requirements
        </Label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="e.g., 5+ years of React experience"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRequirement();
                }
              }}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
            />
            <Button
              type="button"
              onClick={addRequirement}
              size="sm"
              className="gap-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {requirements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {requirements.map((req, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="py-1.5 px-3 flex items-center gap-2 bg-gray-700 text-gray-200 border-gray-600"
                >
                  {req}
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-400">
            Add key skills, qualifications, and experience requirements
          </p>
        </div>
      </motion.div>

      {/* Salary Range (Optional) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Label className="flex items-center gap-2 mb-2 text-gray-200">
          <DollarSign className="w-4 h-4 text-green-400" />
          Salary Range (Optional)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Min (e.g., ₹12,00,000)"
            type="text"
            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
          />
          <Input
            placeholder="Max (e.g., ₹18,00,000)"
            type="text"
            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
          />
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Adding salary information can increase application rates by 30%
        </p>
      </motion.div>

      {/* AI Enhancement Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">🤖</div>
          <div className="flex-1">
            <p className="font-medium text-sm mb-1 text-blue-300">AI will enhance your job posting</p>
            <p className="text-sm text-gray-300">
              Our AI will automatically optimize your job description for better visibility
              and suggest relevant screening questions based on the role requirements.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}