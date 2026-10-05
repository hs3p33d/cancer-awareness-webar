import { describe, it, expect } from 'vitest';
import { generateQRDataURL, generateQRSVG } from '../utils/qr';

describe('QR Code Generation Utility', () => {
  it('should generate a valid data URL with default campaign URL', async () => {
    const dataUrl = await generateQRDataURL();
    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('should generate a valid QR code for custom URLs', async () => {
    const customUrl = 'https://custom-cancer-campaign.pages.dev';
    const dataUrl = await generateQRDataURL(customUrl, {
      width: 256,
      errorCorrectionLevel: 'H',
    });
    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('should generate a valid vector SVG string', async () => {
    const svg = await generateQRSVG('https://example.com');
    expect(svg).toBeDefined();
    expect(svg.includes('<svg') && svg.includes('</svg>')).toBe(true);
  });
});

