'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, Filter, Briefcase, MapPin, Clock, DollarSign,
  Building, Users, TrendingUp, Star, ChevronRight, Home,
  Bookmark, BookmarkCheck, Target, Sparkles, ArrowUpDown,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FloatingParticles } from '@/components/FloatingParticles';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Job, JobMatch } from '@/types';

function JobBrowsingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedFilters, setSelectedFilters] = useState({
    roleType: 'all',
    location: 'all',
    experience: 'all',
    salary: 'all'
  });
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('match');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch jobs
  const { data: jobsResponse } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiClient.getJobs(),
  });

  const jobs = jobsResponse?.data || [];

  // Mock job matches with scores
  const jobMatches: JobMatch[] = jobs
    .filter((job: Job) => job.status === 'active')
    .map((job: Job) => ({
      jobId: job.id,
      job,
      matchScore: Math.floor(Math.random() * 30) + 70,
      matchReasons: [
        'Skills match',
        'Experience level match',
        'Location preference'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      missingSkills: ['React', 'Node.js', 'AWS'].slice(0, Math.floor(Math.random() * 2)),
      salary: {
        min: 80000,
        max: 150000,
        currency: 'USD'
      },
      benefits: ['Health insurance', '401k', 'Remote work', 'Stock options']
    }));

  // Filter and sort jobs
  const filteredJobs = jobMatches
    .filter(match => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        match.job.title.toLowerCase().includes(searchLower) ||
        match.job.department?.toLowerCase().includes(searchLower) ||
        match.job.location.toLowerCase().includes(searchLower);
      
      const matchesRole = selectedFilters.roleType === 'all' || match.job.roleType === selectedFilters.roleType;
      const matchesLocation = selectedFilters.location === 'all' || match.job.location === selectedFilters.location;
      
      return matchesSearch && matchesRole && matchesLocation;
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

  const filters = {
    roleType: ['all', 'Full-time', 'Part-time', 'Contract', 'Remote'],
    location: ['all', 'San Francisco', 'New York', 'Remote', 'London'],
    experience: ['all', 'Entry Level', '1-3 years', '3-5 years', '5+ years'],
    salary: ['all', '< $50k', '$50k-$100k', '$100k-$150k', '$150k+']
  };

  const cardClass = 'bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl hover:border-white/30 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)]';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black opacity-90" />
        <FloatingParticles />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/20 bg-white/95 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/applicant" className="flex items-center gap-2 hover:opacity-80 transition-opacity text-black">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Applicant Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-black">
                Browse Jobs
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Badge className="bg-black text-white border-black">
                {filteredJobs.length} Jobs Found
              </Badge>
              <Button
                onClick={() => router.push('/applicant/dashboard')}
                variant="outline"
                className="border-black bg-white hover:bg-gray-100 text-black rounded-xl"
              >
                My Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white/10 border-white/20 text-white rounded-xl"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            {/* Search Bar */}
            <Card className={cardClass}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Search className="w-5 h-5 text-blue-400" />
                  Search Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Job title, skills, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Filters */}
            {(selectedFilters.roleType !== 'all' || selectedFilters.location !== 'all') && (
              <Card className={cardClass}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white text-sm">
                    <Filter className="w-4 h-4 text-blue-400" />
                    Active Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedFilters.roleType !== 'all' && (
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {selectedFilters.roleType}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFilters(prev => ({ ...prev, roleType: 'all' }))}
                        className="h-6 w-6 p-0 hover:bg-white/10"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  {selectedFilters.location !== 'all' && (
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        {selectedFilters.location}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFilters(prev => ({ ...prev, location: 'all' }))}
                        className="h-6 w-6 p-0 hover:bg-white/10"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <Card className={cardClass}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Filter className="w-5 h-5 text-blue-400" />
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
                      <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20 text-white rounded-xl">
                        {options.map(option => (
                          <SelectItem key={option} value={option} className="text-white hover:bg-white/10">
                            {option === 'all' ? 'All' : option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                  onClick={() => setSelectedFilters({
                    roleType: 'all',
                    location: 'all',
                    experience: 'all',
                    salary: 'all'
                  })}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>

            {/* Your Match Score */}
            <Card className={cardClass}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-300">Average Match</p>
                    <p className="text-3xl font-bold text-white">82%</p>
                  </div>
                  <Target className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Based on your profile and preferences
                </p>
                <Button
                  className="w-full bg-white text-black hover:bg-gray-100 rounded-xl"
                  onClick={() => router.push('/applicant/profile')}
                >
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </motion.aside>

          {/* Job Listings */}
          <div className="flex-1 space-y-6">
            {/* Sort and Results Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Available Positions
                </h2>
                <p className="text-gray-400 mt-1">
                  {filteredJobs.length} jobs matching your criteria
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 whitespace-nowrap">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white w-40 rounded-xl">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20 text-white rounded-xl">
                    <SelectItem value="match" className="text-white hover:bg-white/10">Best Match</SelectItem>
                    <SelectItem value="recent" className="text-white hover:bg-white/10">Most Recent</SelectItem>
                    <SelectItem value="salary" className="text-white hover:bg-white/10">Highest Salary</SelectItem>
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
                  whileHover={{ y: -2 }}
                >
                  <Card className={cardClass}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Job Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-semibold text-white mb-2 truncate">
                                {match.job.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm">
                                <span className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  <span className="truncate">TechCorp</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate">{match.job.location}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  <span className="truncate">{match.job.roleType}</span>
                                </span>
                              </div>
                            </div>

                            {/* Match Score */}
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${
                                  match.matchScore >= 80 ? 'text-green-400' :
                                  match.matchScore >= 60 ? 'text-blue-400' :
                                  'text-yellow-400'
                                }`}>
                                  {match.matchScore}%
                                </div>
                                <p className="text-xs text-gray-400">match</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSaveJob(match.jobId);
                                }}
                                className="hover:bg-white/10 rounded-xl"
                              >
                                {savedJobs.includes(match.jobId) ? (
                                  <BookmarkCheck className="w-5 h-5 text-blue-400" />
                                ) : (
                                  <Bookmark className="w-5 h-5 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Job Description */}
                          <p className="text-gray-300 mb-4 line-clamp-2 text-sm">
                            {match.job.description}
                          </p>

                          {/* Skills & Requirements */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {match.job.requirements?.slice(0, 4).map(req => (
                              <Badge
                                key={req}
                                variant="outline"
                                className="border-white/20 bg-white/5 text-gray-300 text-xs"
                              >
                                {req}
                              </Badge>
                            ))}
                            {(match.job.requirements?.length || 0) > 4 && (
                              <Badge variant="outline" className="border-white/20 bg-white/5 text-gray-300 text-xs">
                                +{(match.job.requirements?.length || 0) - 4} more
                              </Badge>
                            )}
                          </div>

                          {/* Footer Info */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-red-400">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ${match.salary.min / 1000}k - ${match.salary.max / 1000}k
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {Math.floor(Math.random() * 50) + 1} applicants
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Posted {Math.floor(Math.random() * 7) + 1}d ago
                              </span>
                            </div>

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/applicant/jobs/${match.jobId}`);
                              }}
                              className="bg-white text-black hover:bg-gray-100 rounded-xl whitespace-nowrap"
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
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
              <Card className={cardClass}>
                <CardContent className="py-16 text-center">
                  <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFilters({
                        roleType: 'all',
                        location: 'all',
                        experience: 'all',
                        salary: 'all'
                      });
                    }}
                    className="bg-white text-black hover:bg-gray-100 rounded-xl"
                  >
                    Clear All Filters
                  </Button>
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
        <div className="text-xl">Loading jobs...</div>
      </div>
    }>
      <JobBrowsingContent />
    </Suspense>
  );
}