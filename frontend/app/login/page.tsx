'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store/authStore';
import { backendClient } from '@/lib/api/backend-client';
import { toast } from 'sonner';

import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { login, logout } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('hr');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Clear any existing auth data before login to avoid stale token issues
        logout();
        await backendClient.logout(); // Also clear backendClient tokens

        // Real login via backend API
        const response = await backendClient.login(formData.email, formData.password);

        if (response.success && response.data) {
          // Update auth store with full user data and real JWT tokens from backend
          const { user, accessToken, refreshToken } = response.data;
          login(user, accessToken, refreshToken);

          toast.success("Welcome back!", {
            description: "You've successfully logged in.",
          });

          // Redirect based on user role from backend
          if (user.role === 'HR') {
            router.push('/hr/dashboard');
          } else {
            router.push('/applicant');
          }
        } else {
          toast.error("Login failed", {
            description: response.error?.message || "Invalid credentials",
          });
        }
      } else {
        // Registration via backend API
        const response = await backendClient.register({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: userType as 'hr' | 'candidate',
        });

        if (response.success && response.data) {
          toast.success("Account created!", {
            description: "Please login with your credentials.",
          });
          setIsLogin(true);
        } else {
          toast.error("Registration failed", {
            description: response.error?.message || "Could not create account",
          });
        }
      }
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-x-hidden">
      {/* Background SVG - same as home page */}
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
      <Navigation />

      {/* Main Content */}
      <section className="relative z-10 px-6 lg:px-16 pt-12 pb-28 lg:pt-12 lg:pb-32 min-h-[720px] lg:min-h-[780px] xl:min-h-[840px]">
        {/* Mobile-only white backdrop */}
        <div className="absolute inset-x-0 translate-y-[-200px] bottom-0 h-full overflow-hidden lg:hidden">
          <Image
            src="/Background.svg"
            alt="Background"
            fill
            sizes="100vw"
            className="object-cover object-bottom"
            priority
          />
        </div>
        
        <div className="relative z-[2] max-w-[1400px] mx-auto">
          <div className="grid gap-12 items-center lg:grid-cols-[0.5fr_0.5fr] xl:grid-cols-[0.45fr_0.55fr]">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 text-left"
              >
                <span className="text-[10px] font-light text-black/50 uppercase tracking-[0.35em]">
                  {isLogin ? 'WELCOME BACK' : 'JOIN HIREWAVE.AI'}
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <h1 className="relative text-left text-[32px] md:text-[56px] lg:text-[64px] font-light leading-[1.07] tracking-tight text-black">
                  {isLogin ? (
                    <>
                      SIGN IN TO
                      <br />
                      <span className="font-medium">HIREWAVE.AI</span>
                    </>
                  ) : (
                    <>
                      CREATE YOUR
                      <br />
                      <span className="font-medium">ACCOUNT</span>
                    </>
                  )}
                </h1>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <p className="text-lg text-black/70 leading-relaxed max-w-md">
                  {isLogin 
                    ? 'Access your AI-powered hiring dashboard and transform your recruitment process.'
                    : 'Join thousands of companies and candidates using AI to revolutionize hiring.'
                  }
                </p>
              </motion.div>

              {/* Toggle Login/Signup */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-black/60">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </span>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-black font-medium hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </motion.div>
            </motion.div>

            {/* Right Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-black">I am a:</Label>
                    <div className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="hr"
                          name="userType"
                          value="hr"
                          checked={userType === 'hr'}
                          onChange={(e) => setUserType(e.target.value)}
                          className="h-4 w-4 text-black border-black/20 focus:ring-black/20"
                        />
                        <Label htmlFor="hr" className="text-sm text-black cursor-pointer">
                          HR Manager
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="candidate"
                          name="userType"
                          value="candidate"
                          checked={userType === 'candidate'}
                          onChange={(e) => setUserType(e.target.value)}
                          className="h-4 w-4 text-black border-black/20 focus:ring-black/20"
                        />
                        <Label htmlFor="candidate" className="text-sm text-black cursor-pointer">
                          Candidate
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Name field for signup */}
                  {!isLogin && (
                    <motion.div
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      className="space-y-2"
                    >
                      <Label htmlFor="name" className="text-sm font-medium text-black">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-white border-black/20 text-black placeholder:text-black/50 focus:border-black/40 h-12"
                        placeholder="Enter your full name"
                      />
                    </motion.div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-black">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-white border-black/20 text-black placeholder:text-black/50 focus:border-black/40 h-12"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-black">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-white border-black/20 text-black placeholder:text-black/50 focus:border-black/40 h-12"
                      placeholder="Enter your password"
                    />
                  </div>

                  {/* Company field for signup and HR */}
                  {!isLogin && userType === 'hr' && (
                    <motion.div
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      className="space-y-2"
                    >
                      <Label htmlFor="company" className="text-sm font-medium text-black">
                        Company Name
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        className="bg-white border-black/20 text-black placeholder:text-black/50 focus:border-black/40 h-12"
                        placeholder="Enter your company name"
                      />
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-4 text-base font-normal h-12 disabled:opacity-50"
                  >
                    {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>

                  {/* Login Help */}
                  <div className="text-center pt-4 space-y-2">
                    <p className="text-xs text-black/50">
                      Team login: 22f1000535@ds.study.iitm.ac.in
                    </p>
                    <p className="text-xs text-black/50">
                      Or: 23f3003216@ds.study.iitm.ac.in
                    </p>
                    <p className="text-xs text-black/50">
                      Password: password123
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dark Section for additional content */}
      <section className="relative bg-[#0F0F0F] py-24 z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-light text-white mb-8">
              {userType === 'hr' ? 'FOR HR MANAGERS' : 'FOR CANDIDATES'}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {userType === 'hr' ? (
                <>
                  <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="text-2xl font-light text-white mb-3">AI Screening</div>
                    <div className="text-gray-400 text-sm">Automate candidate evaluation</div>
                  </div>
                  <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="text-2xl font-light text-white mb-3">Smart Analytics</div>
                    <div className="text-gray-400 text-sm">Data-driven hiring decisions</div>
                  </div>
                  <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="text-2xl font-light text-white mb-3">Zero Bias</div>
                    <div className="text-gray-400 text-sm">Fair and inclusive hiring</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="text-2xl font-light text-white mb-3">Fair Chance</div>
                    <div className="text-gray-400 text-sm">Showcase your true potential</div>
                  </div>
                  <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="text-2xl font-light text-white mb-3">AI Feedback</div>
                    <div className="text-gray-400 text-sm">Improve your interview skills</div>
                  </div>
                  <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="text-2xl font-light text-white mb-3">Quick Process</div>
                    <div className="text-gray-400 text-sm">Faster hiring decisions</div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}