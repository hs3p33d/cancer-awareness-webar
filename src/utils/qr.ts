// ============================================================
// QR CODE UTILITY (High Density Level H with PNG & SVG Export)
// ============================================================

import QRCode from 'qrcode';
import { campaign } from '../config/campaign';

export interface QROptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

const defaultOptions: QROptions = {
  width: 512,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
  errorCorrectionLevel: 'H', // Highest error correction for physical fabrics
};

export const generateQRDataURL = async (
  url?: string,
  options?: QROptions
): Promise<string> => {
  const targetUrl = url || campaign.campaignUrl;
  const opts = { ...defaultOptions, ...options };

  return QRCode.toDataURL(targetUrl, {
    width: opts.width,
    margin: opts.margin,
    color: opts.color,
    errorCorrectionLevel: opts.errorCorrectionLevel,
  });
};

export const generateQRCanvas = async (
  canvas: HTMLCanvasElement,
  url?: string,
  options?: QROptions
): Promise<void> => {
  const targetUrl = url || campaign.campaignUrl;
  const opts = { ...defaultOptions, ...options };

  await QRCode.toCanvas(canvas, targetUrl, {
    width: opts.width,
    margin: opts.margin,
    color: opts.color,
    errorCorrectionLevel: opts.errorCorrectionLevel,
  });
};

export const generateQRSVG = async (
  url?: string,
  options?: QROptions
): Promise<string> => {
  const targetUrl = url || campaign.campaignUrl;
  const opts = { ...defaultOptions, ...options };

  return QRCode.toString(targetUrl, {
    type: 'svg',
    width: opts.width,
    margin: opts.margin,
    color: opts.color,
    errorCorrectionLevel: opts.errorCorrectionLevel,
  });
};
