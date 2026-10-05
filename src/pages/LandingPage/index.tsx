import { useNavigate } from 'react-router-dom';
import { content } from '../../config/content';
import { campaign } from '../../config/campaign';
import { supportsAR } from '../../utils/device';
import { useEffect, useState } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    if (supportsAR()) {
      navigate('/experience');
    } else {
      navigate('/not-supported');
    }
  };

  return (
    <main
      className="relative flex flex-col items-center justify-center min-h-dvh px-6 overflow-hidden"
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
      role="main"
      aria-label={campaign.name}
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
            opacity: 0.3,
          }}
        />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center text-center max-w-lg transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Awareness ribbon icon */}
        <div
          className="mb-8 animate-breathe"
          aria-hidden="true"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--primary-dark), var(--accent-dark))',
              boxShadow: '0 0 40px rgba(192, 132, 252, 0.3)',
            }}
          >
            <span className="text-2xl">🎗️</span>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-[1.1]"
          style={{ whiteSpace: 'pre-line' }}
        >
          <span className="gradient-text">{content.hero.title}</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl mb-10"
          style={{ color: 'var(--fg-secondary)' }}
        >
          {content.hero.subtitle}
        </p>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          className="btn-primary text-base px-10 py-4 animate-pulse-glow"
          aria-label={content.hero.cta}
          id="start-experience-btn"
        >
          {content.hero.cta}
        </button>

        {/* Privacy note */}
        <p
          className="mt-8 text-xs max-w-xs leading-relaxed"
          style={{ color: 'var(--fg-muted)' }}
        >
          {content.hero.privacyNote}
        </p>

        {/* Campaign tag */}
        <div
          className="mt-12 flex items-center gap-2 text-xs"
          style={{ color: 'var(--fg-muted)' }}
        >
          <span>🎗️</span>
          <span>{campaign.tagline}</span>
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--bg), transparent)',
        }}
        aria-hidden="true"
      />
    </main>
  );
}
