'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';

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

export default function AboutPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-16 pt-12 pb-28 lg:pt-12 lg:pb-32 min-h-[720px] lg:min-h-[780px] xl:min-h-[840px]">
        {/* Mobile-only white backdrop to ensure sufficient white area under hero text */}
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
          <div className="grid gap-12 items-center lg:grid-cols-[0.66fr_0.34fr] xl:grid-cols-[0.62fr_0.38fr] 2xl:grid-cols-[0.6fr_0.4fr]">
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
                  ABOUT HIREWAVE.AI
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <h1 className="relative text-left text-[32px] md:text-[56px] lg:text-[72px] font-light leading-[1.07] tracking-tight text-black">
                  REVOLUTIONIZING
                  <br />
                  THE FUTURE OF
                  <br />
                  <span className="font-medium">HIRING</span>
                </h1>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <p className="text-lg text-black/70 leading-relaxed max-w-2xl">
                  At HireWave.ai, we believe that every candidate deserves a fair chance to showcase their true potential. 
                  Our AI-powered platform eliminates bias, saves time, and transforms the hiring process for both companies and candidates.
                </p>
                <p className="text-base text-black/60 leading-relaxed max-w-2xl">
                  Founded by a team of AI researchers and HR professionals, we're on a mission to make hiring more efficient, 
                  fair, and human-centered through cutting-edge technology.
                </p>
              </motion.div>


            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden md:flex justify-center items-center lg:justify-end min-h-[280px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[520px]"
            >
              <div className="absolute right-0 bottom-110">
                <Image
                  src="/image16.png"
                  alt="AI Technology"
                  width={500}
                  height={1500}
                  className="w-[260px] sm:w-[320px] md:w-[420px] lg:w-auto h-auto z-[100] lg:scale-105 mb-9 max-[1600px]:mb-20"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative bg-[#0F0F0F] py-24 z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 lg:gap-20"
          >
            {/* Mission */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-light text-white">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                To democratize hiring by creating an AI-powered platform that gives every candidate 
                a fair opportunity to demonstrate their skills while helping companies build better teams faster.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Eliminate unconscious bias in hiring decisions</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Scale interview processes without losing quality</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Provide data-driven insights for better decisions</p>
                </div>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-light text-white">Our Vision</h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                A world where talent is recognized regardless of background, where hiring is efficient and fair, 
                and where both companies and candidates have the tools they need to find the perfect match.
              </p>
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-light text-white mb-2">2030 Goal</div>
                <p className="text-gray-400">
                  Power 1 million fair hiring decisions and help 10 million candidates 
                  showcase their true potential through AI-driven interviews.
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
            className="mb-16"
          >
            <h2 className="text-[48px] lg:text-[72px] font-light text-white uppercase tracking-tight">Our Impact</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Stat 1 */}
            <motion.div variants={fadeInUp} className="relative group">
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-12 md:p-14 min-h-[360px] flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
                  <Image src="/Management.svg" alt="Innovation" width={44} height={44} className="invert brightness-0" />
                </div>
                <div className="text-4xl md:text-5xl font-light text-white mb-3">2025</div>
                <div className="text-gray-400">Founded with Vision</div>
              </div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div variants={fadeInUp} className="relative group">
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-12 md:p-14 min-h-[360px] flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
                  <Image src="/Brain.svg" alt="AI Technology" width={44} height={44} className="invert brightness-0" />
                </div>
                <div className="text-4xl md:text-5xl font-light text-white mb-3">100%</div>
                <div className="text-gray-400">AI-Powered Platform</div>
              </div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div variants={fadeInUp} className="relative group">
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-12 md:p-14 min-h-[360px] flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
                  <Image src="/Clock.svg" alt="Future Ready" width={44} height={44} className="invert brightness-0" />
                </div>
                <div className="text-4xl md:text-5xl font-light text-white mb-3">∞</div>
                <div className="text-gray-400">Possibilities Ahead</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}