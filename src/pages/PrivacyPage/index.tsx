import { Link } from 'react-router-dom';
import { content } from '../../config/content';
import { campaign } from '../../config/campaign';

export function PrivacyPage() {
  return (
    <main
      className="min-h-dvh"
      style={{
        background: 'var(--bg)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="section-container pt-14 max-w-xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs mb-8 hover:text-white transition-colors"
          style={{ color: 'var(--fg-muted)' }}
        >
          ← Back to Campaign Home
        </Link>

        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">{content.privacy.title}</span>
        </h1>
        <p className="text-xs mb-8" style={{ color: 'var(--fg-muted)' }}>
          {campaign.name} — {campaign.organizationName}
        </p>

        <div className="space-y-6">
          {content.privacy.sections.map((section, i) => (
            <section key={i} className="glass-card p-6" aria-labelledby={`privacy-${i}`}>
              <h2 id={`privacy-${i}`} className="font-bold text-base mb-2" style={{ color: 'var(--primary)' }}>
                {section.title}
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* Medical Sources */}
        <section className="mt-8 glass-card p-6" aria-labelledby="privacy-sources">
          <h2 id="privacy-sources" className="font-bold text-base mb-3" style={{ color: 'var(--primary)' }}>
            Authoritative Medical Information Sources
          </h2>
          <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--fg-secondary)' }}>
            Our educational cancer prevention and early detection guidance is aligned with recommendations from recognized public health bodies:
          </p>
          <ul className="space-y-2.5 text-xs">
            {content.medicalSources.map((source, idx) => (
              <li key={idx} className="flex justify-between items-center gap-2 border-b border-white/5 pb-2">
                <div>
                  <span className="font-medium text-white block">{source.title}</span>
                  <span style={{ color: 'var(--fg-muted)' }}>{source.organization}</span>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors flex-shrink-0"
                  style={{ color: 'var(--primary-light)' }}
                >
                  Visit ↗
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Medical Disclaimer */}
        <div
          className="mt-8 p-5 rounded-xl text-left"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}
        >
          <h3 className="font-bold text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warning)' }}>
            Medical Disclaimer & Educational Scope
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            {content.disclaimer}
          </p>
        </div>

        <footer className="mt-12 pb-10 text-center border-t border-white/5 pt-6">
          <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            © {campaign.year} {campaign.organizationName}
          </p>
        </footer>
      </div>
    </main>
  );
}
