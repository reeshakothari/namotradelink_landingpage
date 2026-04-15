'use client';
import { useSiteContent } from '@/lib/useSiteContent';

export default function ServiceExcellence() {
  const { services } = useSiteContent();
  return (
    <section className="service section" id="service">
      <div className="container service-inner">
        <div className="service-text">
          <span className="section-label">{services.sectionLabel}</span>
          <h2>{services.heading}</h2>
          <div className="service-items">
            {services.items.map((s) => (
              <div className="service-item" key={s.title}>
                <div className="service-dot" />
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="service-visual">
          <div className="service-img-placeholder">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" width="160" height="160">
              <circle cx="100" cy="100" r="90" stroke="#e87722" strokeWidth="3" strokeDasharray="8 4"/>
              <circle cx="100" cy="100" r="65" fill="#1a2a4a20"/>
              <rect x="55" y="75" width="90" height="10" rx="5" fill="#e87722" opacity="0.8"/>
              <rect x="55" y="95" width="90" height="10" rx="5" fill="#e87722" opacity="0.6"/>
              <rect x="55" y="115" width="90" height="10" rx="5" fill="#e87722" opacity="0.4"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
