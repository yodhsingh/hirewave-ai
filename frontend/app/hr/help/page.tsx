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
  Search,
  MessageCircle,
  Book,
  Video,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Headphones,
  Send,
  Building,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

// Mock FAQ data
const faqs = [
  {
    id: '1',
    question: 'How do I create a new job posting?',
    answer: 'To create a new job posting, go to your HR Dashboard and click the "Create Job" button. Fill in the job details, requirements, and questions, then publish it.',
    category: 'Jobs',
    helpful: 24
  },
  {
    id: '2',
    question: 'How does AI candidate screening work?',
    answer: 'Our AI analyzes candidate responses to interview questions using natural language processing and machine learning to provide objective scoring and insights.',
    category: 'AI Features',
    helpful: 18
  },
  {
    id: '3',
    question: 'Can I customize interview questions?',
    answer: 'Yes! You can create custom questions for each job posting. We also provide AI-generated questions based on the job requirements.',
    category: 'Interviews',
    helpful: 15
  },
  {
    id: '4',
    question: 'How do I invite team members?',
    answer: 'Go to Team Members page and click "Invite Team Member". Enter their email and select appropriate permissions for their role.',
    category: 'Team Management',
    helpful: 12
  },
  {
    id: '5',
    question: 'What analytics are available?',
    answer: 'You can view hiring funnel metrics, time-to-hire statistics, candidate source analysis, and application trends over time.',
    category: 'Analytics',
    helpful: 20
  }
];

// Mock support tickets
const supportTickets = [
  {
    id: 'T001',
    subject: 'Unable to access candidate profiles',
    status: 'resolved',
    priority: 'high',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-16'
  },
  {
    id: 'T002',
    subject: 'Question about AI scoring accuracy',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-19'
  }
];

export default function HelpPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  });

  const categories = ['all', 'Jobs', 'AI Features', 'Interviews', 'Team Management', 'Analytics'];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to an API
    console.log('Support ticket submitted:', supportForm);
    setSupportForm({ subject: '', category: '', priority: 'medium', message: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
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
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5" onClick={() => router.push('/hr/team')}>
                  <UserCheck className="w-4 h-4 mr-2 text-black" />
                  Team Members
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black hover:bg-black/5 focus:bg-black/5">
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
                HELP & SUPPORT
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
                HOW CAN WE
                <br />
                <span className="font-medium">HELP YOU?</span>
              </h1>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center pt-8"
            >
              <Button
                onClick={() => window.open('https://calendly.com/22f2000946-ds/30min', '_blank')}
                className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book a Call
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Help Content - Dark Section */}
      <section className="relative bg-[#0F0F0F] py-24 z-10 overflow-hidden text-white">
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          {/* Quick Help Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-6 mb-16"
          >
            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10 hover:bg-white/[0.06] transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Book className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <h3 className="font-medium text-white mb-2">Documentation</h3>
                <p className="text-sm text-white/60">Complete guides and tutorials</p>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10 hover:bg-white/[0.06] transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Video className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <h3 className="font-medium text-white mb-2">Video Tutorials</h3>
                <p className="text-sm text-white/60">Step-by-step video guides</p>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10 hover:bg-white/[0.06] transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Headphones className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <h3 className="font-medium text-white mb-2">Live Support</h3>
                <p className="text-sm text-white/60">Chat with our support team</p>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10 hover:bg-white/[0.06] transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Phone className="w-8 h-8 text-orange-400 mx-auto mb-4" />
                <h3 className="font-medium text-white mb-2">Phone Support</h3>
                <p className="text-sm text-white/60">Call us for urgent issues</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                    <Input
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/60"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40"
                        }
                      >
                        {category === 'all' ? 'All' : category}
                      </Button>
                    ))}
                  </div>

                  {/* FAQ List */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredFaqs.map(faq => (
                      <div key={faq.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white text-sm">{faq.question}</h4>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                        <p className="text-white/70 text-sm mb-3">{faq.answer}</p>
                        <div className="flex items-center justify-between text-xs text-white/50">
                          <span>{faq.helpful} people found this helpful</span>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Support Ticket Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Submit Support Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Subject</Label>
                      <Input
                        value={supportForm.subject}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="bg-white/[0.04] border-white/10 text-white"
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Category</Label>
                        <select
                          value={supportForm.category}
                          onChange={(e) => setSupportForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-2 bg-white/[0.04] border border-white/10 rounded-md text-white"
                          required
                        >
                          <option value="">Select category</option>
                          <option value="technical">Technical Issue</option>
                          <option value="billing">Billing</option>
                          <option value="feature">Feature Request</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Priority</Label>
                        <select
                          value={supportForm.priority}
                          onChange={(e) => setSupportForm(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full p-2 bg-white/[0.04] border border-white/10 rounded-md text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Message</Label>
                      <Textarea
                        value={supportForm.message}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                        className="bg-white/[0.04] border-white/10 text-white min-h-[120px]"
                        placeholder="Describe your issue in detail..."
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </Button>
                  </form>

                  {/* Recent Tickets */}
                  {supportTickets.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <h4 className="text-white font-medium mb-4">Your Recent Tickets</h4>
                      <div className="space-y-3">
                        {supportTickets.map(ticket => (
                          <div key={ticket.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white text-sm font-medium">#{ticket.id}</span>
                                <Badge className={getStatusColor(ticket.status)}>
                                  {ticket.status.replace('_', ' ')}
                                </Badge>
                                <Badge className={getPriorityColor(ticket.priority)}>
                                  {ticket.priority}
                                </Badge>
                              </div>
                              <p className="text-white/70 text-sm">{ticket.subject}</p>
                              <p className="text-white/50 text-xs">
                                Updated {new Date(ticket.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-light text-white mb-4">Need Immediate Help?</h3>
                  <p className="text-white/70">Our support team is available 24/7 to assist you</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <Mail className="w-8 h-8 text-blue-400 mb-3" />
                    <h4 className="font-medium text-white mb-2">Email</h4>
                    <p className="text-white/70 text-sm">akash@iitmbs.ac.in</p>
                    <p className="text-white/70 text-sm">akshit@iitmbs.ac.in</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <Building className="w-8 h-8 text-green-400 mb-3" />
                    <h4 className="font-medium text-white mb-2">Office</h4>
                    <p className="text-white/70 text-sm">Reachpark, IITM</p>
                    <p className="text-white/70 text-sm">Chennai, India</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <Phone className="w-8 h-8 text-purple-400 mb-3" />
                    <h4 className="font-medium text-white mb-2">Phone</h4>
                    <p className="text-white/70 text-sm">+91 9292929292</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}