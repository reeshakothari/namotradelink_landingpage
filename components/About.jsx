'use client';
import { useSiteContent } from '@/lib/useSiteContent';

export default function About() {
  const { about } = useSiteContent();
  return (
    <section className="about section" id="about">
      <div className="container about-grid">
        <div className="about-text">
          <span className="section-label">{about.sectionLabel}</span>
          <h2>{about.heading}</h2>
          <p>{about.description}</p>
          <ul className="check-list">
            {about.checklist.map((item) => (
              <li key={item}><span className="check">✔</span> {item}</li>
            ))}
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
            <p>{about.vision}</p>
          </div>
          <div className="vm-card vm-card--mission">
            <div className="vm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3>Mission</h3>
            <p>{about.mission}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
