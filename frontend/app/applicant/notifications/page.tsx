'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Home,
  User,
  Bell,
  BellRing,
  Check,
  X,
  Briefcase,
  Code,
  Calendar,
  MessageSquare,
  Trophy,
  AlertCircle,
  Info,
  CheckCircle,
  Settings,
  LogOut,
  Filter,
  MoreVertical,
  Trash2,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ApplicantProfile } from '@/types';

interface Notification {
  id: string;
  type: 'job_match' | 'interview' | 'practice' | 'achievement' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function ApplicantNotificationsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'job_match' | 'interview' | 'practice'>('all');

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('applicantProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      // Default profile
      setProfile({
        id: '1',
        name: 'Akash Kumar',
        email: '22f2000946@ds.study.iitm.ac.in',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        desiredRoles: ['Software Engineer', 'Full Stack Developer'],
        experience: 5,
        currentRole: 'Software Engineer',
        location: 'Chandigarh, Punjab',
        createdAt: new Date(),
        updatedAt: new Date(),
        practiceSessions: [],
        applications: [],
      });
    }

    // Mock notifications
    setNotifications([
      {
        id: '1',
        type: 'job_match',
        title: 'New Job Match Found!',
        message: 'Senior React Developer at TechCorp matches your profile perfectly.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        actionUrl: '/applicant/jobs/1',
        priority: 'high'
      },
      {
        id: '2',
        type: 'interview',
        title: 'Interview Scheduled',
        message: 'Your interview with StartupXYZ is scheduled for tomorrow at 2:00 PM.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        actionUrl: '/applicant/interviews/2',
        priority: 'high'
      },
      {
        id: '3',
        type: 'practice',
        title: 'Practice Session Complete',
        message: 'Great job! You scored 85% in your latest behavioral interview practice.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
        actionUrl: '/applicant/practice/feedback',
        priority: 'medium'
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You\'ve completed 10 practice sessions. Keep up the great work!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        priority: 'low'
      },
      {
        id: '5',
        type: 'reminder',
        title: 'Practice Reminder',
        message: 'It\'s been 3 days since your last practice session. Ready for another round?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        read: false,
        priority: 'medium'
      },
      {
        id: '6',
        type: 'system',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated with new skills.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        read: true,
        priority: 'low'
      }
    ]);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_match':
        return <Briefcase className="w-5 h-5 text-blue-400" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-green-400" />;
      case 'practice':
        return <Code className="w-5 h-5 text-purple-400" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'reminder':
        return <BellRing className="w-5 h-5 text-orange-400" />;
      case 'system':
        return <Info className="w-5 h-5 text-gray-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: false } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
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
            <Link href="/applicant/dashboard" className="transition-colors text-sm text-black/60 hover:text-black">
              Dashboard
            </Link>
            <Link href="/applicant/jobs" className="transition-colors text-sm text-black/60 hover:text-black">
              Jobs
            </Link>
            <Link href="/applicant/practice" className="transition-colors text-sm text-black/60 hover:text-black">
              Practice
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-black/5">
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-black">{profile.name}</p>
                      <p className="text-xs text-black/60">Job Seeker</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-black/10 text-black w-56 shadow-lg" align="end">
                <div className="px-3 py-2 border-b border-black/10">
                  <p className="text-sm font-medium text-black">{profile.name}</p>
                  <p className="text-xs text-black/60">{profile.email}</p>
                </div>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/profile')}>
                  <User className="w-4 h-4 mr-2 text-black" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/jobs')}>
                  <Briefcase className="w-4 h-4 mr-2 text-black" />
                  Browse Jobs
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/practice')}>
                  <Code className="w-4 h-4 mr-2 text-black" />
                  Practice Sessions
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5">
                  <Bell className="w-4 h-4 mr-2 text-black" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/10" />
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/settings')}>
                  <Settings className="w-4 h-4 mr-2 text-black" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                  onClick={() => router.push('/')}
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
          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 text-left"
            >
              <span className="text-[10px] font-light text-black/50 uppercase tracking-[0.35em]">
                NOTIFICATIONS CENTER
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
                MY
                <br />
                <span className="font-medium">NOTIFICATIONS</span>
              </h1>
            </motion.div>

            {/* Unread Count */}
            {unreadCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center pt-8"
              >
                <Badge className="bg-red-500/20 text-red-600 border-red-500/30 px-4 py-2">
                  {unreadCount} unread notifications
                </Badge>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Notifications Content - Dark Section */}
      <section className="relative bg-[#0F0F0F] py-24 z-10 overflow-hidden text-white">
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-white">All Notifications</h2>
            <div className="flex items-center gap-3">
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                disabled={unreadCount === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="space-y-6">
            <TabsList className="bg-white/[0.04] border-white/10">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="job_match" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <Briefcase className="w-4 h-4 mr-2" />
                Jobs
              </TabsTrigger>
              <TabsTrigger value="interview" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Interviews
              </TabsTrigger>
              <TabsTrigger value="practice" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <Code className="w-4 h-4 mr-2" />
                Practice
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {filteredNotifications.length === 0 ? (
                  <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                    <CardContent className="py-12 text-center">
                      <Bell className="w-16 h-16 mx-auto text-white/30 mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-white">No Notifications</h3>
                      <p className="text-white/60">
                        {filter === 'unread' ? 'All caught up! No unread notifications.' : 'No notifications found for this filter.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`bg-white/[0.04] backdrop-blur-xl border-white/10 border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? 'bg-blue-500/5' : ''
                      } hover:bg-white/[0.08] transition-all cursor-pointer`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`font-medium ${!notification.read ? 'text-white' : 'text-white/70'}`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-white/60 text-sm mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-white/40">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  {notification.actionUrl && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => router.push(notification.actionUrl!)}
                                      className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                                    >
                                      View Details
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-1 hover:bg-white/10">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white" align="end">
                                {notification.read ? (
                                  <DropdownMenuItem
                                    onClick={() => markAsUnread(notification.id)}
                                    className="hover:bg-gray-800"
                                  >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Mark as Unread
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => markAsRead(notification.id)}
                                    className="hover:bg-gray-800"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-gray-800" />
                                <DropdownMenuItem
                                  onClick={() => deleteNotification(notification.id)}
                                  className="hover:bg-gray-800 text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}