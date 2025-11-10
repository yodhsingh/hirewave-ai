'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [deviceReady, setDeviceReady] = useState(false);

  const checkDevices = async () => {
    try {
      // Request permissions for camera/microphone
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setDeviceReady(true);
    } catch (error) {
      alert('Please allow camera and microphone access to continue');
    }
  };

  const handleContinue = () => {
    if (!consent) {
      alert('Please accept the terms to continue');
      return;
    }
    if (!deviceReady) {
      alert('Please check your devices first');
      return;
    }
    router.push(`/i/${token}/interview`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Interview Setup</h1>

          {/* Device Check */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Device Check</h2>
            <p className="text-gray-600 mb-4">
              We need access to your camera and microphone for video questions.
            </p>
            <button
              onClick={checkDevices}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                deviceReady
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={deviceReady}
            >
              {deviceReady ? '✓ Devices Ready' : 'Check Devices'}
            </button>
          </div>

          {/* Consent */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Terms & Consent</h2>
            <div className="bg-white p-4 rounded border border-gray-200 max-h-40 overflow-y-auto mb-4">
              <p className="text-sm text-gray-700">
                By proceeding, you agree that:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>Your responses will be recorded and analyzed</li>
                <li>AI will be used to evaluate your responses</li>
                <li>Your data will be handled according to our privacy policy</li>
                <li>You are completing this interview honestly</li>
              </ul>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-gray-700">I accept the terms and conditions</span>
            </label>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!consent || !deviceReady}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Continue to Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
