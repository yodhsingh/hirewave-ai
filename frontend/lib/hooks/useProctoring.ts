'use client';

import { useCallback, useRef, useState } from 'react';
import { backendClient } from '@/lib/api/backend-client';

interface ProctoringResult {
  cheatingDetected: boolean;
  confidence: number;
  reason: string;
  evidenceType: string;
}

interface UseProctoringOptions {
  token: string;
  onCheatingDetected?: (result: ProctoringResult) => void;
  captureInterval?: number; // ms between captures, default 1000ms
  captureCount?: number; // number of images to capture, default 5
}

export function useProctoring(options: UseProctoringOptions) {
  const { token, onCheatingDetected, captureInterval = 1000, captureCount = 5 } = options;
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [lastResult, setLastResult] = useState<ProctoringResult | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cheatingFlagRef = useRef(false); // Track if cheating was already detected

  // Initialize video stream
  const initializeStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize camera for proctoring:', error);
      return false;
    }
  }, []);

  // Capture a single frame as base64
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get base64 without the data URL prefix (backend will handle it)
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Capture multiple frames and analyze
  const captureAndAnalyze = useCallback(async (questionId: number) => {
    // Skip if cheating was already detected (optimization)
    if (cheatingFlagRef.current) {
      return { skipped: true, reason: 'Cheating already detected - skipping further proctoring' };
    }
    
    setIsCapturing(true);
    const images: string[] = [];
    
    try {
      // Capture frames at intervals
      for (let i = 0; i < captureCount; i++) {
        const frame = captureFrame();
        if (frame) {
          images.push(frame);
        }
        
        // Wait for next capture (except for the last one)
        if (i < captureCount - 1) {
          await new Promise(resolve => setTimeout(resolve, captureInterval));
        }
      }
      
      if (images.length === 0) {
        console.warn('No frames captured for proctoring');
        return { error: 'No frames captured' };
      }
      
      // Send to backend for analysis
      const response = await backendClient.analyzeProctoring(token, images, questionId);
      
      if (response.success && response.data) {
        const result: ProctoringResult = {
          cheatingDetected: response.data.cheating_detected,
          confidence: response.data.confidence,
          reason: response.data.reason,
          evidenceType: response.data.evidence_type,
        };
        
        setLastResult(result);
        
        if (result.cheatingDetected) {
          setCheatingDetected(true);
          cheatingFlagRef.current = true; // Stop future proctoring
          onCheatingDetected?.(result);
        }
        
        return result;
      }
      
      return { error: response.error?.message || 'Analysis failed' };
    } catch (error) {
      console.error('Proctoring analysis error:', error);
      return { error: 'Failed to analyze proctoring images' };
    } finally {
      setIsCapturing(false);
    }
  }, [token, captureCount, captureInterval, captureFrame, onCheatingDetected]);

  // Set video element ref
  const setVideoElement = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
  }, []);

  // Set canvas element ref
  const setCanvasElement = useCallback((element: HTMLCanvasElement | null) => {
    canvasRef.current = element;
  }, []);

  // Cleanup stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Use existing stream (from setup page)
  const useExistingStream = useCallback((stream: MediaStream) => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, []);

  return {
    // State
    isCapturing,
    cheatingDetected,
    lastResult,
    
    // Actions
    initializeStream,
    captureAndAnalyze,
    stopStream,
    useExistingStream,
    
    // Refs
    setVideoElement,
    setCanvasElement,
    videoRef,
    canvasRef,
  };
}
