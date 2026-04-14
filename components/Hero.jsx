import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-overlay" />
      <div className="container hero-content">
        <span className="since-badge">SINCE 1995</span>
        <h1 className="hero-title">
          Steel Solutions for
          <span className="highlight">Solid Foundations.</span>
        </h1>
        <p className="hero-sub">Crafting the Backbone of Industry.</p>
        <div className="hero-contact">
          <a href="tel:+919860489490" className="btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/>
            </svg>
            +91 98604 89490
          </a>
          <Link href="#products" className="btn-outline">Explore Products →</Link>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">30+</span>
            <span className="stat-label">Years Experience</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">15+</span>
            <span className="stat-label">Brands</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">ISI</span>
            <span className="stat-label">Certified Products</span>
          </div>
        </div>
      </div>
    </section>
  );
}
