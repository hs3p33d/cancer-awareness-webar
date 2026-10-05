// ============================================================
// DEVICE UTILITY — Browser & feature detection
// ============================================================

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const getInAppBrowserName = (): string | null => {
  const ua = navigator.userAgent || '';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'Facebook';
  if (/musical_ly|ByteLocale|TikTok/i.test(ua)) return 'TikTok';
  if (/MicroMessenger/i.test(ua)) return 'WeChat';
  if (/Line\//i.test(ua)) return 'Line';
  if (/Twitter|X\//i.test(ua)) return 'X (Twitter)';
  if (/Snapchat/i.test(ua)) return 'Snapchat';
  return null;
};

export const isInAppBrowser = (): boolean => {
  return getInAppBrowserName() !== null;
};

export const supportsWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') || canvas.getContext('webgl2')
    );
  } catch {
    return false;
  }
};

export const supportsCamera = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

export const supportsWasm = (): boolean => {
  try {
    if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );
      return module instanceof WebAssembly.Module;
    }
  } catch {
    // not supported
  }
  return false;
};

export const supportsAR = (): boolean => {
  return supportsCamera() && supportsWebGL() && supportsWasm();
};

export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export interface DeviceCapabilities {
  mobile: boolean;
  ios: boolean;
  android: boolean;
  safari: boolean;
  inAppBrowser: boolean;
  inAppBrowserName: string | null;
  camera: boolean;
  webgl: boolean;
  wasm: boolean;
  arSupported: boolean;
  reducedMotion: boolean;
}

export const getDeviceCapabilities = (): DeviceCapabilities => ({
  mobile: isMobile(),
  ios: isIOS(),
  android: isAndroid(),
  safari: isSafari(),
  inAppBrowser: isInAppBrowser(),
  inAppBrowserName: getInAppBrowserName(),
  camera: supportsCamera(),
  webgl: supportsWebGL(),
  wasm: supportsWasm(),
  arSupported: supportsAR(),
  reducedMotion: prefersReducedMotion(),
});
