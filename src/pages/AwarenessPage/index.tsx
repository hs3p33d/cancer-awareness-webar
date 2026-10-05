import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { content, type ContentCard, type SymptomCard } from '../../config/content';
import { campaign } from '../../config/campaign';
import { downloadImage, canNativeShare, nativeShare, copyToClipboard, shareWithImage } from '../../utils/image';
import { trackEvent } from '../../services/analytics';

interface AwarenessPageProps {
  capturedImage: string | null;
}

// ── Expandable Risk Factor Card ────────────────────────────
function AwarenessCard({ card }: { card: ContentCard }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass-card p-5 cursor-pointer transition-all duration-300 hover:border-[rgba(255,255,255,0.18)]"
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded(!expanded);
        }
      }}
      aria-expanded={expanded}
      id={`card-${card.id}`}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">{card.icon}</span>
        <div className="flex-1">
          <h3 className="font-bold text-base mb-1">{card.title}</h3>
          <p className="text-sm" style={{ color: 'var(--fg-secondary)' }}>{card.description}</p>
          {expanded && card.details && (
            <p className="text-sm mt-3 pt-3 border-t animate-fade-in leading-relaxed"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--fg-muted)' }}>
              {card.details}
            </p>
          )}
        </div>
        <span
          className="text-xs transition-transform duration-300 flex-shrink-0 mt-1"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--fg-muted)' }}
          aria-hidden="true"
        >
          ▼
        </span>
      </div>
    </div>
  );
}

// ── Prevention Card ────────────────────────────────────────
function PreventionCard({ card }: { card: ContentCard }) {
  return (
    <div className="glass-card p-5 text-center flex flex-col items-center justify-start" id={`prevention-${card.id}`}>
      <span className="text-3xl mb-3 block" aria-hidden="true">{card.icon}</span>
      <h3 className="font-bold text-xs sm:text-sm mb-2 tracking-wider uppercase">{card.title}</h3>
      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>{card.description}</p>
    </div>
  );
}

// ── Symptom Card ───────────────────────────────────────────
function SymptomCardComponent({ card }: { card: SymptomCard }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <span className="text-xl flex-shrink-0" aria-hidden="true">{card.icon}</span>
      <div>
        <h4 className="font-semibold text-sm mb-1">{card.title}</h4>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{card.description}</p>
      </div>
    </div>
  );
}

// ── Section Divider ────────────────────────────────────────
function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-12 px-6 max-w-xl mx-auto" aria-hidden="true">
      <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
      <span style={{ color: 'var(--primary)' }}>🎗️</span>
      <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
    </div>
  );
}

