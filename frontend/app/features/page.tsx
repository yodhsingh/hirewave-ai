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

const features = [
  {
    icon: '/Video Playlist.svg',
    title: 'AI-Powered Video Screening',
    description: 'Advanced AI analyzes responses, body language, and communication skills automatically to provide comprehensive candidate assessments.',
    benefits: ['Automated analysis', 'Bias reduction', 'Consistent evaluation']
  },
  {
    icon: '/Management.svg',
    title: 'Smart Scoring Algorithm',
    description: 'Our scoring models rank candidates based on competency matrices, role fit, and consistency—removing guesswork from shortlisting.',
    benefits: ['Data-driven decisions', 'Objective ranking', 'Custom criteria']
  },
  {
    icon: '/Brain.svg',
    title: 'Zero-Bias Hiring',
    description: 'Fairness-first evaluations reduce unconscious bias with structured prompts, anonymized reviews, and calibration across interviewers.',
    benefits: ['Fair evaluation', 'Structured process', 'Diverse hiring']
  },
  {
    icon: '/Clock.svg',
    title: 'Async Interviews',
    description: 'Candidates can complete interviews on their own schedule while you review responses when convenient for your team.',
    benefits: ['Flexible scheduling', 'Global reach', 'Time zone friendly']
  },
  {
    icon: '/window.svg',
    title: 'Real-time Analytics',
    description: 'Get instant insights into your hiring pipeline with detailed analytics and reporting on candidate performance and team efficiency.',
    benefits: ['Live dashboards', 'Performance metrics', 'Team insights']
  },
  {
    icon: '/file.svg',
    title: 'Custom Templates',
    description: 'Create tailored interview templates for different roles with our intuitive builder and extensive question library.',
    benefits: ['Role-specific questions', 'Easy customization', 'Template library']
  }
];

export default function FeaturesPage() {
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
                  POWERFUL FEATURES
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
                  NEXT-GENERATION
                  <br />
                  <span className="font-medium">AI HIRING</span>
                  <br />
                  PLATFORM
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
                  Discover the comprehensive suite of AI-powered tools designed to transform your hiring process. 
                  From intelligent screening to bias-free evaluation, every feature is built to help you find the best talent faster.
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
                  alt="AI Features"
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

      {/* Features Grid Section */}
      <section className="relative bg-[#0F0F0F] py-24 z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-[48px] lg:text-[72px] font-light text-white uppercase tracking-tight">
              Core Features
            </h2>
            <p className="text-gray-400 text-lg mt-4">
              Everything you need to revolutionize your hiring process
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative group"
              >
                <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[28px] p-8 min-h-[400px] flex flex-col">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Image src={feature.icon} alt={feature.title} width={32} height={32} className="invert brightness-0" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-light text-white mb-4">{feature.title}</h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 leading-relaxed mb-6 flex-1">{feature.description}</p>
                  
                  {/* Benefits */}
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        <span className="text-sm text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative bg-[#0F0F0F] py-24 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              className="space-y-8"
            >
              <h2 className="text-4xl lg:text-5xl font-light text-white leading-tight">
                Why Choose
                <br />
                HireWave.ai?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl text-white mb-2">Save 85% of Screening Time</h3>
                    <p className="text-gray-400">Automate initial screening and focus on the most promising candidates.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl text-white mb-2">Eliminate Unconscious Bias</h3>
                    <p className="text-gray-400">AI-powered evaluation ensures fair assessment for every candidate.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl text-white mb-2">Scale Globally</h3>
                    <p className="text-gray-400">Interview candidates across time zones with async video interviews.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-light text-white mb-2">AI</div>
                <div className="text-gray-400 text-sm">Powered Platform</div>
              </div>
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-light text-white mb-2">24/7</div>
                <div className="text-gray-400 text-sm">Available</div>
              </div>
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-light text-white mb-2">Zero</div>
                <div className="text-gray-400 text-sm">Bias Hiring</div>
              </div>
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-light text-white mb-2">∞</div>
                <div className="text-gray-400 text-sm">Scalability</div>
              </div>
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
            viewport={{ once: false, amount: 0.3 }}
            className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-12 lg:p-20 text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-light text-black leading-tight mb-6">
              EXPERIENCE THE FUTURE
              <br />
              OF HIRING TODAY
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              See how our AI-powered features can transform your hiring process. 
              Start your free trial and discover the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.open('https://calendly.com/22f2000946-ds/30min', '_blank')}
                className="bg-black text-white hover:bg-gray-800 rounded-lg px-8 py-3 text-sm font-normal"
              >
                Start Free Trial
              </Button>
              <Button 
                onClick={() => window.open('https://calendly.com/22f2000946-ds/30min', '_blank')}
                variant="outline" 
                className="border border-black/20 bg-transparent hover:bg-black/5 text-black rounded-lg px-8 py-3 text-sm font-normal"
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}