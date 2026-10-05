import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { content } from '../../config/content';
import { campaign } from '../../config/campaign';
import {
  startCamera,
  stopCamera,
  setupVideoElement,
  hasMultipleCameras,
  getCameraError,
  type CameraError,
} from '../../services/cameraService';
import {
  initFaceTracking,
  detectFaces,
  disposeFaceTracking,
  isFaceTrackingReady,
} from '../../services/faceTrackingService';
import { EffectEngine, baldEffect } from '../../features/effects';
import { captureCanvas, copyToClipboard } from '../../utils/image';
import { isInAppBrowser, getInAppBrowserName, prefersReducedMotion } from '../../utils/device';
import { trackEvent } from '../../services/analytics';

type CameraState =
  | 'permission'
  | 'loading'
  | 'active'
  | 'effect-intro'
  | 'effect-active'
  | 'capture'
  | 'error';

interface CameraExperienceProps {
  onCapture: (image: string) => void;
}

export function CameraExperience({ onCapture }: CameraExperienceProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const effectEngineRef = useRef<EffectEngine>(new EffectEngine());
  const lastTimestampRef = useRef<number>(0);
  const noFaceTimerRef = useRef<number>(0);
  const lumCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Diagnostic tracking refs
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);

  const [state, setState] = useState<CameraState>('permission');
  const [error, setError] = useState<CameraError | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [landmarkCount, setLandmarkCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [videoResolution, setVideoResolution] = useState('0x0');
  const [videoReadyState, setVideoReadyState] = useState(0);
  const [mediaPipeStatus, setMediaPipeStatus] = useState<'READY' | 'LOADING' | 'ERROR'>('LOADING');
  const [mediaPipeError, setMediaPipeError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const [isLowLight, setIsLowLight] = useState(false);
  const [hasMultiCam, setHasMultiCam] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [effectProgress, setEffectProgress] = useState(0);
  const [introStep, setIntroStep] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const isAppBrowser = isInAppBrowser();
  const appBrowserName = getInAppBrowserName();
  const reducedMotion = prefersReducedMotion();

  // Register effects
  useEffect(() => {
    const engine = effectEngineRef.current;
    engine.registerEffect(baldEffect);
    engine.setConfig({
      intensity: 1.0,
      transition: reducedMotion ? 500 : 2500,
    });
  }, [reducedMotion]);

  // Check multi-camera support
  useEffect(() => {
    hasMultipleCameras().then(setHasMultiCam);
  }, []);

  // Initialize MediaPipe model
  const loadMediaPipe = useCallback(async () => {
    if (isFaceTrackingReady()) {
      setMediaPipeStatus('READY');
      return;
    }
    setMediaPipeStatus('LOADING');
    setMediaPipeError(null);
    try {
      await initFaceTracking();
      setMediaPipeStatus('READY');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('MediaPipe initialization failed:', err);
      setMediaPipeStatus('ERROR');
      setMediaPipeError(msg);
    }
  }, []);

  // Start camera
  const handleEnableCamera = useCallback(async () => {
    setState('loading');

    try {
      // 1. Immediately request camera stream with mobile fallbacks
      const stream = await startCamera({ facingMode });
      streamRef.current = stream;

      // Video element is PERMANENTLY mounted in the DOM, so videoRef.current is never null!
      const video = videoRef.current;
      if (video) {
        await setupVideoElement(video, stream);
        setVideoResolution(`${video.videoWidth}x${video.videoHeight}`);
        setVideoReadyState(video.readyState);
      }

      setState('active');
      trackEvent('camera_started');
      trackEvent('camera_permission_granted');

      // 2. Load face tracking model asynchronously in background
      loadMediaPipe();
    } catch (err) {
      const cameraError = getCameraError(err);
      setError(cameraError);
      setState('error');
      trackEvent('camera_permission_denied');
    }
  }, [facingMode, loadMediaPipe]);

  // Ensure stream stays attached if state shifts
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (video && stream && video.srcObject !== stream && (state === 'active' || state === 'effect-active')) {
      setupVideoElement(video, stream)
        .then(() => {
          setVideoResolution(`${video.videoWidth}x${video.videoHeight}`);
          setVideoReadyState(video.readyState);
        })
        .catch((e) => console.warn('Stream re-attach warning:', e));
    }
  }, [state]);

  // Animation loop with face detection, luminance check, and effect rendering
  useEffect(() => {
    if (state !== 'active' && state !== 'effect-active') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let running = true;

    const loop = () => {
      if (!running) return;

      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          setVideoResolution(`${video.videoWidth}x${video.videoHeight}`);
        }

        setVideoReadyState(video.readyState);

        const now = performance.now();

        // Calculate real-time FPS
        frameCountRef.current++;
        if (now - lastFpsUpdateRef.current >= 1000) {
          setFps(Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current)));
          frameCountRef.current = 0;
          lastFpsUpdateRef.current = now;
        }

        // 30fps detection interval
        if (now - lastTimestampRef.current > 33) {
          lastTimestampRef.current = now;

          // Fast 16x16 video luminance check for low-light warning
          try {
            if (!lumCanvasRef.current) {
              lumCanvasRef.current = document.createElement('canvas');
              lumCanvasRef.current.width = 16;
              lumCanvasRef.current.height = 16;
            }
            const lumCtx = lumCanvasRef.current.getContext('2d');
            if (lumCtx) {
              lumCtx.drawImage(video, 0, 0, 16, 16);
              const data = lumCtx.getImageData(0, 0, 16, 16).data;
              let totalLum = 0;
              for (let i = 0; i < data.length; i += 4) {
                totalLum += (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
              }
              const avgLum = totalLum / 256;
              if (avgLum < 28) {
                if (!noFaceTimerRef.current) {
                  noFaceTimerRef.current = now;
                } else if (now - noFaceTimerRef.current > 2000) {
                  setIsLowLight(true);
                }
              } else {
                noFaceTimerRef.current = 0;
                setIsLowLight(false);
              }
            }
          } catch {
            // Ignore luminance sampling errors
          }

          if (isFaceTrackingReady()) {
            const result = detectFaces(video, now);
            setFaceDetected(result.detected);
            setFaceCount(result.faceCount);
            const numLandmarks = result.landmarks?.faceLandmarks?.[0]?.length ?? 0;
            setLandmarkCount(numLandmarks);

            // Apply effect ONLY when exactly one face is detected
            if (
              state === 'effect-active' &&
              result.landmarks &&
              result.detected &&
              result.faceCount === 1
            ) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // Draw video to canvas first before applying the bald transformation
              ctx.save();
              if (facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
              }
              ctx.drawImage(video, 0, 0);
              effectEngineRef.current.render(ctx, video, result.landmarks, now);
              ctx.restore();
            } else if (state === 'active') {
              // Canvas is clear so underlying video is shown with 0 overhead
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      running = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [state, facingMode]);

  // Start effect sequence
  const startEffect = useCallback(() => {
    setState('effect-intro');
    setIntroStep(0);
    trackEvent('effect_started');

    // 1. User sees themselves normally with intro quote
    setTimeout(() => setIntroStep(1), 500);

    // 2. Transformation smoothly fades in
    setTimeout(() => {
      effectEngineRef.current.setActiveEffect('bald');
      setState('effect-active');
      setIntroStep(2);
    }, reducedMotion ? 1200 : 3000);

    // 3. Transformation completes, pause ~1s, then awareness message appears
    setTimeout(() => {
      setIntroStep(3);
    }, reducedMotion ? 2500 : 6000);
  }, [reducedMotion]);

  // Effect progress tracking
  useEffect(() => {
    if (state !== 'effect-active') return;
    const interval = setInterval(() => {
      setEffectProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + (reducedMotion ? 0.08 : 0.025);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [state, reducedMotion]);

  // Take photo composite
  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video) return;

    // Create an offscreen composite canvas with full resolution
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = video.videoWidth || 1280;
    compositeCanvas.height = video.videoHeight || 720;
    const compCtx = compositeCanvas.getContext('2d');
    if (compCtx) {
      if (state === 'effect-active' && canvas) {
        // Effect canvas already has composite video + transformation
        compCtx.drawImage(canvas, 0, 0, compositeCanvas.width, compositeCanvas.height);
      } else {
        // Draw raw video mirrored for user camera
        compCtx.save();
        if (facingMode === 'user') {
          compCtx.translate(compositeCanvas.width, 0);
          compCtx.scale(-1, 1);
        }
        compCtx.drawImage(video, 0, 0, compositeCanvas.width, compositeCanvas.height);
        compCtx.restore();
      }
    }

    const dataUrl = captureCanvas(compositeCanvas);
    onCapture(dataUrl);
    trackEvent('photo_taken');
    setState('capture');
  }, [facingMode, state, onCapture]);

  // Switch camera
  const handleSwitchCamera = useCallback(async () => {
    stopCamera(streamRef.current);
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);

    try {
      const stream = await startCamera({ facingMode: newMode });
      streamRef.current = stream;
      if (videoRef.current) {
        await setupVideoElement(videoRef.current, stream);
      }
    } catch (err) {
      setError(getCameraError(err));
      setState('error');
    }
  }, [facingMode]);

  // Navigate to awareness
  const goToAwareness = useCallback(() => {
    trackEvent('effect_completed');
    stopCamera(streamRef.current);
    navigate('/awareness');
  }, [navigate]);

  // Copy link for in-app browser
  const handleCopyLink = async () => {
    const ok = await copyToClipboard(campaign.campaignUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Safe cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera(streamRef.current);
      disposeFaceTracking();
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Close camera and return to landing
  const handleClose = () => {
    stopCamera(streamRef.current);
    navigate('/');
  };

  const isDenied = error === 'permission_denied';

  return (
    <main
      className="relative w-full h-dvh overflow-hidden select-none bg-black"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ── PERMANENT VIDEO & CANVAS ELEMENTS (Never unmounted) ── */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        aria-hidden="true"
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          opacity: state === 'effect-active' ? 1 : 0,
        }}
      />

      {/* ── 1. PERMISSION OVERLAY ── */}
      {state === 'permission' && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center bg-black/90 backdrop-blur-md"
          style={{
            paddingTop: 'max(2rem, env(safe-area-inset-top))',
            paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          }}
        >
          <div className="animate-fade-in-up max-w-sm w-full">
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <span className="text-3xl" aria-hidden="true">📸</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-3">{content.cameraPermission.title}</h1>
            <p className="text-sm mb-3" style={{ color: 'var(--fg-secondary)' }}>
              {content.cameraPermission.description}
            </p>
            <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
              {content.cameraPermission.privacyAssurance}
            </p>

            {isAppBrowser && (
              <div
                className="glass-card p-4 mb-6 text-left"
                style={{
                  background: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                }}
              >
                <div className="flex items-center gap-2 mb-2 font-semibold text-xs" style={{ color: 'var(--warning)' }}>
                  <span>⚠️</span>
                  <span>{appBrowserName || 'In-App'} Browser Detected</span>
                </div>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
                  {content.cameraPermission.inAppNotice.message}
                </p>
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary w-full text-xs py-2"
                >
                  {copiedLink ? '✓ Copied!' : content.cameraPermission.inAppNotice.copyLinkCta}
                </button>
              </div>
            )}

            <button
              onClick={handleEnableCamera}
              className="btn-primary w-full mb-3 py-4 text-sm font-bold"
              id="enable-camera-btn"
            >
              {content.cameraPermission.cta}
            </button>

            <button
              onClick={() => navigate('/awareness')}
              className="btn-secondary w-full py-3 text-xs mb-4"
              id="skip-camera-btn"
            >
              {content.cameraPermission.continueWithoutCamera}
            </button>

            <Link
              to="/camera-test"
              className="text-[11px] text-neutral-400 hover:text-neutral-200 underline block"
            >
              🛠️ Hardware Camera Diagnostic Test (/camera-test)
            </Link>
          </div>
        </div>
      )}

      {/* ── 2. LOADING OVERLAY ── */}
      {state === 'loading' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center bg-black/80 backdrop-blur-sm">
          <div className="animate-fade-in">
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-full animate-pulse-glow flex items-center justify-center"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
              />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>
              Activating camera feed...
            </p>
          </div>
        </div>
      )}

      {/* ── 3. ERROR OVERLAY ── */}
      {state === 'error' && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center bg-black/90 backdrop-blur-md"
          style={{
            paddingTop: 'max(2rem, env(safe-area-inset-top))',
            paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          }}
        >
          <div className="animate-fade-in-up max-w-sm w-full">
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.25)',
              }}
            >
              <span className="text-3xl" aria-hidden="true">{isDenied ? '🔒' : '⚠️'}</span>
            </div>

            <h2 className="text-2xl font-bold mb-3">
              {isDenied ? content.cameraPermission.deniedTitle : 'Camera Unavailable'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--fg-secondary)' }}>
              {isDenied
                ? content.cameraPermission.deniedDescription
                : 'We could not access your camera. You can explore the cancer awareness and prevention guide directly.'}
            </p>

            {isDenied && (
              <ol
                className="text-left mb-8 space-y-2 text-xs p-4 rounded-lg"
                style={{ background: 'var(--card-bg)', color: 'var(--fg-muted)' }}
              >
                {content.cameraPermission.deniedInstructions.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold" style={{ color: 'var(--primary)' }}>{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}

            <button
              onClick={() => navigate('/awareness')}
              className="btn-primary w-full mb-3"
              id="continue-without-cam-error-btn"
            >
              {content.cameraPermission.continueWithoutCamera}
            </button>

            <Link
              to="/camera-test"
              className="btn-secondary w-full text-xs py-2 mb-2 block"
            >
              Open Camera Diagnostic Tool (/camera-test)
            </Link>

            <button onClick={handleClose} className="text-xs text-neutral-400 hover:text-white py-2">
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* ── 4. CAMERA HEADER HUD ── */}
      <header
        className="absolute top-0 left-0 right-0 z-20 px-4 pt-3 pb-2 flex items-center justify-between"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
        }}
      >
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          aria-label="Close camera"
          id="close-camera-btn"
        >
          <span className="text-white text-base">✕</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest uppercase text-white/90">
            {content.camera.title}
          </span>
          <button
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-neutral-300 font-mono transition"
            title="Toggle Debug Overlay"
          >
            {showDiagnostics ? 'Hide HUD' : 'HUD'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {(state === 'effect-active' || introStep >= 2) && (
            <div
              className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider animate-fade-in"
              style={{
                background: 'rgba(251, 191, 36, 0.2)',
                color: 'var(--warning)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                backdropFilter: 'blur(8px)',
              }}
            >
              SIMULATION
            </div>
          )}

          {hasMultiCam && (state === 'active' || state === 'effect-active') && (
            <button
              onClick={handleSwitchCamera}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
              aria-label={content.camera.switchCamera}
            >
              <span className="text-white text-sm">🔄</span>
            </button>
          )}
        </div>
      </header>

      {/* DIAGNOSTIC OVERLAY */}
      {showDiagnostics && (
        <div
          className="absolute top-16 left-4 z-30 font-mono text-[11px] p-2.5 rounded bg-black/80 border border-neutral-700 text-neutral-200 pointer-events-none space-y-0.5 shadow-xl max-w-xs"
        >
          <div className="text-emerald-400 font-bold">Camera: OK (Stream Active)</div>
          <div>Video: {videoReadyState >= 2 ? 'OK' : `ReadyState ${videoReadyState}`}</div>
          <div>Video resolution: {videoResolution}</div>
          <div>Face tracking: {faceDetected ? 'DETECTED' : 'SEARCHING'} ({faceCount} {faceCount === 1 ? 'face' : 'faces'})</div>
          <div>Landmarks: {landmarkCount}</div>
          <div>FPS: {fps}</div>
          <div className={mediaPipeStatus === 'READY' ? 'text-emerald-400' : mediaPipeStatus === 'LOADING' ? 'text-yellow-400' : 'text-rose-400'}>
            MediaPipe: {mediaPipeStatus}
          </div>
          {mediaPipeError && (
            <div className="text-[10px] text-rose-300 mt-1 leading-tight">Error: {mediaPipeError}</div>
          )}
        </div>
      )}

      {/* MEDIAPIPE STATUS BANNER */}
      {mediaPipeStatus === 'LOADING' && state === 'active' && (
        <div className="absolute top-16 left-0 right-0 z-20 flex justify-center px-4">
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-900/80 border border-neutral-700 text-neutral-300 backdrop-blur-md animate-pulse">
            ⏳ Loading Face Tracking AI...
          </div>
        </div>
      )}

      {mediaPipeStatus === 'ERROR' && state === 'active' && (
        <div className="absolute top-16 left-4 right-4 z-20 p-3 rounded bg-rose-950/90 border border-rose-600 text-rose-200 text-xs flex items-center justify-between shadow-lg">
          <div>
            <strong>AI Model Error:</strong> Face filter unavailable on this connection.
          </div>
          <button
            onClick={loadMediaPipe}
            className="px-2 py-1 rounded bg-rose-800 hover:bg-rose-700 text-[10px] font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* HUD GUIDANCE / STATUS */}
      {state === 'active' && (
        <div className="absolute top-16 left-0 right-0 z-20 flex flex-col items-center gap-2 px-4 pointer-events-none">
          {isLowLight && (
            <div
              className="px-4 py-2 rounded-full text-xs font-semibold text-center animate-fade-in shadow-lg"
              style={{
                background: 'rgba(239, 68, 68, 0.85)',
                color: '#fff',
                backdropFilter: 'blur(8px)',
              }}
            >
              {content.camera.lowLightTitle} {content.camera.lowLightSubtitle}
            </div>
          )}

          <div
            className="px-4 py-1.5 rounded-full text-xs font-medium animate-fade-in shadow-md"
            style={{
              background: 'rgba(0,0,0,0.65)',
              color:
                faceCount > 1
                  ? 'var(--warning)'
                  : faceDetected
                  ? 'var(--success)'
                  : 'var(--fg-secondary)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {faceCount > 1
              ? content.camera.multipleFaces
              : faceDetected
              ? content.camera.detected
              : content.camera.noFace}
          </div>
        </div>
      )}

      {/* EFFECT INTRO TRANSITION OVERLAY */}
      {state === 'effect-intro' && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center p-6 text-center"
          style={{ background: 'rgba(0,0,0,0.75)' }}
        >
          <div className="animate-fade-in max-w-xs">
            <span className="text-4xl mb-4 block" aria-hidden="true">🎗️</span>
            <p
              className="text-xl sm:text-2xl font-light leading-relaxed"
              style={{ color: 'var(--fg)', whiteSpace: 'pre-line' }}
            >
              {content.effectIntro.preMessage}
            </p>
          </div>
        </div>
      )}

      {/* POST-TRANSITION AWARENESS MESSAGE & ACTIONS */}
      {state === 'effect-active' && introStep >= 3 && (
        <div
          className="absolute bottom-0 left-0 right-0 z-20 p-5"
          style={{
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 80%, transparent 100%)',
          }}
        >
          <div
            className="glass-card p-5 animate-fade-in-up text-center max-w-md mx-auto"
            style={{ background: 'rgba(17, 17, 24, 0.85)', borderColor: 'rgba(255,255,255,0.12)' }}
          >
            <h2 className="text-lg font-bold mb-1">{content.effectIntro.postTitle}</h2>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--warning)' }}>
              {content.effectIntro.postSubtitle}
            </p>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
              {content.effectIntro.postMessage}
            </p>
            <p
              className="text-[11px] mb-5 leading-relaxed p-2.5 rounded text-left"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--fg-muted)' }}
            >
              {content.effectIntro.limitationNote}
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={handleCapture}
                className="btn-secondary flex-1 text-xs py-3"
                id="capture-photo-btn"
              >
                📸 {content.camera.capture}
              </button>
              <button
                onClick={goToAwareness}
                className="btn-primary flex-1 text-xs py-3"
                id="learn-more-btn"
              >
                {content.effectIntro.cta}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* START EFFECT BUTTON */}
      {state === 'active' && faceDetected && faceCount === 1 && (
        <div
          className="absolute bottom-8 left-0 right-0 z-20 flex justify-center px-6"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={startEffect}
            className="btn-primary text-sm px-8 py-4 animate-fade-in-up shadow-2xl"
            id="start-effect-btn"
          >
            Begin Awareness Experience
          </button>
        </div>
      )}

      {/* CAPTURE REVIEW SCREEN */}
      {state === 'capture' && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center"
          style={{ background: 'rgba(10, 10, 15, 0.92)' }}
        >
          <div className="animate-fade-in-up max-w-sm w-full">
            <span className="text-4xl mb-3 block" aria-hidden="true">🎗️</span>
            <h2 className="text-2xl font-bold mb-1">{content.sharing.photoTitle}</h2>
            <p className="text-base mb-6 gradient-text font-semibold">{content.sharing.photoCta}</p>

            <button
              onClick={goToAwareness}
              className="btn-primary w-full py-4 text-sm mb-3"
              id="continue-awareness-btn"
            >
              {content.effectIntro.cta}
            </button>
            <button
              onClick={() => {
                setState('effect-active');
                setIntroStep(3);
              }}
              className="btn-secondary w-full py-3 text-xs"
            >
              {content.camera.retake}
            </button>
          </div>
        </div>
      )}

      {/* EFFECT PROGRESS BAR */}
      {state === 'effect-active' && effectProgress < 1 && (
        <div
          className="absolute top-14 left-6 right-6 z-20"
          style={{ top: 'max(3.5rem, env(safe-area-inset-top))' }}
        >
          <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${effectProgress * 100}%`,
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
