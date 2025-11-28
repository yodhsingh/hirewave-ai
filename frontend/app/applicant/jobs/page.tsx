'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, Filter, Briefcase, MapPin, Clock,
  Building, Users, ChevronRight, Home,
  Bookmark, BookmarkCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FloatingParticles } from '@/components/FloatingParticles';
import { gradients } from '@/lib/theme';
import { formatRoleType } from '@/lib/utils/format';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { backendClient, apiKeys } from '@/lib/api/backend-client';
import { useAuthStore } from '@/lib/store/authStore';
import type { Job, JobMatch } from '@/types';
import { CheckCircle2 } from 'lucide-react';

function JobBrowsingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedFilters, setSelectedFilters] = useState({
    roleType: 'all',
    location: 'all',
    experience: 'all',
    salary: 'all'
  });
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');

  // Fetch jobs with match scores if authenticated, otherwise public jobs
  const { data: jobsResponse, isLoading } = useQuery({
    queryKey: isAuthenticated ? ['jobs-with-matches'] : ['public-jobs'],
    queryFn: () => isAuthenticated
      ? backendClient.getJobsWithMatches()
      : backendClient.getPublicJobs(),
  });

  // Fetch user's applications to show "Applied" status
  const { data: applicationsResponse } = useQuery({
    queryKey: apiKeys.applications.list(),
    queryFn: () => backendClient.getMyApplications(),
    enabled: isAuthenticated,
  });

  const jobs = jobsResponse?.data || [];
  const applications = applicationsResponse?.data || [];

  // Create a map of job IDs to application status for quick lookup
  const applicationsByJobId = new Map(
    applications.map((app: any) => [app.jobId, app.status])
  );

  // Helper function to calculate days ago
  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Create job matches with real data (only ACTIVE jobs are returned from public endpoint)
  const jobMatches = jobs.map((job: any) => ({
    jobId: job.id,
    job: {
      ...job,
      status: 'ACTIVE', // Public endpoint only returns ACTIVE jobs
      companyName: job.companyName || 'Company', // Use company name from backend
    },
    // Match score from AI calculation (if authenticated)
    matchScore: job.match_score || 0,
    matchReasons: job.match_reasons || [],
    missingSkills: job.missing_skills || [],
    postedAgo: getDaysAgo(job.createdAt),
    applicantCount: job.applicantCount || 0,
    // Application status if user has applied
    applicationStatus: applicationsByJobId.get(job.id) || null,
    hasApplied: applicationsByJobId.has(job.id),
  }));

  // Filter and sort jobs
  const filteredJobs = jobMatches
    .filter(match => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = match.job.title.toLowerCase().includes(searchLower) ||
               match.job.department.toLowerCase().includes(searchLower) ||
               match.job.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Role type filter
      if (selectedFilters.roleType !== 'all') {
        if (match.job.roleType !== selectedFilters.roleType) return false;
      }

      // Location filter
      if (selectedFilters.location !== 'all') {
        const locationLower = match.job.location.toLowerCase();
        const filterLower = selectedFilters.location.toLowerCase();
        if (!locationLower.includes(filterLower)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'recent') return new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime();
      if (sortBy === 'salary') return (b.salary?.max || 0) - (a.salary?.max || 0);
      return 0;
    });

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Get unique locations from job data
  const uniqueLocations = ['all', ...Array.from(new Set(jobs.map((job: any) => job.location).filter(Boolean)))];

  const filters = {
    roleType: ['all', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY'],
    location: uniqueLocations,
    experience: ['all', 'Entry Level', '1-3 years', '3-5 years', '5+ years'],
    salary: ['all', '< $50k', '$50k-$100k', '$100k-$150k', '$150k+']
  };

  // Format role type for display
  const formatFilterLabel = (key: string, value: string) => {
    if (key === 'roleType' && value !== 'all') {
      return formatRoleType(value);
    }
    return value === 'all' ? 'All' : value;
  };

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
              <Link href="/applicant" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Applicant Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className={`text-xl font-bold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                Browse Jobs
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {filteredJobs.length} Jobs Found
              </Badge>
              <Button
                onClick={() => router.push('/applicant/dashboard')}
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10"
              >
                My Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 space-y-6"
          >
            {/* Search Bar */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Search className="w-5 h-5 text-cyan-400" />
                  Search Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Job title, skills, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20"
                />
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Filter className="w-5 h-5 text-cyan-400" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(filters).map(([key, options]) => (
                  <div key={key}>
                    <label className="text-sm text-gray-400 mb-2 block capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <Select
                      value={selectedFilters[key as keyof typeof selectedFilters]}
                      onValueChange={(value) => setSelectedFilters({ ...selectedFilters, [key]: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue>
                          {formatFilterLabel(key, selectedFilters[key as keyof typeof selectedFilters])}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        {options.map(option => (
                          <SelectItem key={option} value={option} className="text-white hover:bg-gray-800">
                            {formatFilterLabel(key, option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  onClick={() => setSelectedFilters({
                    roleType: 'all',
                    location: 'all',
                    experience: 'all',
                    salary: 'all'
                  })}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            {/* Jobs Summary */}
            <Card className={`bg-gradient-to-br ${gradients.cardHeader} border-white/10`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-300">Active Jobs</p>
                    <p className="text-3xl font-bold">{filteredJobs.length}</p>
                  </div>
                  <Briefcase className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-sm text-gray-300">
                  Browse open positions and apply
                </p>
                <Button
                  className="w-full mt-4 bg-white text-black hover:bg-gray-100"
                  onClick={() => router.push('/applicant/profile')}
                >
                  View My Profile
                </Button>
              </CardContent>
            </Card>
          </motion.aside>

          {/* Job Listings */}
          <div className="flex-1 space-y-6">
            {/* Sort Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-2xl font-bold">
                Available Positions
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    <SelectItem value="match" className="text-white hover:bg-gray-800">Best Match</SelectItem>
                    <SelectItem value="recent" className="text-white hover:bg-gray-800">Most Recent</SelectItem>
                    <SelectItem value="salary" className="text-white hover:bg-gray-800">Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.map((match, index) => (
                <motion.div
                  key={match.jobId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {/* Job Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold">{match.job.title}</h3>
                                {/* Applied Badge */}
                                {match.hasApplied && (
                                  <Badge className={`flex items-center gap-1 ${
                                    match.applicationStatus === 'SHORTLISTED' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                    match.applicationStatus === 'REJECTED' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                    match.applicationStatus === 'SCORED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                    match.applicationStatus === 'SUBMITTED' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                                    'bg-green-500/20 text-green-300 border-green-500/30'
                                  }`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    {match.applicationStatus === 'SHORTLISTED' ? 'Shortlisted' :
                                     match.applicationStatus === 'REJECTED' ? 'Rejected' :
                                     match.applicationStatus === 'SCORED' ? 'Scored' :
                                     match.applicationStatus === 'SUBMITTED' ? 'Submitted' :
                                     'Applied'}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  {(match.job as any).companyName || 'Company'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {match.job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {formatRoleType(match.job.roleType)}
                                </span>
                              </div>
                            </div>

                            {/* Match Score - only show if authenticated and has a score */}
                            {isAuthenticated && match.matchScore > 0 && (
                              <div className="text-center ml-6">
                                <div className={`text-3xl font-bold ${
                                  match.matchScore >= 80 ? 'text-green-400' :
                                  match.matchScore >= 60 ? 'text-blue-400' :
                                  match.matchScore >= 40 ? 'text-yellow-400' :
                                  'text-gray-400'
                                }`}>
                                  {match.matchScore}%
                                </div>
                                <p className="text-xs text-gray-400">match</p>
                              </div>
                            )}
                          </div>

                          {/* Job Description */}
                          <p className="text-gray-300 mb-4 line-clamp-2">
                            {match.job.description}
                          </p>

                          {/* Skills & Requirements */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {match.job.requirements && (
                              typeof match.job.requirements === 'string'
                                ? match.job.requirements.split(',').slice(0, 5).map((req: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="border-white/20 bg-white/5 text-gray-300"
                                    >
                                      {req.trim()}
                                    </Badge>
                                  ))
                                : (match.job.requirements as string[]).slice(0, 5).map((req: string) => (
                                    <Badge
                                      key={req}
                                      variant="outline"
                                      className="border-white/20 bg-white/5 text-gray-300"
                                    >
                                      {req}
                                    </Badge>
                                  ))
                            )}
                          </div>

                          {/* Job Stats */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6 text-sm">
                              <span className="flex items-center gap-1 text-gray-400">
                                <Users className="w-4 h-4" />
                                {(match as any).applicantCount || 0} applicants
                              </span>
                              <span className="flex items-center gap-1 text-gray-400">
                                <Clock className="w-4 h-4" />
                                Posted {(match as any).postedAgo || 'recently'}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSaveJob(match.jobId);
                                }}
                                className="hover:bg-white/10"
                              >
                                {savedJobs.includes(match.jobId) ? (
                                  <BookmarkCheck className="w-5 h-5 text-blue-400" />
                                ) : (
                                  <Bookmark className="w-5 h-5" />
                                )}
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/applicant/jobs/${match.jobId}`);
                                }}
                                className={`bg-gradient-to-r ${match.hasApplied ? 'from-green-600 to-cyan-600' : gradients.primary}`}
                              >
                                {match.hasApplied ? 'View Application' : 'View Details'}
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredJobs.length === 0 && (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                  <p className="text-gray-400">Try adjusting your filters or search query</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobBrowsingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <JobBrowsingContent />
    </Suspense>
  );
}