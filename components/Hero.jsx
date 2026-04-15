'use client';
import Link from 'next/link';
import { useSiteContent } from '@/lib/useSiteContent';

export default function Hero() {
  const { hero } = useSiteContent();
  return (
    <section className="hero" id="home">
      <div className="hero-overlay" />
      <div className="container hero-content">
        <span className="since-badge">{hero.badge}</span>
        <h1 className="hero-title">
          {hero.title.split('\n').map((line, i) =>
            i === 1 ? <span key={i} className="highlight">{line}</span> : <span key={i}>{line}{'\n'}</span>
          )}
        </h1>
        <p className="hero-sub">{hero.subtitle}</p>
        <div className="hero-contact">
          <a href={`tel:${hero.phone.replace(/\s/g, '')}`} className="btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/>
            </svg>
            {hero.phone}
          </a>
          <Link href="#products" className="btn-outline">{hero.ctaText} →</Link>
        </div>
        <div className="hero-stats">
          {hero.stats.map((s, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 && <div className="stat-divider" />}
              <div className="stat">
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
