'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Bell,
  Settings,
  LogOut,
  HelpCircle,
  UserCheck,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAuthStore } from '@/lib/store/authStore';

// Mock team data
const teamMembers = [
  {
    id: '1',
    name: 'Dalyodh Singh',
    email: '22f3001166@ds.study.iitm.ac.in',
    role: 'HR Manager',
    department: 'Human Resources',
    joinDate: '2023-01-15',
    status: 'active',
    permissions: ['admin', 'hiring', 'analytics'],
    avatar: 'DS'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@techcorp.com',
    role: 'Senior Recruiter',
    department: 'Human Resources',
    joinDate: '2023-03-20',
    status: 'active',
    permissions: ['hiring', 'candidates'],
    avatar: 'PS'
  },
  {
    id: '3',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@techcorp.com',
    role: 'Talent Acquisition Specialist',
    department: 'Human Resources',
    joinDate: '2023-06-10',
    status: 'active',
    permissions: ['hiring'],
    avatar: 'RK'
  },
  {
    id: '4',
    name: 'Anita Patel',
    email: 'anita.patel@techcorp.com',
    role: 'HR Coordinator',
    department: 'Human Resources',
    joinDate: '2023-08-05',
    status: 'active',
    permissions: ['candidates'],
    avatar: 'AP'
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram.singh@techcorp.com',
    role: 'Recruitment Analyst',
    department: 'Human Resources',
    joinDate: '2023-09-15',
    status: 'inactive',
    permissions: ['analytics'],
    avatar: 'VS'
  }
];

export default function TeamPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getRoleIcon = (permissions: string[]) => {
    if (permissions.includes('admin')) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (permissions.includes('analytics')) return <Shield className="w-4 h-4 text-blue-400" />;
    return <User className="w-4 h-4 text-gray-400" />;
  };

  const getRoleBadgeColor = (permissions: string[]) => {
    if (permissions.includes('admin')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    if (permissions.includes('analytics')) return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
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
            <Link href="/about" className="transition-colors text-sm text-black/60 hover:text-black">
              About
            </Link>
            <Link href="/pricing" className="transition-colors text-sm text-black/60 hover:text-black">
              Pricing
            </Link>
            <Link href="/features" className="transition-colors text-sm text-black/60 hover:text-black">
              Features
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
                      <p className="text-sm font-medium text-black">{user?.name || 'HR Manager'}</p>
                      <p className="text-xs text-black/60">HR Manager</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {(user?.name || user?.email || 'HR').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-black/10 text-black w-56 shadow-lg" align="end">
                <div className="px-3 py-2 border-b border-black/10">
                  <p className="text-sm font-medium text-black">{user?.name || 'HR Manager'}</p>
                  <p className="text-xs text-black/60">{user?.email}</p>
                </div>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/hr/profile')}>
                  <User className="w-4 h-4 mr-2 text-black" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/hr/settings')}>
                  <Settings className="w-4 h-4 mr-2 text-black" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/10" />
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5">
                  <UserCheck className="w-4 h-4 mr-2 text-black" />
                  Team Members
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/hr/help')}>
                  <HelpCircle className="w-4 h-4 mr-2 text-black" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/10" />
                <DropdownMenuItem 
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
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
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-black/60 hover:text-black hover:bg-black/5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </motion.div>

          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 text-left"
            >
              <span className="text-[10px] font-light text-black/50 uppercase tracking-[0.35em]">
                TEAM MANAGEMENT
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
                TEAM
                <br />
                <span className="font-medium">MEMBERS</span>
              </h1>
            </motion.div>

            {/* Add Member Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center pt-8"
            >
              <Button
                className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite Team Member
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Content - Dark Section */}
      <section className="relative bg-[#0F0F0F] py-24 z-10 overflow-hidden text-white">
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                      <Input
                        placeholder="Search team members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/60"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  <div className="text-sm text-white/60">
                    {filteredMembers.length} of {teamMembers.length} members
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-light text-white mb-2">{teamMembers.length}</div>
                <div className="text-white/70 text-sm">Total Members</div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-light text-green-400 mb-2">
                  {teamMembers.filter(m => m.status === 'active').length}
                </div>
                <div className="text-white/70 text-sm">Active</div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-light text-yellow-400 mb-2">
                  {teamMembers.filter(m => m.permissions.includes('admin')).length}
                </div>
                <div className="text-white/70 text-sm">Admins</div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-light text-blue-400 mb-2">
                  {teamMembers.filter(m => m.permissions.includes('hiring')).length}
                </div>
                <div className="text-white/70 text-sm">Recruiters</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Members List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10 hover:bg-white/[0.06] transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-white">{member.name}</h3>
                            {getRoleIcon(member.permissions)}
                            <Badge className={getRoleBadgeColor(member.permissions)}>
                              {member.role}
                            </Badge>
                            <Badge className={
                              member.status === 'active' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                            }>
                              {member.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-white/60">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Joined {new Date(member.joinDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/10"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-white/10">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                            <DropdownMenuItem className="hover:bg-gray-800">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-800">
                              <User className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filteredMembers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center py-12"
            >
              <UserCheck className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No team members found</h3>
              <p className="text-white/60 mb-6">Try adjusting your search or filters</p>
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Clear Search
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}