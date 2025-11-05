'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Briefcase, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';


const ROLES = [
  {
    id: 'candidate',
    label: 'Candidate',
    icon: User,
    description: 'Apply for jobs and attend interviews',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'hr',
    label: 'HR Manager',
    icon: Briefcase,
    description: 'Post jobs and manage candidates',
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    description: 'System administration',
    color: 'from-orange-600 to-red-600'
  }
];

const DEMO_CREDENTIALS = {
  candidate: { email: 'candidate@demo.com', password: 'demo123' },
  hr: { email: 'hr@company.com', password: 'demo123' },
  admin: { email: 'admin@company.com', password: 'demo123' }
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, role: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setError('');
    const demo = DEMO_CREDENTIALS[roleId as keyof typeof DEMO_CREDENTIALS];
    setEmail(demo.email);
    setPassword(demo.password);
  };

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    if (!selectedRole) {
      setError('Please select a role');
      setIsLoading(false);
      return;
    }

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const demo = DEMO_CREDENTIALS[selectedRole as keyof typeof DEMO_CREDENTIALS];
    if (email === demo.email && password === demo.password) {
      onLogin(email, selectedRole);
      onClose();
    } else {
      setError('Invalid credentials. Try demo credentials shown below each role.');
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50"

          >
            <Card className="bg-gray-900 border-gray-700 shadow-2xl mx-4">
              <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-gray-700">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </Button>

                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-gray-400">Sign in to continue to HireAI</p>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-200 text-lg mb-4 block">Select Your Role</Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {ROLES.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedRole === role.id;
                        const demo = DEMO_CREDENTIALS[role.id as keyof typeof DEMO_CREDENTIALS];

                        return (
                          <motion.div
                            key={role.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <button
                              type="button"
                              onClick={() => handleRoleSelect(role.id)}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? `border-blue-500 bg-gradient-to-br ${role.color} bg-opacity-20`
                                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-3`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="font-semibold text-white mb-1">{role.label}</h3>
                              <p className="text-sm text-gray-400 mb-2">{role.description}</p>
                              <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
                                <div>Demo: {demo.email}</div>
                                <div>Pass: {demo.password}</div>
                              </div>
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedRole && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="email" className="text-gray-200 mb-2 block">
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email"
                              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="password" className="text-gray-200 mb-2 block">
                            Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {error && (
                          <Alert className="border-red-500/50 bg-red-500/10">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <AlertDescription className="text-red-300">
                              {error}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600"
                            />
                            Remember me
                          </label>
                          <button
                            type="button"
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            Forgot password?
                          </button>
                        </div>

                        <Button
                          onClick={handleLogin}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold"
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              />
                              Signing In...
                            </span>
                          ) : (
                            `Sign In as ${ROLES.find(r => r.id === selectedRole)?.label}`
                          )}
                        </Button>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-sm text-blue-300 text-center">
                            💡 <strong>Demo Mode:</strong> Use the credentials shown above each role to sign in
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="text-center pt-4 border-t border-gray-700">
                    <p className="text-gray-400">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Sign Up
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}