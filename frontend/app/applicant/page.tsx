'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

export default function ApplicantPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-x-hidden">
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
      <Navigation />

      {/* Hero Section */}
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
          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2"
            >
              <span className="text-[10px] font-light text-black/50 uppercase tracking-[0.35em]">
                CANDIDATE DASHBOARD
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <h1 className="text-[32px] md:text-[56px] lg:text-[72px] font-light leading-[1.07] tracking-tight text-black">
                WELCOME TO YOUR
                <br />
                <span className="font-medium">INTERVIEW PORTAL</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <p className="text-lg text-black/70 leading-relaxed">
                Complete your AI-powered interviews, track your applications, and showcase your true potential 
                to employers worldwide.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
            >
              <Button className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2">
                <span>Start Interview</span>
                <Image src="/Forward.svg" alt="" width={16} height={16} className="opacity-90" />
              </Button>
              <Button
                variant="outline"
                className="border border-black/20 bg-transparent hover:bg-black/5 text-black rounded-lg px-8 py-3 text-sm font-normal transition-all inline-flex items-center gap-2"
              >
                <span>View Applications</span>
                <Image src="/Double Right.svg" alt="" width={18} height={18} className="opacity-90" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-[#0F0F0F] py-24 z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-light text-white mb-4">
              YOUR INTERVIEW JOURNEY
            </h2>
            <p className="text-gray-400 text-lg">
              Experience fair, AI-powered interviews that showcase your true potential
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Step 1 */}
            <motion.div variants={fadeInUp} className="relative group">
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 min-h-[300px] flex flex-col text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-light text-blue-400">1</span>
                </div>
                <h3 className="text-xl font-light text-white mb-4">Receive Invitation</h3>
                <p className="text-gray-400 leading-relaxed flex-1">
                  Get invited by employers to complete AI-powered video interviews at your convenience.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeInUp} className="relative group">
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 min-h-[300px] flex flex-col text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-light text-cyan-400">2</span>
                </div>
                <h3 className="text-xl font-light text-white mb-4">Complete Interview</h3>
                <p className="text-gray-400 leading-relaxed flex-1">
                  Answer questions naturally while our AI analyzes your responses fairly and objectively.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeInUp} className="relative group">
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 min-h-[300px] flex flex-col text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-light text-green-400">3</span>
                </div>
                <h3 className="text-xl font-light text-white mb-4">Get Results</h3>
                <p className="text-gray-400 leading-relaxed flex-1">
                  Receive feedback and move forward in the hiring process based on your true potential.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-[#0F0F0F] py-24 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-light text-white mb-4">
              TRUSTED BY CANDIDATES
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="text-4xl font-light text-white mb-2">Fair</div>
                <div className="text-gray-400">AI-Powered Evaluation</div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="text-4xl font-light text-white mb-2">24/7</div>
                <div className="text-gray-400">Available Anytime</div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="text-4xl font-light text-white mb-2">Fast</div>
                <div className="text-gray-400">Quick Results</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[#0F0F0F] py-24 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-12 lg:p-20 text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-light text-black leading-tight mb-6">
              READY TO SHOWCASE
              <br />
              YOUR POTENTIAL?
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              Join thousands of candidates who have successfully completed AI-powered interviews 
              and landed their dream jobs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-black text-white hover:bg-gray-800 rounded-lg px-8 py-3 text-sm font-normal">
                Start Your First Interview
              </Button>
              <Button 
                variant="outline" 
                className="border border-black/20 bg-transparent hover:bg-black/5 text-black rounded-lg px-8 py-3 text-sm font-normal"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}