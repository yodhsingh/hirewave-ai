'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { backendClient } from '@/lib/api/backend-client';
import type { Job, Question } from '@/types';

export default function InterviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<Job | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const response = await backendClient.getInterviewQuestions(token);
        if (response.success && response.data) {
          setInterview(response.data);
        }
      } catch (err) {
        console.error('Failed to load interview:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [token]);

  if (loading || !interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const questions = interview.questions || [];
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleNext = async () => {
    if (!responses[currentQuestion.id]) {
      alert('Please provide an answer before continuing');
      return;
    }

    // Save response to backend
    try {
      await backendClient.saveInterviewResponse(
        token,
        currentQuestion.id.toString(),
        responses[currentQuestion.id],
        undefined,
        'text'
      );
    } catch (err) {
      console.error('Failed to save response:', err);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(responses).length !== questions.length) {
      alert('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const formattedResponses = questions.map(q => ({
        questionId: q.id,
        question_id: q.id,
        type: q.type,
        content: responses[q.id] || '',
        duration: 0,
        retries: 0
      }));

      const result = await backendClient.submitInterview(token, formattedResponses);
      if (result.success) {
        router.push(`/i/${token}/complete`);
      } else {
        alert('Failed to submit interview: ' + (result.error?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to submit interview:', err);
      alert('Failed to submit interview');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-6">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              {currentQuestion.type.toUpperCase()} Question
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentQuestion.questionText}
            </h2>
            {currentQuestion.description && (
              <p className="text-gray-600">{currentQuestion.description}</p>
            )}
          </div>

          {/* Response Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            {currentQuestion.type === 'code' ? (
              <textarea
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => setResponses({ ...responses, [currentQuestion.id]: e.target.value })}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your code here..."
              />
            ) : (
              <textarea
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => setResponses({ ...responses, [currentQuestion.id]: e.target.value })}
                className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your answer here..."
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !responses[currentQuestion.id]}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Interview'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!responses[currentQuestion.id]}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Questions Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Questions Overview</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
                  idx === currentIndex
                    ? 'bg-blue-600 text-white'
                    : responses[q.id]
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
