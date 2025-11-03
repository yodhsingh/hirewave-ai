'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  X,
  UserPlus,
  Mail,
  Send,
  AlertCircle,
  CheckCircle,
  Upload,
  Sparkles,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mockStore } from '@/lib/mock/store';

interface InviteCandidatesModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteCandidatesModal({
  jobId,
  jobTitle,
  isOpen,
  onClose,
  onSuccess
}: InviteCandidatesModalProps) {
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
        onSuccess?.();
        // Reset form after short delay to show success
        setTimeout(() => {
          handleClose();
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

  const handleClose = () => {
    setEmails('');
    setValidEmails([]);
    setInvalidEmails([]);
    setInviteResult(null);
    onClose();
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] my-4"
          >
            <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-4 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <UserPlus className="w-6 h-6 text-blue-400" />
                      Invite Candidates
                    </h2>
                    <p className="text-gray-300 mt-1">
                      Send interview invitations for <span className="font-medium text-white">{jobTitle}</span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <p className="text-sm text-gray-400">Valid Emails</p>
                    <p className="text-xl font-bold text-white">{validEmails.length}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                    <p className="text-sm text-gray-400">Invalid</p>
                    <p className="text-xl font-bold text-white">{invalidEmails.length}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <p className="text-sm text-gray-400">Sent</p>
                    <p className="text-xl font-bold text-white">{inviteResult?.created || 0}</p>
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Email Addresses</Label>
                  <Textarea
                    placeholder="Enter email addresses separated by commas or new lines...
john.doe@example.com, jane.smith@company.com
candidate1@email.com
candidate2@email.com"
                    value={emails}
                    onChange={(e) => handleEmailInput(e.target.value)}
                    className="min-h-[150px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
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
                          {invalidEmails.slice(0, 5).map((email, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            >
                              {email}
                            </Badge>
                          ))}
                          {invalidEmails.length > 5 && (
                            <Badge
                              variant="outline"
                              className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            >
                              +{invalidEmails.length - 5} more
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
                <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/30 rounded-lg p-4">
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
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700 bg-gray-900/50 flex-shrink-0">
                <div className="flex items-center justify-between">
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
                      onClick={handleClose}
                      disabled={isProcessing}
                      className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendInvites}
                      disabled={validEmails.length === 0 || isProcessing}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}