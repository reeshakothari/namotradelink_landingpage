export default function About() {
  return (
    <section className="about section" id="about">
      <div className="container about-grid">
        <div className="about-text">
          <span className="section-label">About Our Company</span>
          <h2>Your Trusted Partner in Steel &amp; Structure.</h2>
          <p>
            We are trusted dealers in construction and industrial steel products, serving the
            industry for over 30 years. Known for quality, reliability, and competitive pricing,
            we supply ISI-certified steel with assured strength and precision. Backed by strong
            manufacturer tie-ups, we ensure timely delivery and customer satisfaction across
            every order.
          </p>
          <ul className="check-list">
            <li><span className="check">✔</span> ISI-Certified, High-Strength Products</li>
            <li><span className="check">✔</span> Wide Product Range</li>
            <li><span className="check">✔</span> 30+ Years of Industry Trust</li>
          </ul>
        </div>

        <div className="vision-mission-grid">
          <div className="vm-card">
            <div className="vm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3>Vision</h3>
            <p>To deliver superior-quality steel solutions that consistently exceed customer expectations through innovation, service excellence, and long-term partnerships.</p>
          </div>

          <div className="vm-card vm-card--mission">
            <div className="vm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3>Mission</h3>
            <p>To build lasting relationships by offering exceptional service, embracing technology, and supporting every customer&apos;s steel requirement with integrity and expertise.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
