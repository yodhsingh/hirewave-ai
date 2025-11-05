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
  Shield,
  Eye,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Trash2,
  Download,
  Upload,
  Settings as SettingsIcon,
  LogOut,
  Briefcase,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function ApplicantSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      jobAlerts: true,
      practiceReminders: true,
      interviewUpdates: true,
      weeklyDigest: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowRecruiterContact: true,
      shareAnalytics: true,
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      theme: 'light',
      emailFrequency: 'daily',
    },
  });

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

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('applicantSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('applicantSettings', JSON.stringify(settings));
    // Show success message (you could add a toast here)
  };

  const exportData = () => {
    const data = {
      profile,
      settings,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-profile-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.removeItem('applicantProfile');
      localStorage.removeItem('applicantSettings');
      router.push('/');
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
            <Button variant="ghost" className="relative p-2 hover:bg-black/5">
              <Bell className="w-5 h-5 text-black/60" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

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
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/applicant/notifications')}>
                  <Bell className="w-4 h-4 mr-2 text-black" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/10" />
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5">
                  <SettingsIcon className="w-4 h-4 mr-2 text-black" />
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
                ACCOUNT SETTINGS
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
                <span className="font-medium">SETTINGS</span>
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Settings Content - Dark Section */}
      <section className="relative bg-[#0F0F0F] py-24 z-10 overflow-hidden text-white">
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          {/* Settings Tabs */}
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="bg-white/[0.04] border-white/10">
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <Globe className="w-4 h-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-400" />
                          <div>
                            <Label className="text-white">Email Notifications</Label>
                            <p className="text-sm text-white/60">Receive notifications via email</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.notifications.email}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-green-400" />
                          <div>
                            <Label className="text-white">Push Notifications</Label>
                            <p className="text-sm text-white/60">Receive push notifications on your device</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.notifications.push}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-purple-400" />
                          <div>
                            <Label className="text-white">Job Alerts</Label>
                            <p className="text-sm text-white/60">Get notified about new job matches</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.notifications.jobAlerts}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'jobAlerts', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Code className="w-5 h-5 text-orange-400" />
                          <div>
                            <Label className="text-white">Practice Reminders</Label>
                            <p className="text-sm text-white/60">Reminders to practice interviews</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.notifications.practiceReminders}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'practiceReminders', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-yellow-400" />
                          <div>
                            <Label className="text-white">Interview Updates</Label>
                            <p className="text-sm text-white/60">Updates about scheduled interviews</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.notifications.interviewUpdates}
                          onCheckedChange={(checked) => handleSettingChange('notifications', 'interviewUpdates', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white mb-2 block">Profile Visibility</Label>
                        <Select
                          value={settings.privacy.profileVisibility}
                          onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                        >
                          <SelectTrigger className="bg-white/[0.04] border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700 text-white">
                            <SelectItem value="public" className="text-white hover:bg-gray-800">Public</SelectItem>
                            <SelectItem value="recruiters" className="text-white hover:bg-gray-800">Recruiters Only</SelectItem>
                            <SelectItem value="private" className="text-white hover:bg-gray-800">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Eye className="w-5 h-5 text-blue-400" />
                          <div>
                            <Label className="text-white">Show Email Address</Label>
                            <p className="text-sm text-white/60">Allow others to see your email</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.privacy.showEmail}
                          onCheckedChange={(checked) => handleSettingChange('privacy', 'showEmail', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Eye className="w-5 h-5 text-green-400" />
                          <div>
                            <Label className="text-white">Show Phone Number</Label>
                            <p className="text-sm text-white/60">Allow others to see your phone</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.privacy.showPhone}
                          onCheckedChange={(checked) => handleSettingChange('privacy', 'showPhone', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-purple-400" />
                          <div>
                            <Label className="text-white">Allow Recruiter Contact</Label>
                            <p className="text-sm text-white/60">Let recruiters contact you directly</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.privacy.allowRecruiterContact}
                          onCheckedChange={(checked) => handleSettingChange('privacy', 'allowRecruiterContact', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">General Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-white mb-2 block">Language</Label>
                        <Select
                          value={settings.preferences.language}
                          onValueChange={(value) => handleSettingChange('preferences', 'language', value)}
                        >
                          <SelectTrigger className="bg-white/[0.04] border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700 text-white">
                            <SelectItem value="en" className="text-white hover:bg-gray-800">English</SelectItem>
                            <SelectItem value="es" className="text-white hover:bg-gray-800">Spanish</SelectItem>
                            <SelectItem value="fr" className="text-white hover:bg-gray-800">French</SelectItem>
                            <SelectItem value="de" className="text-white hover:bg-gray-800">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white mb-2 block">Timezone</Label>
                        <Select
                          value={settings.preferences.timezone}
                          onValueChange={(value) => handleSettingChange('preferences', 'timezone', value)}
                        >
                          <SelectTrigger className="bg-white/[0.04] border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700 text-white">
                            <SelectItem value="UTC" className="text-white hover:bg-gray-800">UTC</SelectItem>
                            <SelectItem value="EST" className="text-white hover:bg-gray-800">Eastern Time</SelectItem>
                            <SelectItem value="PST" className="text-white hover:bg-gray-800">Pacific Time</SelectItem>
                            <SelectItem value="IST" className="text-white hover:bg-gray-800">India Standard Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Email Frequency</Label>
                      <Select
                        value={settings.preferences.emailFrequency}
                        onValueChange={(value) => handleSettingChange('preferences', 'emailFrequency', value)}
                      >
                        <SelectTrigger className="bg-white/[0.04] border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700 text-white">
                          <SelectItem value="immediate" className="text-white hover:bg-gray-800">Immediate</SelectItem>
                          <SelectItem value="daily" className="text-white hover:bg-gray-800">Daily Digest</SelectItem>
                          <SelectItem value="weekly" className="text-white hover:bg-gray-800">Weekly Digest</SelectItem>
                          <SelectItem value="never" className="text-white hover:bg-gray-800">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Account Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg">
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5 text-blue-400" />
                          <div>
                            <Label className="text-white">Export Data</Label>
                            <p className="text-sm text-white/60">Download all your profile data</p>
                          </div>
                        </div>
                        <Button
                          onClick={exportData}
                          variant="outline"
                          className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                        >
                          Export
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-yellow-400" />
                          <div>
                            <Label className="text-white">Change Password</Label>
                            <p className="text-sm text-white/60">Update your account password</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                        >
                          Change
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Trash2 className="w-5 h-5 text-red-400" />
                          <div>
                            <Label className="text-white">Delete Account</Label>
                            <p className="text-sm text-white/60">Permanently delete your account and all data</p>
                          </div>
                        </div>
                        <Button
                          onClick={deleteAccount}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <Button
              onClick={saveSettings}
              className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal"
            >
              Save All Settings
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}