'use client';
import { useSiteContent } from '@/lib/useSiteContent';

export default function Brands() {
  const { brands } = useSiteContent();
  return (
    <section className="brands section" id="brands">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Brands We Deal</span>
          <h2>Partnered with Industry&apos;s Best</h2>
        </div>
        <div className="brands-grid">
          {brands.map((b) => (
            <div className="brand-pill" key={b}>{b}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
