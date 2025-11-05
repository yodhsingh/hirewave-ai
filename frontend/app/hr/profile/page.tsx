'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera,
  Bell,
  Settings,
  LogOut,
  HelpCircle,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Dalyodh Singh',
    email: user?.email || '22f3001166@ds.study.iitm.ac.in',
    phone: '+91 98765 43210',
    company: 'TechCorp Solutions',
    department: 'Human Resources',
    location: 'Mumbai, India',
    joinDate: '2023-01-15'
  });

  const handleSave = () => {
    // In a real app, this would call an API to update the profile
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
                      <p className="text-sm font-medium text-black">{formData.name}</p>
                      <p className="text-xs text-black/60">HR Manager</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {formData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-black/10 text-black w-56 shadow-lg" align="end">
                <div className="px-3 py-2 border-b border-black/10">
                  <p className="text-sm font-medium text-black">{formData.name}</p>
                  <p className="text-xs text-black/60">{formData.email}</p>
                </div>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5">
                  <User className="w-4 h-4 mr-2 text-black" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/hr/settings')}>
                  <Settings className="w-4 h-4 mr-2 text-black" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/10" />
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/hr/team')}>
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
                USER PROFILE
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
                <span className="font-medium">PROFILE</span>
              </h1>
            </motion.div>

            {/* Edit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center pt-8"
            >
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border border-black/20 bg-transparent hover:bg-black/5 text-black rounded-lg px-8 py-3 text-sm font-normal"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Profile Content - Dark Section */}
      <section className="relative bg-[#0F0F0F] py-24 z-10 overflow-hidden text-white">
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Picture Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardContent className="p-8 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-4xl font-bold text-white">
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-white/20 hover:bg-white/30"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">{formData.name}</h3>
                  <p className="text-white/70 mb-4">{formData.department}</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    Active
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/70">Full Name</Label>
                      {isEditing ? (
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <User className="w-4 h-4 text-white/60" />
                          {formData.name}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Email Address</Label>
                      {isEditing ? (
                        <Input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Mail className="w-4 h-4 text-white/60" />
                          {formData.email}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Phone className="w-4 h-4 text-white/60" />
                          {formData.phone}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Company</Label>
                      {isEditing ? (
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Building className="w-4 h-4 text-white/60" />
                          {formData.company}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Department</Label>
                      {isEditing ? (
                        <Input
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <Building className="w-4 h-4 text-white/60" />
                          {formData.department}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Location</Label>
                      {isEditing ? (
                        <Input
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="bg-white/[0.04] border-white/10 text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="w-4 h-4 text-white/60" />
                          {formData.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar className="w-4 h-4" />
                      <span>Joined on {new Date(formData.joinDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}