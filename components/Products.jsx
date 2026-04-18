'use client';
import { useState } from 'react';
import { useSiteContent } from '@/lib/useSiteContent';
import { useCart } from '@/lib/CartContext';

const tabs = [
  { id: 'flat',        label: 'Flat Products' },
  { id: 'tubular',     label: 'Tubular Products' },
  { id: 'structural',  label: 'Structural Steel' },
  { id: 'roofing',     label: 'Roofing & Sheets' },
  { id: 'accessories', label: 'Accessories & Others' },
];

export default function Products() {
  const [active, setActive] = useState('flat');
  const { products } = useSiteContent();
  const { addItem, items } = useCart();
  const [added, setAdded] = useState({});

  function handleAdd(item, tabId, i) {
    const id = `${tabId}-${i}`;
    addItem({ id, title: item.title, desc: item.desc, img: item.img, category: tabs.find(t => t.id === tabId)?.label });
    setAdded(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [id]: false })), 1500);
  }

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
          {(products[active] || []).map((item, i) => {
            const id = `${active}-${i}`;
            const inCart = items.some(c => c.id === id);
            const justAdded = added[id];
            return (
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
                  <button
                    onClick={() => handleAdd(item, active, i)}
                    style={{
                      marginTop: 12, width: '100%', padding: '9px 0',
                      borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: 13,
                      background: justAdded ? '#22c55e' : inCart ? '#1a2a4a' : '#e87722',
                      color: '#fff', transition: 'background 0.2s',
                    }}
                  >
                    {justAdded ? '✓ Added!' : inCart ? '✓ In Cart' : '+ Add to Enquiry'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
