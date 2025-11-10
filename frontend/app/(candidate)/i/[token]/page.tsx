'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { backendClient } from '@/lib/api/backend-client';
import type { Job } from '@/types';

export default function InterviewLandingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interview, setInterview] = useState<Job | null>(null);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const response = await backendClient.getInterviewQuestions(token);
        if (response.success && response.data) {
          setInterview(response.data);
        } else {
          setError(response.error?.message || 'Failed to load interview');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load interview');
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your interview...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Interview Link</h1>
          <p className="text-gray-600 mb-6">{error || 'This interview link is not valid or has expired.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Interview
            </h1>
            <p className="text-lg text-gray-600">
              {interview.title} at {interview.company || 'HireWave.AI'}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What to Expect:</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>{interview.questions?.length || 0} questions to answer</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Mix of text, video, and code questions</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Estimated time: {Math.ceil((interview.questions?.length || 0) * 5)} minutes</span>
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description:</h2>
            <p className="text-gray-700 whitespace-pre-line">{interview.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/i/${token}/setup`)}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Interview
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Make sure you have a stable internet connection and are in a quiet environment.
          </p>
        </div>
      </div>
    </div>
  );
}
