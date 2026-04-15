'use client';
import { useState } from 'react';
import { useSiteContent } from '@/lib/useSiteContent';

const tabs = [
  { id: 'flat', label: 'Flat Products' },
  { id: 'tubular', label: 'Tubular Products' },
  { id: 'structural', label: 'Structural Steel' },
  { id: 'roofing', label: 'Roofing & Sheets' },
  { id: 'accessories', label: 'Accessories & Others' },
];

export default function Products() {
  const [active, setActive] = useState('flat');
  const { products } = useSiteContent();

  return (
    <section className="products section" id="products">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{products.sectionLabel}</span>
          <h2>{products.heading}</h2>
        </div>
        <div className="product-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab-btn${active === t.id ? ' active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {(products[active] || []).map((item, i) => (
            <div className="product-card" key={i}>
              <div className="product-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.title}
                  className="product-img"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                <div className="product-img-overlay" />
              </div>
              <div className="product-card-body">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
