'use client';

import Image from 'next/image';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
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
              TERMS OF SERVICE
            </h1>
            <p className="text-gray-300 text-lg">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8 bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-12 shadow-2xl">
            <div className="space-y-8 text-gray-200 leading-relaxed">
              <section>
                <h2 className="text-2xl font-medium text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using HireWave.ai ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">2. Description of Service</h2>
              <p className="mb-4">
                HireWave.ai provides an AI-powered interview platform that enables employers to conduct automated 
                video interviews and receive AI-generated insights about candidates. The service includes video recording, 
                AI analysis, and reporting features.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue the service at any time without notice. 
                We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">3. User Accounts and Responsibilities</h2>
              <p className="mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
              <p>
                You agree to provide accurate, current, and complete information during registration and to update 
                such information to keep it accurate, current, and complete.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">4. Acceptable Use Policy</h2>
              <p className="mb-4">
                You agree not to use the service for any unlawful purpose or in any way that could damage, disable, 
                overburden, or impair our servers or networks. Prohibited activities include but are not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Uploading or transmitting malicious code or harmful content</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Using the service to discriminate against candidates based on protected characteristics</li>
                <li>Sharing interview content without proper authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">5. Intellectual Property Rights</h2>
              <p className="mb-4">
                The service and its original content, features, and functionality are owned by HireWave.ai and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                You retain ownership of any content you submit through the service, but you grant us a license to use, 
                modify, and analyze such content for the purpose of providing our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">6. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your 
                information when you use our service. By using our service, you agree to the collection and use of 
                information in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">7. Limitation of Liability</h2>
              <p>
                In no event shall HireWave.ai be liable for any indirect, incidental, special, consequential, or punitive 
                damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">8. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the service immediately, without prior notice 
                or liability, under our sole discretion, for any reason whatsoever, including without limitation if you 
                breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-white mb-4">9. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-6 bg-white/5 rounded-lg border border-white/10">
                <p>Email: legal@hirewave.ai</p>
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