export function AwarenessPage({ capturedImage }: AwarenessPageProps) {
  const navigate = useNavigate();
  const [commitments, setCommitments] = useState<Set<string>>(new Set());
  const [showCommitResult, setShowCommitResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Intersection Observer for scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const setSectionRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
  }, []);

  const sectionClass = (id: string) =>
    `transition-all duration-700 ${
      visibleSections.has(id)
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
    }`;

  // Toggle commitment
  const toggleCommitment = (option: string) => {
    setCommitments((prev) => {
      const next = new Set(prev);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      return next;
    });
  };

  const handleCommit = () => {
    setShowCommitResult(true);
    trackEvent('commitment_selected', { count: commitments.size });
  };

  // Share actions
  const handleShare = async () => {
    const shared = await nativeShare(
      campaign.name,
      content.sharing.shareText,
      campaign.campaignUrl
    );
    if (shared) trackEvent('photo_shared');
  };

  const handleShareImage = async () => {
    if (capturedImage) {
      const shared = await shareWithImage(
        capturedImage,
        campaign.name,
        content.sharing.shareText
      );
      if (shared) trackEvent('photo_shared');
    }
  };

  const handleDownload = () => {
    if (capturedImage) {
      downloadImage(capturedImage);
      trackEvent('photo_saved');
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(campaign.campaignUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent('link_copied');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    trackEvent('awareness_started');
  }, []);

  return (
    <main
      className="min-h-dvh pb-16"
      style={{
        background: 'var(--bg)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ── 1. Hero Banner ─────────────────────────────────── */}
      <section
        id="section-hero"
        ref={setSectionRef('section-hero')}
        className={`section-container pt-14 pb-6 text-center ${sectionClass('section-hero')}`}
      >
        <div className="mb-6 animate-breathe" aria-hidden="true">
          <span className="text-4xl">🎗️</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ whiteSpace: 'pre-line' }}>
          <span className="gradient-text">{content.awareness.title}</span>
        </h1>
        <p className="text-sm sm:text-base leading-relaxed max-w-md mx-auto" style={{ color: 'var(--fg-secondary)' }}>
          {content.awareness.description}
        </p>

        {/* Important simulation limitation statement */}
        <div
          className="mt-6 p-4 rounded-xl text-left text-xs leading-relaxed max-w-lg mx-auto"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)' }}
        >
          <div className="flex items-center gap-2 mb-1.5 font-semibold" style={{ color: 'var(--warning)' }}>
            <span>ℹ️</span>
            <span>Awareness Simulation Note</span>
          </div>
          <p style={{ color: 'var(--fg-muted)' }}>
            {content.effectIntro.limitationNote}
          </p>
        </div>
      </section>

      {/* ── 2. Captured Image (if coming from camera) ──────── */}
      {capturedImage && (
        <section className="section-container pt-0 pb-4">
          <div className="glass-card overflow-hidden max-w-md mx-auto">
            <img
              src={capturedImage}
              alt="Your cancer awareness simulation snapshot"
              className="w-full aspect-video object-cover"
            />
            <div className="p-4 flex gap-2 flex-wrap">
              <button onClick={handleShareImage} className="btn-secondary text-xs flex-1 py-3">
                📤 {content.sharing.share}
              </button>
              <button onClick={handleDownload} className="btn-secondary text-xs flex-1 py-3">
                💾 {content.sharing.save}
              </button>
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ── 3. Risk Factors ─────────────────────────────────── */}
      <section
        id="section-awareness"
        ref={setSectionRef('section-awareness')}
        className={`section-container py-6 ${sectionClass('section-awareness')}`}
        aria-labelledby="awareness-heading"
      >
        <h2
          id="awareness-heading"
          className="text-xs font-bold mb-6 text-center tracking-widest uppercase"
          style={{ color: 'var(--primary)' }}
        >
          RISK FACTORS
        </h2>
        <div className="space-y-3">
          {content.awareness.cards.map((card) => (
            <AwarenessCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ── 4. Prevention / What You Can Do ─────────────────── */}
      <section
        id="section-prevention"
        ref={setSectionRef('section-prevention')}
        className={`section-container py-6 ${sectionClass('section-prevention')}`}
        aria-labelledby="prevention-heading"
      >
        <h2 id="prevention-heading" className="text-2xl sm:text-3xl font-bold mb-3 text-center">
          <span className="gradient-text">{content.prevention.title}</span>
        </h2>
        <p className="text-center text-sm mb-8 max-w-md mx-auto" style={{ color: 'var(--fg-secondary)' }}>
          {content.prevention.description}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {content.prevention.cards.map((card) => (
            <PreventionCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ── 5. Symptoms / What Not to Ignore ────────────────── */}
      <section
        id="section-symptoms"
        ref={setSectionRef('section-symptoms')}
        className={`section-container py-6 ${sectionClass('section-symptoms')}`}
        aria-labelledby="symptoms-heading"
      >
        <h2 id="symptoms-heading" className="text-2xl sm:text-3xl font-bold mb-3 text-center">
          <span className="gradient-text">{content.symptoms.title}</span>
        </h2>
        <p className="text-center text-xs sm:text-sm mb-8 leading-relaxed max-w-md mx-auto" style={{ color: 'var(--fg-secondary)' }}>
          {content.symptoms.description}
        </p>
        <div className="space-y-2.5">
          {content.symptoms.cards.map((card) => (
            <SymptomCardComponent key={card.id} card={card} />
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ── 6. Personal Commitment ──────────────────────────── */}
      <section
        id="section-commitment"
        ref={setSectionRef('section-commitment')}
        className={`section-container py-6 ${sectionClass('section-commitment')}`}
        aria-labelledby="commitment-heading"
      >
        {!showCommitResult ? (
          <>
            <h2 id="commitment-heading" className="text-2xl sm:text-3xl font-bold mb-2 text-center">
              <span className="gradient-text">{content.commitment.title}</span>
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: 'var(--fg-secondary)' }}>
              {content.commitment.subtitle}
            </p>
            <div className="space-y-2 mb-8">
              {content.commitment.options.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleCommitment(option)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3`}
                  style={{
                    background: commitments.has(option) ? 'rgba(192, 132, 252, 0.12)' : 'var(--card-bg)',
                    border: `1px solid ${commitments.has(option) ? 'var(--primary)' : 'var(--card-border)'}`,
                  }}
                  aria-pressed={commitments.has(option)}
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                    style={{
                      background: commitments.has(option) ? 'var(--primary)' : 'transparent',
                      border: `2px solid ${commitments.has(option) ? 'var(--primary)' : 'var(--fg-muted)'}`,
                    }}
                  >
                    {commitments.has(option) && <span className="text-xs text-white">✓</span>}
                  </div>
                  <span className="text-sm font-medium">{option}</span>
                </button>
              ))}
            </div>
            {commitments.size > 0 && (
              <button
                onClick={handleCommit}
                className="btn-primary w-full py-4 text-sm animate-fade-in-up shadow-xl"
                id="commit-btn"
              >
                I CHOOSE AWARENESS
              </button>
            )}
          </>
        ) : (
          <div className="text-center animate-fade-in-up max-w-md mx-auto" id="commitment-result">
            <div className="mb-4">
              <span className="text-5xl" aria-hidden="true">🎗️</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="gradient-text">{content.commitment.resultTitle}</span>
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--fg-secondary)' }}>
              {content.commitment.resultDescription}
            </p>
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {Array.from(commitments).map((c) => (
                <span
                  key={c}
                  className="inline-block px-3.5 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(192, 132, 252, 0.15)', color: 'var(--primary-light)' }}
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <SectionDivider />

      {/* ── 7. Final Call to Action (Section 29) ────────────── */}
      <section
        id="section-final-cta"
        ref={setSectionRef('section-final-cta')}
        className={`section-container py-8 text-center ${sectionClass('section-final-cta')}`}
      >
        <div className="glass-card p-8 max-w-lg mx-auto" style={{ border: '1px solid var(--primary-dark)' }}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            <span className="gradient-text">{content.finalCta.headline}</span>
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--fg-secondary)' }}>
            {content.finalCta.message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => scrollToSection('section-awareness')}
              className="btn-primary py-3 px-6 text-xs"
            >
              📖 {content.finalCta.primaryBtn}
            </button>
            {canNativeShare() ? (
              <button onClick={handleShare} className="btn-secondary py-3 px-6 text-xs">
                📤 {content.finalCta.secondaryBtn}
              </button>
            ) : (
              <button onClick={handleCopyLink} className="btn-secondary py-3 px-6 text-xs">
                {copied ? '✓ Link Copied!' : `🔗 ${content.finalCta.secondaryBtn}`}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 8. Authoritative Medical Sources (Section 21) ──── */}
      <section className="section-container py-6" id="medical-sources">
        <div className="glass-card p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--primary)' }}>
            Authoritative Medical References & Sources
          </h3>
          <ul className="space-y-3 text-xs" style={{ color: 'var(--fg-secondary)' }}>
            {content.medicalSources.map((source, i) => (
              <li key={i} className="flex items-start justify-between gap-3 pb-2 border-b border-white/5">
                <div>
                  <span className="font-semibold text-white block">{source.title}</span>
                  <span style={{ color: 'var(--fg-muted)' }}>{source.organization}</span>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors flex-shrink-0"
                  style={{ color: 'var(--primary-light)' }}
                >
                  Visit Source ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 9. Disclaimer ──────────────────────────────────── */}
      <section className="section-container py-4">
        <div className="p-5 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            {content.disclaimer}
          </p>
        </div>
      </section>

      {/* ── 10. Footer ─────────────────────────────────────── */}
      <footer className="section-container py-8 text-center border-t" style={{ borderColor: 'var(--card-border)' }}>
        <p className="text-sm mb-3" style={{ color: 'var(--fg-muted)' }}>{content.footer.text}</p>
        <div className="flex justify-center gap-5 text-xs" style={{ color: 'var(--fg-muted)' }}>
          <Link to="/privacy" className="underline hover:text-white transition-colors">
            {content.footer.privacyLink}
          </Link>
          <a href="#medical-sources" className="underline hover:text-white transition-colors">
            {content.footer.sourcesLink}
          </a>
          <button onClick={() => navigate('/')} className="underline hover:text-white transition-colors">
            Home
          </button>
        </div>
        <p className="mt-4 text-xs" style={{ color: 'var(--fg-muted)' }}>
          © {campaign.year} {campaign.organizationName}
        </p>
      </footer>
    </main>
  );
}
