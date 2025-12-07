import { create } from 'zustand';

interface CameraState {
  stream: MediaStream | null;
  cheatingDetected: boolean;
  cheatingEvidence: Array<{
    timestamp: string;
    questionId: number;
    reason: string;
    confidence: number;
    evidenceType: string;
  }>;
  
  // Actions
  setStream: (stream: MediaStream | null) => void;
  setCheatingDetected: (detected: boolean, evidence?: {
    questionId: number;
    reason: string;
    confidence: number;
    evidenceType: string;
  }) => void;
  stopStream: () => void;
  reset: () => void;
}

// Non-persisted store for camera stream (MediaStream can't be serialized)
export const useCameraStore = create<CameraState>((set, get) => ({
  stream: null,
  cheatingDetected: false,
  cheatingEvidence: [],
  
  setStream: (stream) => set({ stream }),
  
  setCheatingDetected: (detected, evidence) => {
    const currentEvidence = get().cheatingEvidence;
    if (detected && evidence) {
      set({
        cheatingDetected: true,
        cheatingEvidence: [
          ...currentEvidence,
          {
            ...evidence,
            timestamp: new Date().toISOString(),
          }
        ]
      });
    } else {
      set({ cheatingDetected: detected });
    }
  },
  
  stopStream: () => {
    const { stream } = get();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    set({ stream: null });
  },
  
  reset: () => {
    const { stream } = get();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    set({
      stream: null,
      cheatingDetected: false,
      cheatingEvidence: [],
    });
  },
}));
