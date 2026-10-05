import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { generateQRCanvas, generateQRSVG } from '../../utils/qr';
import { campaign } from '../../config/campaign';
import { content } from '../../config/content';

export function QRPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState(campaign.campaignUrl);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    generateQRCanvas(canvas, url, {
      width: 512,
      margin: 4,
      errorCorrectionLevel: 'H',
    }).then(() => setGenerated(true));
  }, [url]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'cancer-awareness-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadSVG = async () => {
    try {
      const svgString = await generateQRSVG(url, {
        width: 512,
        margin: 4,
        errorCorrectionLevel: 'H',
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'cancer-awareness-qr.svg';
      link.href = blobUrl;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error('Failed to generate SVG QR:', e);
    }
  };

  return (
    <main
      className="min-h-dvh pb-12"
      style={{
        background: 'var(--bg)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="section-container pt-14 text-center max-w-xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs mb-6 hover:text-white transition-colors"
          style={{ color: 'var(--fg-muted)' }}
        >
          ← Back to Campaign Home
        </Link>

        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">{content.qrPage.title}</span>
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--fg-secondary)' }}>
          {content.qrPage.subtitle}
        </p>

        {/* PRINT INTEGRITY WARNING */}
        <div
          className="p-4 rounded-xl text-left text-xs mb-8"
          style={{
            background: 'rgba(251, 191, 36, 0.08)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          <div className="flex items-center gap-2 font-bold mb-1" style={{ color: 'var(--warning)' }}>
            <span>⚠️</span>
            <span>PRINTING WARNING</span>
          </div>
          <p className="leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
            {content.qrPage.printWarning}
          </p>
        </div>

        {/* URL Input */}
        <div className="glass-card p-5 mb-8 text-left">
          <label htmlFor="qr-url" className="text-xs font-semibold mb-2 block" style={{ color: 'var(--fg-muted)' }}>
            Target Destination URL (Where the QR code will direct phones)
          </label>
          <input
            id="qr-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3.5 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--fg)',
            }}
            placeholder="https://yourcampaign.pages.dev"
          />
        </div>

        {/* QR Canvas Render */}
        <div className="inline-block p-6 rounded-2xl mb-6 shadow-2xl" style={{ background: 'white' }}>
          <canvas
            ref={canvasRef}
            className="block mx-auto"
            style={{ maxWidth: '280px', width: '100%', height: 'auto' }}
          />
        </div>

        {/* Action Buttons */}
        {generated && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 max-w-md mx-auto">
            <button
              onClick={handleDownloadPNG}
              className="btn-primary flex-1 py-3.5 text-xs"
              id="download-qr-btn"
            >
              💾 Download High-Res PNG
            </button>
            <button
              onClick={handleDownloadSVG}
              className="btn-secondary flex-1 py-3.5 text-xs"
              id="download-svg-btn"
            >
              📐 Download Vector SVG
            </button>
          </div>
        )}

        {/* Print Size Matrix */}
        <div className="glass-card p-6 text-left mb-6">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--primary)' }}>
            Recommended Print Sizes
          </h2>
          <div className="space-y-3 text-xs" style={{ color: 'var(--fg-secondary)' }}>
            <div className="p-3 rounded-lg border border-white/5" style={{ background: 'var(--card-bg)' }}>
              <span className="font-bold text-white block mb-0.5">8 cm × 8 cm (Recommended for T-Shirts)</span>
              <span>Ideal for upper-chest placement. Easily scannable from 1 to 2 meters away by phone cameras.</span>
            </div>
            <div className="p-3 rounded-lg border border-white/5" style={{ background: 'var(--card-bg)' }}>
              <span className="font-bold text-white block mb-0.5">10 cm × 10 cm (Hoodies & Outerwear)</span>
              <span>Compensates for loose fabric folds and movement on heavy garments and back prints.</span>
            </div>
            <div className="p-3 rounded-lg border border-white/5" style={{ background: 'var(--card-bg)' }}>
              <span className="font-bold text-white block mb-0.5">5 cm × 5 cm (Tags, Cards & Badges)</span>
              <span>Suitable for flat, rigid card stock or lanyards held close to the camera.</span>
            </div>
          </div>
        </div>

        {/* Suggested T-shirt Typography */}
        <div className="glass-card p-6 text-left">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--primary)' }}>
            Suggested T-Shirt Campaign Layout
          </h2>
          <div className="p-5 rounded-xl text-center" style={{ background: 'var(--bg)', border: '1px solid var(--card-border)' }}>
            <p className="font-bold text-xs tracking-widest mb-1 text-white/70">SCAN ME</p>
            <p className="text-xl font-extrabold gradient-text mb-2">SEE YOURSELF DIFFERENTLY.</p>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
              "30 seconds could change how you think about cancer."
            </p>
          </div>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            © {campaign.year} {campaign.organizationName}
          </p>
        </footer>
      </div>
    </main>
  );
}
