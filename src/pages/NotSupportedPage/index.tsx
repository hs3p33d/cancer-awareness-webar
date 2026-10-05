import { Link } from 'react-router-dom';
import { content } from '../../config/content';
import { trackEvent } from '../../services/analytics';
import { useEffect } from 'react';

export function NotSupportedPage() {
  useEffect(() => {
    trackEvent('unsupported_browser');
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
      <div className="animate-fade-in-up max-w-sm">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
          }}>
          <span className="text-3xl" aria-hidden="true">⚠️</span>
        </div>

        <h1 className="text-2xl font-bold mb-4">
          {content.cameraPermission.unsupportedTitle}
        </h1>
        <p className="mb-8" style={{ color: 'var(--fg-secondary)' }}>
          {content.cameraPermission.unsupportedDescription}
        </p>

        <Link
          to="/awareness"
          className="btn-primary w-full block text-center mb-4"
          id="continue-awareness-btn"
        >
          {content.cameraPermission.fallbackCta}
        </Link>

        <Link
          to="/"
          className="btn-secondary w-full block text-center"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
