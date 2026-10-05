// ============================================================
// CAMERA SERVICE
// Manages camera stream lifecycle.
// ============================================================

export interface CameraConfig {
  facingMode: 'user' | 'environment';
  width?: number;
  height?: number;
}

export type CameraError =
  | 'permission_denied'
  | 'not_supported'
  | 'not_found'
  | 'not_readable'
  | 'overconstrained'
  | 'unknown';

export const getCameraError = (err: unknown): CameraError => {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'permission_denied';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'not_found';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'not_readable';
      case 'OverconstrainedError':
        return 'overconstrained';
      default:
        return 'unknown';
    }
  }
  return 'unknown';
};

export const isCameraSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

export const startCamera = async (
  config: CameraConfig = { facingMode: 'user' }
): Promise<MediaStream> => {
  if (!isCameraSupported()) {
    throw new Error('Camera not supported');
  }

  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: config.facingMode,
      width: config.width ? { ideal: config.width } : { ideal: 1280 },
      height: config.height ? { ideal: config.height } : { ideal: 720 },
    },
    audio: false,
  };

  return navigator.mediaDevices.getUserMedia(constraints);
};

export const stopCamera = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
};

export const hasMultipleCameras = async (): Promise<boolean> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    return videoDevices.length > 1;
  } catch {
    return false;
  }
};
