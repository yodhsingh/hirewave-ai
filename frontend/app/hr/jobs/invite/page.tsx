'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Send,
  AlertCircle,
  CheckCircle,
  Upload,
  Sparkles,
  Users,
  Briefcase,
  Home,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockStore } from '@/lib/mock/store';
import Link from 'next/link';
import { gradients } from '@/lib/theme';
import { EmailTemplateEditor } from '@/components/hr/EmailTemplateEditor';

function InviteCandidatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [jobTitle, setJobTitle] = useState('');
  const [emails, setEmails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validEmails, setValidEmails] = useState<string[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);
  const [inviteResult, setInviteResult] = useState<{
    created: number;
    duplicates: number;
    invalid: string[];
    failed: string[];
    invites: unknown[];
  } | null>(null);

  useEffect(() => {
    if (jobId) {
      const job = mockStore.getJobById(jobId);
      if (job) {
        setJobTitle(job.title);
      } else {
        toast.error('Job not found');
        router.push('/hr/dashboard');
      }
    } else {
      toast.error('No job specified');
      router.push('/hr/dashboard');
    }
  }, [jobId, router]);

  const validateEmails = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailList = input
      .split(/[,\n\s]+/)
      .filter(email => email.trim() !== '');

    const valid: string[] = [];
    const invalid: string[] = [];

    emailList.forEach(email => {
      const trimmed = email.trim();
      if (emailRegex.test(trimmed)) {
        valid.push(trimmed);
      } else if (trimmed) {
        invalid.push(trimmed);
      }
    });

    setValidEmails(valid);
    setInvalidEmails(invalid);
  };

  const handleEmailInput = (value: string) => {
    setEmails(value);
    validateEmails(value);
  };

  const handleSendInvites = async () => {
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    if (!jobId) {
      toast.error('No job specified');
      return;
    }

    setIsProcessing(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Use mock store to create invites
      const result = mockStore.createInvites(jobId, validEmails);
      setInviteResult(result);

      if (result.created > 0) {
        toast.success(`Successfully sent ${result.created} invitation${result.created > 1 ? 's' : ''}`);
        if (result.duplicates > 0) {
          toast.warning(`${result.duplicates} candidate${result.duplicates > 1 ? 's' : ''} already invited`);
        }
        // Navigate back after short delay
        setTimeout(() => {
          router.push(`/hr/jobs/${jobId}`);
        }, 2000);
      } else {
        toast.error('Failed to send invitations. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred while sending invitations');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Simple CSV parsing - in production, use a proper CSV parser
        const emails = content
          .split(/[,\n\r]+/)
          .map(email => email.trim())
          .filter(email => email && email.includes('@'));
        setEmails(emails.join(', '));
        validateEmails(emails.join(', '));
      };
      reader.readAsText(file);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients.bgPrimary}`} />
        <div className={`absolute inset-0 bg-gradient-to-tr ${gradients.bgSecondary}`} />
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 border-b border-gray-800 bg-black/50 backdrop-blur-lg sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <Link href="/hr/dashboard" className="hover:opacity-80 transition-opacity">
                <span className="text-gray-300 hover:text-white">Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <span className="text-white font-semibold">Invite Candidates</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="relative p-2 hover:bg-gray-800">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-800">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradients.primary} flex items-center justify-center text-white font-semibold`}>
                      DS
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium text-white">Dalyodh Singh</p>
                      <p className="text-xs text-gray-400">22f3001166@ds.study.iitm.ac.in</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white w-56" align="end">
                  <div className="px-3 py-2 border-b border-gray-800">
                    <p className="text-sm font-medium">Dalyodh Singh</p>
                    <p className="text-xs text-gray-400">22f3001166@ds.study.iitm.ac.in</p>
                  </div>
                  <DropdownMenuItem className="focus:bg-gray-800 focus:text-white cursor-pointer">
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gray-800 focus:text-white cursor-pointer">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gray-800 focus:text-white cursor-pointer">
                    Team Members
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem className="focus:bg-gray-800 focus:text-white cursor-pointer">
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gray-800 focus:text-white cursor-pointer text-red-400">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-5xl">
        <motion.div {...fadeInUp}>
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <p className="text-gray-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Send interview invitations for <span className="font-medium text-white">{jobTitle}</span>
              </p>
              <Badge
                variant="outline"
                className={`bg-gradient-to-r ${gradients.cardHeader} border-blue-500/50 text-blue-300`}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Screening
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gray-900/90 border-gray-700">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-sm text-gray-400">Valid Emails</p>
                <p className="text-3xl font-bold text-white mt-1">{validEmails.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/90 border-gray-700">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-sm text-gray-400">Invalid</p>
                <p className="text-3xl font-bold text-white mt-1">{invalidEmails.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/90 border-gray-700">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm text-gray-400">Sent</p>
                <p className="text-3xl font-bold text-white mt-1">{inviteResult?.created || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Email Input Card */}
          <Card className="bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-xl mb-6">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-200 text-lg">Email Addresses</Label>
                <Textarea
                  placeholder="Enter email addresses separated by commas or new lines...

john.doe@example.com, jane.smith@company.com
candidate1@email.com
candidate2@email.com"
                  value={emails}
                  onChange={(e) => handleEmailInput(e.target.value)}
                  className="min-h-[200px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 text-base"
                  disabled={isProcessing}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Enter multiple emails separated by commas, spaces, or new lines
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isProcessing}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                      disabled={isProcessing}
                    >
                      <Upload className="w-4 h-4" />
                      Import CSV
                    </Button>
                  </div>
                </div>
              </div>

              {/* Invalid Emails Warning */}
              {invalidEmails.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-400 mb-2">
                        Invalid email addresses detected
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {invalidEmails.slice(0, 10).map((email, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          >
                            {email}
                          </Badge>
                        ))}
                        {invalidEmails.length > 10 && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          >
                            +{invalidEmails.length - 10} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {inviteResult && inviteResult.created > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-green-400 font-medium">
                        Successfully sent {inviteResult.created} invitation{inviteResult.created > 1 ? 's' : ''}!
                      </p>
                      {inviteResult.duplicates > 0 && (
                        <p className="text-sm text-gray-400 mt-1">
                          {inviteResult.duplicates} candidate{inviteResult.duplicates > 1 ? 's were' : ' was'} already invited
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AI Suggestion */}
              <div className={`bg-gradient-to-r ${gradients.cardHeader} border border-blue-500/30 rounded-lg p-4`}>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium mb-1">Pro Tip</p>
                    <p className="text-gray-400">
                      Our AI-powered phone screening will automatically call each candidate and conduct a
                      technical interview based on your job requirements. Candidates typically complete
                      interviews within 24-48 hours of receiving the invitation.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Template Editor */}
          <EmailTemplateEditor />

          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-gray-900/90 border border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-400">
              {validEmails.length > 0 && (
                <span>
                  Ready to send {validEmails.length} invitation{validEmails.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(jobId ? `/hr/jobs/${jobId}` : '/hr/dashboard')}
                disabled={isProcessing}
                className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendInvites}
                disabled={validEmails.length === 0 || isProcessing}
                className={`gap-2 bg-gradient-to-r ${gradients.primary} hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50`}
              >
                {isProcessing ? (
                  <>
                    <Mail className="w-4 h-4 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invitations
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function InviteCandidatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <InviteCandidatesContent />
    </Suspense>
  );
}
