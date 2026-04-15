'use client';
import { useSiteContent } from '@/lib/useSiteContent';

const icons = [
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
];

export default function Certifications() {
  const { certifications } = useSiteContent();
  return (
    <section className="certs section" id="certs">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{certifications.sectionLabel}</span>
          <h2>{certifications.heading}</h2>
        </div>
        <div className="certs-grid">
          {certifications.items.map((c, i) => (
            <div className="cert-card" key={i}>
              <div className="cert-num">{c.num}</div>
              <div className="cert-icon">{icons[i]}</div>
              <h4>{c.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
