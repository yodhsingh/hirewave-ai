'use client';

import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const handleScheduleMeeting = () => {
    window.open('https://calendly.com/22f2000946-ds/30min', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-x-hidden">
      {/* Dark gradient background instead of white SVG */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] via-[#1a1a1a] to-[#0F0F0F] z-0"></div>

      {/* Navigation */}
      <Navigation theme="dark" />

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-16 py-12 min-h-[calc(100vh-200px)]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-12 shadow-2xl">
            <h1 className="text-4xl lg:text-6xl font-light text-white mb-6 tracking-tight">
              CONTACT US
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Ready to transform your hiring process? Schedule a personalized demo with our team to see how
              HireWave.ai can help you find the best candidates faster.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Schedule Meeting Section */}
            <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-12 shadow-2xl">
              <h2 className="text-2xl font-medium text-white mb-6">Schedule a Meeting</h2>

              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  Ready to transform your hiring process? Book a personalized demo with our team to see how HireWave.ai can help you find the best candidates faster.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <span className="text-gray-300">30-minute personalized demo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <span className="text-gray-300">Learn about AI-powered hiring</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <span className="text-gray-300">Discuss your specific needs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <span className="text-gray-300">Get started immediately</span>
                  </div>
                </div>

                <Button
                  onClick={handleScheduleMeeting}
                  className="w-full bg-white text-black hover:bg-gray-100 rounded-lg px-8 py-4 text-base font-medium"
                >
                  Schedule Meeting Now
                </Button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-medium text-white mb-6">Get in touch</h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Email</h4>
                      <p className="text-gray-400">akash@iitmbs.ac.in</p>
                      <p className="text-gray-400">akshit@iitmbs.ac.in</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Office</h4>
                      <p className="text-gray-400">Reachpark, IITM</p>
                      <p className="text-gray-400">Chennai, India</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Phone</h4>
                      <p className="text-gray-400">+91 9292929292</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-medium text-white mb-4">Business Hours</h3>
                <div className="space-y-2 text-gray-400">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}