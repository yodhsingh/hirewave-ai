'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/authStore';
import { Target, ChevronRight } from 'lucide-react';

const NG_FEATURES = [
  {
    key: 'video',
    left: 'Video Screening',
    title: 'AI-Powered Video Screening',
    description:
      'Advanced AI analyzes responses, body language, and communication skills automatically to provide comprehensive candidate assessments.',
  },
  {
    key: 'scoring',
    left: 'Scoring Algorithm',
    title: 'Smart Scoring Algorithm',
    description:
      'Our scoring models rank candidates based on competency matrices, role fit, and consistency—removing guesswork from shortlisting.',
  },
  {
    key: 'bias',
    left: 'Zero Bias Hiring',
    title: 'Zero-Bias Hiring',
    description:
      'Fairness-first evaluations reduce unconscious bias with structured prompts, anonymized reviews, and calibration across interviewers.',
  },
] as const;

export default function HomePage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    // Removed unused mouse tracking
  }, []);

  const handleHRLogin = () => {
    login('hr@company.com', 'hr');
    router.push('/hr/dashboard');
  };

  const handleCandidateDemo = () => {
    router.push('/applicant');
  };

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

  // Next-Gen section slider state
  const [ngIndex, setNgIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setNgIndex((i) => (i + 1) % NG_FEATURES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-x-hidden">
      {/* Background SVG - fixed aspect, full viewport width, no cropping */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 min-[1400px]:-translate-y-[150px] z-0 pointer-events-none">
        <div className="relative w-screen aspect-[1920/1172]">
          {/* Mask that crops from the TOP after 1400px while preserving bottom integrity */}
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

      {/* Navigation - Matching the layout exactly */}
      <nav className="relative z-50 px-6 lg:px-16 py-6">
        <div className="max-w-[1400px] mx-auto relative flex items-center justify-between">
          {/* Logo with Brain.svg */}
          <div className="flex items-center space-x-2">
            <Image src="/Brain.svg" alt="Logo" width={24} height={24} />
            <span className="text-xl font-semibold text-black">
              HireWave.ai
            </span>
          </div>
          {/* Navigation Links - centered absolutely */}
          <div className="hidden md:flex items-center space-x-10 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <button className="text-black/60 hover:text-black transition-colors text-sm">
              Home
            </button>
            <button className="text-black/60 hover:text-black transition-colors text-sm">
              About
            </button>
            <button className="text-black/60 hover:text-black transition-colors text-sm">
              Pricing
            </button>
            <button className="text-black/60 hover:text-black transition-colors text-sm">
              Features
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleHRLogin}
              className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-6 py-2.5 text-sm font-normal"
            >
              Sign in
            </Button>
            {/* Mobile hamburger */}
            <button
              aria-label="Open navigation menu"
              onClick={() => setNavOpen((v) => !v)}
              className="md:hidden w-10 h-10 rounded-lg border border-black/10 bg-white/80 hover:bg-white transition-colors flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black">
                <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* Mobile dropdown */}
          {navOpen && (
            <div className="md:hidden absolute right-6 top-[64px] bg-white text-black rounded-xl shadow-xl border border-black/10 w-44 py-2">
              {['Home', 'About', 'Pricing', 'Features'].map((label) => (
                <button
                  key={label}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-black/5"
                  onClick={() => setNavOpen(false)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

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
          {/* Full-width vector curve behind heading */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-[calc(100%-180px)] top-[clamp(300px,23vw,440px)] pb-20 w-screen opacity-40 z-[1] hidden sm:block">
            <Image
              src="/Vector 1.svg"
              alt=""
              width={1920}
              height={160}
              className="w-screen h-auto"
            />
          </div>
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
                  AI-POWERED HIRING PLATFORM
                </span>
              </motion.div>

              {/* Main Heading with decorative elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                {/* V1 text */}
                <div className="relative">
                  {/* Image positioned on top */}
                  <Image
                    src="/Ellipse 1.svg"
                    alt=""
                    width={350}
                    height={160}
                    className="hidden lg:absolute left-0 top-0 -translate-x-[-55%] -translate-y-[2%] z-50 pointer-events-none"
                  />

                  {/* Left-aligned text */}
                  <h1 className="relative text-left text-[32px] md:text-[56px] lg:text-[72px] font-light leading-[1.07] tracking-tight text-black">
                    INTERVIEW
                    <span className="ml-2 font-medium inline-flex items-baseline relative overflow-visible">
                      10K+
                    </span>
                    <br />
                    CANDIDATES AT ONCE
                  </h1>
                </div>

            {/* <Button
              onClick={handleCandidateDemo}
              size="lg"
              variant="outline"
              className="group border-2 border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white px-8 py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <Target className="w-5 h-5 mr-2" />
              I'm an Applicant
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button> */}
          </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 pt-8"
              >
                <Button
                  onClick={handleHRLogin}
                  className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2"
                >
                  <span>Start as HR Manager</span>
                  <Image src="/Forward.svg" alt="" width={16} height={16} className="opacity-90" />
                </Button>

                <Button
                  onClick={handleCandidateDemo}
                  variant="outline"
                  className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2"
                >
                  <span>I'm an Applicant</span>
                  <Image src="/Double Right.svg" alt="" width={18} height={18} className="opacity-90" />
                </Button>
              </motion.div>

              {/* Stats Row - Bottom Left */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-8 pt-8"
              >
                {/* Trusted by Clients */}
                <div className="hidden md:flex flex-col gap-2 mt-20">
                  <p className="text-[10px] text-black/40 uppercase tracking-wider pt-20 max-[1600px]:pt-4">Trusted by Clients</p>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white"
                        />
                      ))}
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-normal text-black">20+</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Robot Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden md:flex justify-center items-center lg:justify-end min-h-[280px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[520px]"
            >
              <div className="absolute right-0 bottom-110">
                <Image
                  src="/image16.png"
                  alt="AI Robot"
                  width={500}
                  height={1500}
                  className="w-[260px] sm:w-[320px] md:w-[420px] lg:w-auto h-auto z-[100] lg:scale-105 mb-9 max-[1600px]:mb-20"
                  priority
                />

                {/* 85% Floating Card positioned similar to layout */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute top-[36%] right-2 lg:top-[30%] lg:-right-2 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/10 z-20"
                >
                  <div className="text-[44px] leading-none font-light text-black mb-1">85<span className="text-2xl align-top">%</span></div>
                  <div className="text-[12px] text-black/60 font-light">More Efficient</div>
                </motion.div>

                {/* Revolutionary Text + Icon Floating Overlay (right side) */}
                <div className="hidden lg:flex items-start gap-3 absolute top-[calc(58%_+_120px)] left-[calc(1%_-_240px)] z-[70] pointer-events-none max-[1600px]:top-[calc(58%_+_100px)]">
                  <div className="flex items-center justify-center">
                    <Image src="/Icon.svg" alt="" width={70} height={70} className="opacity-80" />
                  </div>
                  <p className="max-w-[280px] text-[12px] text-black/70 leading-snug">
                    Revolutionary AI screening that eliminates bias, saves 85% of time, and ensures every candidate gets a fair chance to showcase their true potential.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Video Section - Dark Background */}
      <section className="relative bg-[#0F0F0F] py-24 z-10 overflow-hidden max-[1024px]:pt-0">
        {/* Decorative Vector on the left (top of section) */}
        <div className="hidden pointer-events-none lg:absolute -left-8  max-[1600px]:translate-x-[-20%] -top-25 mt-1 md:block">
          <Image src="/Vector 3.svg" alt="" width={900} height={400} className="w-[55vw] max-w-[900px] h-auto z-[100]" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Video Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden relative group cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <p className="text-gray-500 text-xs uppercase tracking-[0.35em]">LIVE NOW</p>
                <h2 className="text-[36px] md:text-[56px] lg:text-[72px] xl:text-[80px] font-light text-white leading-[1.05] uppercase">
                  <span className="whitespace-nowrap">DEMO VIDEO OF</span>
                  <br />
                  <span className="whitespace-nowrap">OUR APPLICATION</span>
                </h2>
              </div>

              <div className="flex flex-wrap gap-10">
                {['Digital', 'Reality', 'Next'].map((t) => (
                  <div key={t} className="px-4 py-1.5 rounded-full border border-white/30">
                    <span className="text-sm text-white/90">{t}</span>
                  </div>
                ))}
              </div>

              <p className="text-gray-400 leading-relaxed max-w-md">
                Step into the Digital Frontier, where the boundaries between reality and virtual innovation disappear.
                This is the next era of immersive technology.
              </p>

              <div className="flex items-center gap-10 pt-4">
                <Button
                  variant="outline"
                  className="border border-white/20 bg-white/10 hover:bg-white/15 text-white rounded-[14px] px-6 py-3"
                >
                  10x Faster
                </Button>
                <button className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                  <span className="inline-flex items-center justify-center">
                    <Image src="/slow_motion_video.svg" alt="" width={20} height={20} />
                  </span>
                  <span className="text-sm">Watch a Video</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Few Insights Section */}
      <section className="relative bg-[#0F0F0F] py-24 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 flex justify-between items-center"
          >
            <h2 className="text-[48px] lg:text-[72px] font-light text-white uppercase tracking-tight">FEW INSIGHTS</h2>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Card 1 */}
            <motion.div
              variants={fadeInUp}
              className="relative group"
            >
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-12 md:p-14 min-h-[360px] flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
                  <Image src="/Video Playlist.svg" alt="Video Playlist" width={44} height={44} className="invert brightness-0" />
                </div>
                <div className="text-4xl md:text-5xl font-light text-white mb-3">50M+</div>
                <div className="text-gray-400">Interviews Completed</div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={fadeInUp}
              className="relative group"
            >
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-12 md:p-14 min-h-[360px] flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
                  <Image src="/Management.svg" alt="Management" width={44} height={44} className="invert brightness-0" />
                </div>
                <div className="text-4xl md:text-5xl font-light text-white mb-3">500+</div>
                <div className="text-gray-400">Enterprise Clients</div>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={fadeInUp}
              className="relative group"
            >
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-12 md:p-14 min-h-[360px] flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
                  <Image src="/Clock.svg" alt="Clock" width={44} height={44} className="invert brightness-0" />
                </div>
                <div className="text-4xl md:text-5xl font-light text-white mb-3">3hrs</div>
                <div className="text-gray-400">Avg. Time to Hire</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Next-Gen Hiring Technology Section */}
      <section className="relative bg-[#0F0F0F] py-24 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-light text-white mb-4">
              NEXT-GEN HIRING TECHNOLOGY
            </h2>
            <p className="text-gray-500 text-sm uppercase tracking-wider">
              POWERED BY ADVANCED AI TO TRANSFORM HOW COMPANIES HIRE
              <br />
              AND HOW CANDIDATES SHOWCASE THEIR TALENT
            </p>
          </motion.div>

          <div className="grid gap-10 lg:grid-cols-[220px_1fr_420px] items-start max-[1024px]:items-center">
            {/* Left: Vertical slider list */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="space-y-6 max-[1024px]:flex max-[1024px]:flex-col max-[1024px]:items-center max-[1024px]:justify-center">
                {NG_FEATURES.map((f, i) => (
                  <button
                    key={f.key}
                    onClick={() => setNgIndex(i)}
                    className={`group flex items-center max-[1024px]:justify-center max-[1024px]:text-center transition-colors duration-200 ${i === ngIndex
                        ? 'text-white'
                        : 'text-white/60 hover:text-white/80'
                      }`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${i === ngIndex ? 'bg-white' : 'bg-white/40'
                        } mr-3`}
                    />
                    <span className="text-base md:text-lg tracking-wide">{f.left}</span>
                  </button>
                ))}
              </div>
            </motion.div>




            {/* Center: Image / media area */}
            <motion.div
              key={ngIndex}
              initial={{ opacity: 0.6 }}
              whileInView={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="w-full rounded-[28px] bg-[#D0D0D0] h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px] xl:h-[520px]" />
            </motion.div>

            {/* Right: Transparent text, aligned to bottom */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-end max-[1024px]:justify-center min-h-[260px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[440px] xl:min-h-[520px]"
            >
              <motion.div
                key={ngIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="max-[1024px]:text-center"
              >
                <h3 className="text-2xl lg:text-3xl font-light text-white leading-snug">
                  {NG_FEATURES[ngIndex].title}
                </h3>
                <p className="mt-4 text-gray-400 leading-relaxed max-w-md mx-auto max-[1024px]:max-w-full">
                  {NG_FEATURES[ngIndex].description}
                </p>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative bg-[#0F0F0F] py-24 border-t border-white/10 overflow-visible">
        {/* Decorative vectors */}
        <div className="pointer-events-none inset-x-0 bottom-[100px] z-0 absolute h-[400px]">
          <Image
            src="/Vector 4.svg"
            alt="Decorative curve"
            fill
            className="object-cover w-full"
            priority
          />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left: Large heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="hidden lg:block"
            >
              <h2 className="text-[96px] leading-[0.95] font-light text-white tracking-tight">
                LOVED BY HR
                <br />
                TEAMS
                <br />
                WORLDWIDE
              </h2>
              <div className="pointer-events-none absolute ml-20 -left-1400 mt-4 z-100">
                <Image src="/Vector 3.svg" alt="Vector" width={220} height={180} />
              </div>
            </motion.div>

            {/* Right: Testimonial cards */}
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="w-full max-w-[860px] justify-self-end space-y-8"
            >
              {[
                {
                  name: 'James Rizaki',
                  content:
                    'Reduced our screening time by 85% while improving quality of hires.',
                },
                {
                  name: 'Samantha Leonardo',
                  content:
                    'Finally, a solution that lets candidates showcase their true potential.',
                },
                {
                  name: 'Mark Trevor',
                  content:
                    "The AI insights are incredibly accurate. It's like having 10 expert recruiters.",
                },
              ].map((t, idx) => (
                <motion.div key={idx} variants={fadeInUp} className="relative">
                  <div className="absolute inset-0 rounded-[24px] bg-[radial-gradient(100%_100%_at_0%_0%,rgba(255,255,255,0.08),rgba(255,255,255,0)_60%)]" />
                  <div className="relative rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 md:p-8 flex items-center justify-between gap-8">
                    <div className="max-w-[600px]">
                      <p className="text-gray-300 leading-relaxed">“{t.content}”</p>
                      <div className="mt-4 text-white font-medium">{t.name}</div>
                    </div>
                    <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#D9D9D9]" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[#0F0F0F] py-24 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-12 lg:p-20 relative overflow-hidden"
          >
            {/* Light, subtle vignette for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.04),transparent_60%)]" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl lg:text-5xl font-light text-black leading-tight">
                  READY TO
                  <br />
                  TRANSFORM
                  <br />
                  YOUR HIRING?
                </h2>

                <p className="text-gray-700 text-lg leading-relaxed max-w-md">
                  Join 500+ companies already using AI to build better teams faster.
                  Get started today and experience the future of recruitment.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleHRLogin}
                    className="bg-black text-white hover:bg-black/90 rounded-[14px] px-8 py-6 text-base font-medium"
                  >
                    Get Started
                  </Button>

                  <Button
                    variant="outline"
                    className="border border-black/20 bg-transparent hover:bg-black/5 text-black rounded-[14px] px-8 py-6 text-base font-medium"
                  >
                    Schedule Demo
                  </Button>
                </div>
              </div>

              <div className="relative aspect-video bg-black/5 rounded-2xl border border-black/10 flex items-center justify-center">
                <svg className="w-16 h-16 text-black/30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#0F0F0F] py-12 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <Image src="/Brain.svg" alt="HireWave Logo" width={20} height={20} className="invert" />
              <span className="text-lg font-semibold text-white">HireWave.ai</span>
            </div>

            <div className="flex items-center gap-6 text-gray-500 text-sm">
              <span>© 2025 HireWave. All rights reserved.</span>
              <button className="hover:text-white transition-colors">Privacy</button>
              <button className="hover:text-white transition-colors">Terms</button>
              <button className="hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}