'use client';

import Image from 'next/image';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-x-hidden">
      {/* Dark gradient background instead of white SVG */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] via-[#1a1a1a] to-[#0F0F0F] z-0"></div>

      {/* Navigation */}
      <Navigation theme="dark" />

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-16 py-12 min-h-[calc(100vh-200px)]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-12 shadow-2xl">
            <h1 className="text-4xl lg:text-6xl font-light text-white mb-6 tracking-tight">
              PRIVACY POLICY
            </h1>
            <p className="text-gray-300 text-lg">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8 bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-12 shadow-2xl">
            <div className="space-y-8 text-gray-200 leading-relaxed">
              <section>
                <h2 className="text-2xl font-medium text-white mb-4">Information We Collect</h2>
              <p className="mb-4">
                At HireWave.ai, we collect information you provide directly to us, such as when you create an account, 
                participate in interviews, or contact us for support. This may include your name, email address, 
                professional information, and interview responses.
              </p>
              <p>
                We also automatically collect certain information about your device and usage of our services, 
                including IP address, browser type, operating system, and interaction data to improve our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to provide, maintain, and improve our AI-powered interview platform. 
                This includes processing your interview responses, generating insights for employers, and personalizing 
                your experience.
              </p>
              <p>
                Your interview data is used to train and improve our AI models, but we ensure all personal identifiers 
                are removed or anonymized in this process.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">Information Sharing</h2>
              <p className="mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                except as described in this policy. We may share your information with employers when you participate in 
                their interview process, as this is the core function of our platform.
              </p>
              <p>
                We may also share information with service providers who assist us in operating our platform, 
                conducting business, or serving users, provided they agree to keep this information confidential.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. This includes encryption of sensitive data, secure data transmission, 
                and regular security assessments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">Your Rights</h2>
              <p className="mb-4">
                You have the right to access, update, or delete your personal information. You may also opt out of certain 
                communications from us. To exercise these rights, please contact us using the information provided below.
              </p>
              <p>
                If you are located in the European Union, you have additional rights under GDPR, including the right to 
                data portability and the right to lodge a complaint with a supervisory authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 p-6 bg-white/5 rounded-lg border border-white/10">
                <p>Email: privacy@hirewave.ai</p>
                <p>Address: 123 Innovation Drive, Tech City, TC 12345</p>
              </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}