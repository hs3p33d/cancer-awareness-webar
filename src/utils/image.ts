// ============================================================
// IMAGE UTILITY — Capture & share
// ============================================================

export const captureCanvas = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/png');
};

export const downloadImage = (dataUrl: string, filename: string = 'awareness-photo.png'): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const canNativeShare = (): boolean => {
  return !!navigator.share;
};

export const nativeShare = async (
  title: string,
  text: string,
  url: string
): Promise<boolean> => {
  if (!navigator.share) return false;

  try {
    await navigator.share({ title, text, url });
    return true;
  } catch (error) {
    // User cancelled share or share failed
    if (error instanceof Error && error.name === 'AbortError') {
      return false;
    }
    return false;
  }
};

export const shareWithImage = async (
  dataUrl: string,
  title: string,
  text: string
): Promise<boolean> => {
  if (!navigator.share || !navigator.canShare) return false;

  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'cancer-awareness.png', { type: 'image/png' });

    const shareData = { title, text, files: [file] };

    if (navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    }
  } catch {
    // Fallback handled by caller
  }
  return false;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
};
