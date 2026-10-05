// ============================================================
// CAMERA SERVICE
// Manages camera stream lifecycle with mobile resilience.
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
  return typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

export const startCamera = async (
  config: CameraConfig = { facingMode: 'user' }
): Promise<MediaStream> => {
  if (!isCameraSupported()) {
    throw new Error('Camera not supported');
  }

  // 1. Primary mobile-optimized constraints
  const primaryConstraints: MediaStreamConstraints = {
    video: {
      facingMode: { ideal: config.facingMode },
      width: config.width ? { ideal: config.width } : { ideal: 1280 },
      height: config.height ? { ideal: config.height } : { ideal: 720 },
    },
    audio: false,
  };

  try {
    return await navigator.mediaDevices.getUserMedia(primaryConstraints);
  } catch (primaryErr) {
    console.warn('Primary camera constraints failed, trying facingMode fallback:', primaryErr);
    // 2. Fallback: simple facingMode
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: config.facingMode },
        audio: false,
      });
    } catch (fallbackErr) {
      console.warn('FacingMode fallback failed, trying minimal video constraints:', fallbackErr);
      // 3. Fallback: bare minimum video constraint
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }
  }
};

/**
 * Configure HTML5 video element with strict mobile WebKit autoplay attributes
 * and wait for frame metadata before resolving.
 */
export const setupVideoElement = async (
  video: HTMLVideoElement,
  stream: MediaStream
): Promise<void> => {
  video.srcObject = stream;

  // Crucial for iOS Safari & Android Chrome autoplay policy
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', 'true');
  video.setAttribute('webkit-playsinline', 'true');
  video.setAttribute('autoplay', 'true');
  video.setAttribute('muted', 'true');

  // Wait for metadata to ensure videoWidth and videoHeight are non-zero
  await new Promise<void>((resolve) => {
    if (video.readyState >= 1) {
      resolve();
    } else {
      const onMetadata = () => {
        video.removeEventListener('loadedmetadata', onMetadata);
        resolve();
      };
      video.addEventListener('loadedmetadata', onMetadata, { once: true });
      setTimeout(resolve, 1500); // Safety fallback
    }
  });

  try {
    await video.play();
  } catch (playErr) {
    console.warn('Initial video.play() failed, ensuring muted and retrying:', playErr);
    video.muted = true;
    await video.play();
  }
};

export const stopCamera = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (err) {
        console.warn('Error stopping camera track:', err);
      }
    });
  }
};

export const hasMultipleCameras = async (): Promise<boolean> => {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return false;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    return videoDevices.length > 1;
  } catch {
    return false;
  }
};
