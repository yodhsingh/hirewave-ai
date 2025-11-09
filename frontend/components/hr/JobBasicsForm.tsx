'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
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
import { Card } from '@/components/ui/card';
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
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid'},
  { value: 'onsite', label: 'On-site' },
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)'},
  { value: 'senior', label: 'Senior Level (6-10 years)' },
  { value: 'lead', label: 'Lead/Principal (10+ years)'},
  { value: 'executive', label: 'Executive' },
];

export function JobBasicsForm({ form }: JobBasicsFormProps) {
  const errors = form.formState.errors;

  const cardClass = 'bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl hover:border-white/30 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)]';

  return (
    <div className="space-y-6">
      {/* Job Title */}
      <div>
        <Label htmlFor="title" className="flex items-center gap-2 mb-2 font-bold text-white text-lg">
          Job Title
        </Label>
        <Input
          id="title"
          {...form.register('title')}
          placeholder="e.g., Senior Frontend Developer"
          className="w-full bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 rounded-xl"
        />
        {errors.title && (
          <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Department and Employment Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department" className="flex items-center gap-2 mb-2 font-bold text-white text-lg">
            Department
          </Label>
          <Controller
            name="department"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange} 
              >
                <SelectTrigger className="w-full bg-white/5 border-white/20 text-white rounded-xl">
                  <SelectValue placeholder="Select department"/>
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] text-white border-white/20">
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem
                      key={dept}
                      value={dept}
                      className="text-white cursor-pointer hover:bg-white/10 focus:bg-white/10"
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
          <Label htmlFor="roleType" className="flex items-center gap-2 mb-2 font-bold text-white text-lg">
            Employment Type
          </Label>
          <Controller
            name="roleType"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full bg-white/5 border-white/20 text-white rounded-xl">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] text-white border-white/20">
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      className="text-white cursor-pointer hover:bg-white/10 focus:bg-white/10"
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
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location" className="flex items-center gap-2 mb-2 font-bold text-white text-lg">
          Location
        </Label>
        <Input
          id="location"
          {...form.register('location')}
          placeholder="e.g., New Delhi or Remote"
          className="w-full bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 rounded-xl"
        />
        {errors.location && (
          <p className="text-sm text-red-400 mt-1">{errors.location.message}</p>
        )}

        {/* Location Type Cards */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {LOCATION_TYPES.map((type) => (
            <Card
              key={type.value}
              className="p-3 cursor-pointer bg-white/10 border-white/20 text-center hover:bg-white/15 hover:border-white/30 transition-colors rounded-xl"
              onClick={() => {
                const currentLocation = form.getValues('location');
                if (!currentLocation.includes(type.label)) {
                  form.setValue('location', type.label);
                }
              }}
            >
              <p className="text-sm font-medium text-white">{type.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <Label className="flex items-center gap-2 mb-3 font-bold text-white text-lg">
          Experience Level
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <Card
              key={level.value}
              className="p-3 cursor-pointer bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{level.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Job Description */}
      <div>
        <Label htmlFor="description" className="flex items-center gap-2 mb-2 font-bold text-white text-lg">
          Job Description
        </Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
          className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 rounded-xl"
        />
        {errors.description && (
          <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          Tip: A clear, engaging description helps attract the right candidates
        </p>
      </div>

      {/* Key Requirements */}
      <div>
        <Label htmlFor="requirements" className="flex items-center gap-2 mb-2 font-bold text-white text-lg">
          Key Requirements
        </Label>
        <Textarea
          id="requirements"
          {...form.register('requirements')}
          placeholder="List the key skills, qualifications, and experience requirements for this role. You can add multiple requirements, one per line."
          className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 rounded-xl"
        />
        {errors.requirements && (
          <p className="text-sm text-red-400 mt-1">{errors.requirements.message}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          Tip: List each requirement on a new line for better readability
        </p>
      </div>

      {/* Salary Range (Optional) */}
      <div>
        <Label className="flex items-center gap-2 mb-2 font-bold text-white text-lg">
          Salary Range
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Min (e.g., ₹12,00,000)"
            type="text"
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 rounded-xl"
          />
          <Input
            placeholder="Max (e.g., ₹18,00,000)"
            type="text"
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 rounded-xl"
          />
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Adding salary information can increase application rates by 30%
        </p>
      </div>
    </div>
  );
}