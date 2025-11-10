'use client';

import { use } from 'react';
import Link from 'next/link';

export default function CompletePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Interview Submitted Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for completing your interview. Your responses have been recorded and will be reviewed by our team.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What Happens Next?</h2>
          <ul className="text-left space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">1.</span>
              <span>Your responses will be analyzed by our AI system</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">2.</span>
              <span>The hiring team will review your profile and AI insights</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">3.</span>
              <span>You will receive an email with next steps within 3-5 business days</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Interview Token: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{token}</code>
          </p>
          <p className="text-sm text-gray-500">
            You can now safely close this window.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
