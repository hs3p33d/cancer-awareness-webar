import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { content } from '../../config/content';
import { campaign } from '../../config/campaign';
import {
  startCamera,
  stopCamera,
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

  const [state, setState] = useState<CameraState>('permission');
  const [error, setError] = useState<CameraError | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [isLowLight, setIsLowLight] = useState(false);
  const [hasMultiCam, setHasMultiCam] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [modelLoading, setModelLoading] = useState(false);
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

  // Start camera
  const handleEnableCamera = useCallback(async () => {
    setState('loading');
    setModelLoading(true);

    try {
      // Start camera stream and load MediaPipe face tracking
      const [stream] = await Promise.all([
        startCamera({ facingMode }),
        initFaceTracking(),
      ]);

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setModelLoading(false);
      setState('active');
      trackEvent('camera_started');
      trackEvent('camera_permission_granted');
    } catch (err) {
      const cameraError = getCameraError(err);
      setError(cameraError);
      setState('error');
      setModelLoading(false);
      trackEvent('camera_permission_denied');
    }
  }, [facingMode]);

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

      if (video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw mirrored camera video for user-facing camera
        ctx.save();
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        ctx.restore();

        const now = performance.now();

        // 30fps detection interval
        if (now - lastTimestampRef.current > 33) {
          lastTimestampRef.current = now;

          // Estimate frame brightness in center of frame
          try {
            const centerX = Math.round(canvas.width / 2);
            const centerY = Math.round(canvas.height / 2);
            const sampleData = ctx.getImageData(
              Math.max(0, centerX - 25),
              Math.max(0, centerY - 25),
              50,
              50
            ).data;

            let totalLum = 0;
            for (let i = 0; i < sampleData.length; i += 4) {
              totalLum += (sampleData[i] * 299 + sampleData[i + 1] * 587 + sampleData[i + 2] * 114) / 1000;
            }
            const avgLum = totalLum / (sampleData.length / 4);

            if (avgLum < 32) {
              if (!noFaceTimerRef.current) {
                noFaceTimerRef.current = now;
              } else if (now - noFaceTimerRef.current > 2000) {
                setIsLowLight(true);
              }
            } else {
              noFaceTimerRef.current = 0;
              setIsLowLight(false);
            }
          } catch {
            // Ignore sampling errors
          }

          if (isFaceTrackingReady()) {
            const result = detectFaces(video, now);
            setFaceDetected(result.detected);
            setFaceCount(result.faceCount);

            // Apply effect ONLY when exactly one face is detected
            if (
              state === 'effect-active' &&
              result.landmarks &&
              result.detected &&
              result.faceCount === 1
            ) {
              ctx.save();
              if (facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
              }
              effectEngineRef.current.render(ctx, video, result.landmarks, now);
              ctx.restore();
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

  // Take photo
  const handleCapture = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = captureCanvas(canvas);
    onCapture(dataUrl);
    trackEvent('photo_taken');
    setState('capture');
  }, [onCapture]);

  // Switch camera
  const handleSwitchCamera = useCallback(async () => {
    stopCamera(streamRef.current);
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);

    try {
      const stream = await startCamera({ facingMode: newMode });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
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

  // ── 1. Permission Screen ──────────────────────────────────
  if (state === 'permission') {
    return (
      <main
        className="flex flex-col items-center justify-center min-h-dvh px-6 text-center"
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
          <p className="text-xs mb-8 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            {content.cameraPermission.privacyAssurance}
          </p>

          {/* In-app browser detection advice */}
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
            className="btn-primary w-full mb-3 py-4 text-sm"
            id="enable-camera-btn"
          >
            {content.cameraPermission.cta}
          </button>

          <button
            onClick={() => navigate('/awareness')}
            className="btn-secondary w-full py-3 text-xs"
            id="skip-camera-btn"
          >
            {content.cameraPermission.continueWithoutCamera}
          </button>
        </div>
      </main>
    );
  }

  // ── 2. Loading Screen ─────────────────────────────────────
  if (state === 'loading') {
    return (
      <main className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
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
            {modelLoading ? 'Preparing awareness experience...' : 'Starting camera...'}
          </p>
        </div>
      </main>
    );
  }

  // ── 3. Error / Denied Screen ──────────────────────────────
  if (state === 'error') {
    const isDenied = error === 'permission_denied';
    return (
      <main
        className="flex flex-col items-center justify-center min-h-dvh px-6 text-center"
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

          <button onClick={handleClose} className="btn-secondary w-full text-xs">
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  // ── 4. Camera HUD & Effect Experience ─────────────────────
  return (
    <main
      className="relative w-full h-dvh overflow-hidden select-none"
      style={{
        background: '#000',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Hidden local video element */}
      <video
        ref={videoRef}
        className="absolute opacity-0 pointer-events-none"
        playsInline
        muted
        autoPlay
        aria-hidden="true"
      />

      {/* Main rendering canvas with local camera frame & effect */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* TOP HEADER HUD */}
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

        <span className="text-xs font-bold tracking-widest uppercase text-white/90">
          {content.camera.title}
        </span>

        <div className="flex items-center gap-2">
          {/* Simulation tag */}
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

          {hasMultiCam && state === 'active' && (
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

      {/* HUD GUIDANCE / STATUS */}
      {state === 'active' && (
        <div className="absolute top-16 left-0 right-0 z-20 flex flex-col items-center gap-2 px-4">
          {/* Low light warning */}
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

          {/* Face count status */}
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

      {/* START EFFECT BUTTON (Enabled when exactly 1 face is aligned) */}
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
