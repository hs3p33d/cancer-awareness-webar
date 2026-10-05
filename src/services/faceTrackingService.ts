// ============================================================
// FACE TRACKING SERVICE — MediaPipe Face Landmarker
// Client-side face detection & landmark extraction.
// ============================================================

import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';

let faceLandmarker: FaceLandmarker | null = null;
let isLoading = false;

export interface FaceTrackingResult {
  detected: boolean;
  faceCount: number;
  landmarks: FaceLandmarkerResult | null;
}

export const initFaceTracking = async (): Promise<void> => {
  if (faceLandmarker || isLoading) return;
  isLoading = true;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 2,
      minFaceDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  } catch (error) {
    console.error('Failed to initialize face tracking:', error);
    // Fallback to CPU
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numFaces: 2,
        minFaceDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    } catch (cpuError) {
      console.error('Failed to initialize face tracking (CPU fallback):', cpuError);
      throw cpuError;
    }
  } finally {
    isLoading = false;
  }
};

export const detectFaces = (
  video: HTMLVideoElement,
  timestamp: number
): FaceTrackingResult => {
  if (!faceLandmarker) {
    return { detected: false, faceCount: 0, landmarks: null };
  }

  try {
    const results = faceLandmarker.detectForVideo(video, timestamp);
    const faceCount = results.faceLandmarks?.length ?? 0;

    return {
      detected: faceCount > 0,
      faceCount,
      landmarks: results,
    };
  } catch {
    return { detected: false, faceCount: 0, landmarks: null };
  }
};

export const disposeFaceTracking = (): void => {
  if (faceLandmarker) {
    faceLandmarker.close();
    faceLandmarker = null;
  }
};

export const isFaceTrackingReady = (): boolean => !!faceLandmarker;
export const isFaceTrackingLoading = (): boolean => isLoading;
