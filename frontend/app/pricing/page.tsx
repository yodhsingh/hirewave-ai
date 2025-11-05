'use client';

import React from 'react';
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
      delayChildren: 0.8,
      staggerChildren: 0.15
    }
  }
};

const pricingTiers = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 50 interviews/month',
      'Basic AI scoring',
      'Standard templates',
      'Email support',
      'Basic analytics'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'Ideal for growing companies',
    features: [
      'Up to 500 interviews/month',
      'Advanced AI scoring',
      'Custom templates',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
      'API access'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited interviews',
      'Custom AI models',
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'SLA guarantee'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

export default function PricingPage() {
  // Scroll to pricing cards if hash is present
  React.useEffect(() => {
    if (window.location.hash === '#pricing-cards') {
      setTimeout(() => {
        document.getElementById('pricing-cards')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-16 pt-12 pb-16 lg:pt-12 lg:pb-20 min-h-[500px] lg:min-h-[550px] xl:min-h-[600px]">
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
        <div className="relative z-[2] max-w-[1400px] mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="text-[10px] font-light text-black/50 uppercase tracking-[0.35em]">
              TRANSPARENT PRICING
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative mb-8"
          >
            <h1 className="text-[32px] md:text-[56px] lg:text-[72px] font-light leading-[1.07] tracking-tight text-black">
              CHOOSE THE RIGHT
              <br />
              <span className="font-medium">PLAN FOR YOU</span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <p className="text-lg text-black/70 leading-relaxed max-w-2xl mx-auto mb-8">
              Start free and scale as you grow. All plans include our core AI-powered interview platform 
              with different levels of features and support.
            </p>
            
            {/* Key Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6 text-sm"
            >
              <div className="flex items-center gap-2 text-black/60">
                <div className="w-2 h-2 rounded-full bg-black/40" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-black/60">
                <div className="w-2 h-2 rounded-full bg-black/40" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-black/60">
                <div className="w-2 h-2 rounded-full bg-black/40" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 text-black/60">
                <div className="w-2 h-2 rounded-full bg-black/40" />
                <span>24/7 support</span>
              </div>
            </motion.div>
            
            {/* CTA Button to scroll to pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-6"
            >
              <Button
                onClick={() => document.getElementById('pricing-cards')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] rounded-lg px-8 py-3 text-sm font-normal inline-flex items-center gap-2"
              >
                <span>View Pricing Plans</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section id="pricing-cards" className="relative bg-[#0F0F0F] py-24 z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-3 gap-8"
          >
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                variants={fadeInUp}
                className="relative group"
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-white text-black px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className={`relative bg-white/[0.04] backdrop-blur-xl border rounded-[28px] p-8 min-h-[600px] flex flex-col ${
                  tier.popular 
                    ? 'border-white/30 bg-white/[0.06]' 
                    : 'border-white/10'
                }`}>
                  {/* Plan Name */}
                  <div className="text-2xl font-light text-white mb-2">{tier.name}</div>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-4xl md:text-5xl font-light text-white">{tier.price}</span>
                    {tier.period && <span className="text-gray-400 text-lg">{tier.period}</span>}
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-400 mb-8">{tier.description}</p>
                  
                  {/* Features */}
                  <div className="flex-1 space-y-4 mb-8">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA Button */}
                  <Button 
                    onClick={() => window.open('https://calendly.com/22f2000946-ds/30min', '_blank')}
                    className={`w-full rounded-lg py-3 text-sm font-normal ${
                      tier.popular
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative bg-[#0F0F0F] py-24 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            className="mb-16 text-center"
          >
            <h2 className="text-[48px] lg:text-[72px] font-light text-white uppercase tracking-tight mb-4">
              Frequently Asked
            </h2>
            <p className="text-gray-400 text-lg">Common questions about our pricing and features</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated."
              },
              {
                question: "What happens if I exceed my interview limit?",
                answer: "We'll notify you when you're approaching your limit. You can upgrade your plan or purchase additional interviews as needed."
              },
              {
                question: "Do you offer custom enterprise solutions?",
                answer: "Yes, our Enterprise plan includes custom AI models, white-label solutions, and dedicated support tailored to your needs."
              },
              {
                question: "Is there a free trial available?",
                answer: "Yes, all paid plans come with a 14-day free trial. No credit card required to get started with our Starter plan."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-xl font-medium text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
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
              READY TO GET STARTED?
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              Join 500+ companies already using AI to build better teams faster. 
              Start your free trial today.
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
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}