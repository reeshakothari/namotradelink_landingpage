'use client';
import Image from 'next/image';
import Link from 'next/link';

const CATS = [
  {
    label: 'Flat Products',
    title: 'Plates, Sheets\n& Coils',
    img: '/products/ms-hrc-plate.jpeg',
    desc: 'HRC plates, CRC sheets, GP plates and coils for heavy fabrication.',
  },
  {
    label: 'Structural Steel',
    title: 'Angles, Beams\n& Channels',
    img: '/products/beams.jpeg',
    desc: 'I-beams, H-beams, angles, channels and TMT bars for load-bearing structures.',
  },
  {
    label: 'Roofing & Sheets',
    title: 'Roofing &\nCladding',
    img: '/products/colour-coated-sheets.jpeg',
    desc: 'GI corrugated, colour-coated, polycarbonate and deck sheets for all roofing needs.',
  },
];

export default function Categories() {
  return (
    <section className="cats" id="categories">
      <div className="cats-grid">
        {CATS.map((c, i) => (
          <Link href="#products" key={i} className="cat-card">
            <div className="cat-img-wrap">
              <Image
                src={c.img}
                alt={c.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="cat-img"
                style={{ objectFit: 'cover' }}
              />
              <div className="cat-overlay" />
            </div>
            <div className="cat-body">
              <span className="cat-label">{c.label}</span>
              <h3 className="cat-title">
                {c.title.split('\n').map((line, j) => (
                  <span key={j}>{line}{j === 0 && <br />}</span>
                ))}
              </h3>
              <p className="cat-desc">{c.desc}</p>
              <span className="cat-cta">Explore Range →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
