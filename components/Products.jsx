'use client';
import { useState } from 'react';
import Image from 'next/image';

const tabs = [
  { id: 'flat', label: 'Flat Products' },
  { id: 'tubular', label: 'Tubular Products' },
  { id: 'structural', label: 'Structural Steel' },
  { id: 'roofing', label: 'Roofing & Sheets' },
  { id: 'accessories', label: 'Accessories & Others' },
];

const p = (seed) => `https://picsum.photos/seed/${seed}/480/280`;

const products = {
  flat: [
    { img: p('steel-plate'), title: 'M.S-HRC Plate', desc: 'Hot rolled coil plates for heavy construction & fabrication.' },
    { img: p('crc-sheet'), title: 'CRC Plate', desc: 'Cold rolled plates with smooth finish and precision thickness.' },
    { img: p('metal-sheet'), title: 'Sheet', desc: 'Versatile steel sheets for industrial and structural applications.' },
    { img: p('galvanized'), title: 'GP Plate', desc: 'Galvanized plates offering superior corrosion resistance.' },
  ],
  tubular: [
    { img: p('ms-pipe'), title: 'M.S Pipes', desc: 'Mild steel pipes for structural and industrial piping needs.' },
    { img: p('gp-pipe'), title: 'GP Pipes', desc: 'Galvanized pipes for plumbing, fencing, and construction.' },
    { img: p('crc-pipe'), title: 'CRC Pipes', desc: 'Cold rolled pipes with smooth finish for precision use cases.' },
  ],
  structural: [
    { img: p('steel-angle'), title: 'Angles (Z, T, Equal)', desc: 'Structural angles for framing, brackets & support structures.' },
    { img: p('steel-flat'), title: 'Flats', desc: 'Steel flats for fabrication, gates, grills & industrial uses.' },
    { img: p('steel-beam'), title: 'Beams', desc: 'I-beams & H-beams for load-bearing structural applications.' },
    { img: p('channel-bar'), title: 'Channels', desc: 'C-channels and U-channels for structural frameworks.' },
    { img: p('tmt-bars'), title: 'TMT Bars', desc: 'ISI-certified TMT bars for RCC construction & reinforcement.' },
    { img: p('steel-coil'), title: 'CRC Coils', desc: 'Cold rolled coils for manufacturing and automotive parts.' },
  ],
  roofing: [
    { img: p('polycarbonate'), title: 'Polycarbonate Sheets', desc: 'Transparent & UV-resistant sheets for skylights & roofing.' },
    { img: p('corrugated-roof'), title: 'GI Corrugated & Perforated Sheets', desc: 'Durable galvanized sheets for industrial roofing applications.' },
    { img: p('colour-roof'), title: 'Colour Coated Sheets', desc: 'Pre-painted sheets available in multiple colours and profiles.' },
    { img: p('deck-sheet'), title: 'Deck Sheets', desc: 'Structural deck sheets for composite flooring systems.' },
  ],
  accessories: [
    { img: p('weld-mesh'), title: 'Weld Mesh & Chain Link', desc: 'For fencing, partitions and reinforcement mesh applications.' },
    { img: p('screws-bolts'), title: 'Self Tapping Screws', desc: 'High-quality screws for sheet metal and roofing fastening.' },
    { img: p('binding-wire'), title: 'Binding Wire', desc: 'Annealed wire for tying reinforcement bars in construction.' },
    { img: p('cement-roof'), title: 'Cement Sheet', desc: 'Fibre cement sheets for roofing & wall cladding applications.' },
    { img: p('plate-cutting'), title: 'Plate Cutting', desc: 'Custom plasma/gas cutting service to exact dimensions.' },
    { img: p('foundation-bolt'), title: 'Foundation Bolts', desc: 'Anchor bolts for machinery and structural foundation use.' },
  ],
};

export default function Products() {
  const [active, setActive] = useState('flat');

  return (
    <section className="products section" id="products">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Our Product Range</span>
          <h2>Steel Solutions for Every Need</h2>
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
          {products[active].map((item) => (
            <div className="product-card" key={item.title}>
              <div className="product-img-wrap">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 280px"
                  className="product-img"
                  style={{ objectFit: 'cover' }}
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
