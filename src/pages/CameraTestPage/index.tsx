import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { startCamera, stopCamera } from '../../services/cameraService';

export function CameraTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissionStatus, setPermissionStatus] = useState<'GRANTED' | 'DENIED' | 'UNKNOWN'>('UNKNOWN');
  const [streamActive, setStreamActive] = useState<'ACTIVE' | 'INACTIVE'>('INACTIVE');
  const [readyState, setReadyState] = useState<number>(0);
  const [videoWidth, setVideoWidth] = useState<number>(0);
  const [videoHeight, setVideoHeight] = useState<number>(0);
  const [facingMode] = useState<'user' | 'environment'>('user');
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSecure = typeof window !== 'undefined' ? window.isSecureContext : false;
  const hasMediaDevices = typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 40)]);
  }, []);

  const handleStopCamera = useCallback(() => {
    if (streamRef.current) {
      stopCamera(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive('INACTIVE');
    setReadyState(0);
    setVideoWidth(0);
    setVideoHeight(0);
    addLog('Camera stopped by user');
  }, [addLog]);

  const handleStartCamera = useCallback(async () => {
    setErrorMsg(null);
    addLog('Starting camera requested...');

    if (!hasMediaDevices) {
      const err = 'navigator.mediaDevices is NOT available in this context.';
      setErrorMsg(err);
      addLog(`ERROR: ${err}`);
      return;
    }

    try {
      addLog('Requesting getUserMedia facingMode: user...');
      const stream = await startCamera({ facingMode });
      streamRef.current = stream;
      setPermissionStatus('GRANTED');
      setStreamActive('ACTIVE');
      addLog(`Stream acquired! Tracks: ${stream.getVideoTracks().length}`);

      const video = videoRef.current;
      if (video) {
        // Critical attributes for iOS Safari / Android WebKit
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.setAttribute('muted', 'true');
        video.srcObject = stream;

        addLog(`Assigned srcObject. ReadyState=${video.readyState}`);

        // Wait for loadedmetadata
        await new Promise<void>((resolve) => {
          if (video.readyState >= 1) {
            resolve();
          } else {
            const onMeta = () => {
              video.removeEventListener('loadedmetadata', onMeta);
              resolve();
            };
            video.addEventListener('loadedmetadata', onMeta, { once: true });
            setTimeout(resolve, 1500);
          }
        });

        addLog(`Metadata loaded. Res: ${video.videoWidth}x${video.videoHeight}`);
        setVideoWidth(video.videoWidth);
        setVideoHeight(video.videoHeight);
        setReadyState(video.readyState);

        addLog('Calling video.play()...');
        await video.play();
        addLog('video.play() resolved successfully!');
        setReadyState(video.readyState);
      }
    } catch (err: unknown) {
      const errString = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      setErrorMsg(errString);
      setPermissionStatus('DENIED');
      setStreamActive('INACTIVE');
      addLog(`getUserMedia FAILED: ${errString}`);
    }
  }, [hasMediaDevices, facingMode, addLog]);

  // Periodic poll of video dimensions and readyState
  useEffect(() => {
    if (streamActive !== 'ACTIVE') return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video) {
        setReadyState(video.readyState);
        setVideoWidth(video.videoWidth);
        setVideoHeight(video.videoHeight);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [streamActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCamera(streamRef.current);
      }
    };
  }, []);

  const readyStateLabel = (stateNum: number) => {
    switch (stateNum) {
      case 0: return '0 (HAVE_NOTHING)';
      case 1: return '1 (HAVE_METADATA)';
      case 2: return '2 (HAVE_CURRENT_DATA)';
      case 3: return '3 (HAVE_FUTURE_DATA)';
      case 4: return '4 (HAVE_ENOUGH_DATA)';
      default: return String(stateNum);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-6 font-mono text-sm max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div>
          <h1 className="text-lg font-bold text-emerald-400">CAMERA DIAGNOSTIC</h1>
          <p className="text-xs text-neutral-400">Isolated Hardware & Video Pipeline Test (No MediaPipe)</p>
        </div>
        <Link to="/" className="text-xs text-neutral-400 hover:text-white underline">
          Home
        </Link>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleStartCamera}
          className="flex-1 py-3 px-4 rounded bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-center transition"
        >
          [START CAMERA]
        </button>
        <button
          onClick={handleStopCamera}
          className="flex-1 py-3 px-4 rounded bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 font-bold text-center transition"
        >
          [STOP CAMERA]
        </button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3 mb-4 rounded bg-rose-950/80 border border-rose-500 text-rose-200 text-xs">
          <strong>ERROR:</strong> {errorMsg}
        </div>
      )}

      {/* Diagnostic Metrics */}
      <div className="bg-neutral-900 border border-neutral-800 rounded p-4 mb-6 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-neutral-400">isSecureContext:</span>
          <span className={isSecure ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {isSecure ? 'TRUE' : 'FALSE (Camera blocked on mobile!)'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">MediaDevices:</span>
          <span className={hasMediaDevices ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {hasMediaDevices ? 'AVAILABLE' : 'UNAVAILABLE'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Facing mode:</span>
          <span className="text-neutral-200 font-bold">USER (Front)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Permission:</span>
          <span className={
            permissionStatus === 'GRANTED' ? 'text-emerald-400 font-bold' :
            permissionStatus === 'DENIED' ? 'text-rose-400 font-bold' : 'text-yellow-400 font-bold'
          }>
            {permissionStatus}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Camera stream:</span>
          <span className={streamActive === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-neutral-500 font-bold'}>
            {streamActive}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Video readyState:</span>
          <span className="text-neutral-200">{readyStateLabel(readyState)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Video width:</span>
          <span className="text-neutral-200">{videoWidth ? `${videoWidth}px` : '...'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Video height:</span>
          <span className="text-neutral-200">{videoHeight ? `${videoHeight}px` : '...'}</span>
        </div>
      </div>

      {/* Raw Camera Preview Section */}
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-neutral-400 mb-2 font-bold">[RAW CAMERA PREVIEW]</h2>
        <div className="relative w-full aspect-[3/4] bg-neutral-900 border-2 border-dashed border-neutral-700 rounded overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {streamActive !== 'ACTIVE' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 p-4 text-center">
              <span className="text-3xl mb-2">📷</span>
              <span>Tap [START CAMERA] above to test the hardware camera feed.</span>
            </div>
          )}
        </div>
      </div>

      {/* Event Logs */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-neutral-400 mb-2 font-bold">[DIAGNOSTIC LOGS]</h2>
        <div className="bg-neutral-900 border border-neutral-800 rounded p-3 text-[11px] h-40 overflow-y-auto space-y-1 text-neutral-300">
          {logs.length === 0 ? (
            <span className="text-neutral-600">No events logged yet.</span>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="leading-tight">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
