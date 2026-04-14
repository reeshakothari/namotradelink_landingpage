import Image from 'next/image';

const p = (seed) => `https://picsum.photos/seed/${seed}/480/280`;

const certs = [
  {
    num: '01',
    img: p('isi-certified'),
    title: 'All Products are ISI Certified',
    desc: 'Every item we supply carries the ISI mark — your guarantee of quality and safety.',
  },
  {
    num: '02',
    img: p('top-manufacturer'),
    title: 'Sourced from Top-Tier Manufacturers',
    desc: 'We partner directly with TATA, JSW, SAIL, Bhushan and other leading steel mills.',
  },
  {
    num: '03',
    img: p('quality-control'),
    title: 'Strict Quality Control',
    desc: 'Every order is verified for strength, shape, gauge and bonding before dispatch.',
  },
];

export default function Certifications() {
  return (
    <section className="certs section" id="certs">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Our Certifications &amp; Partners</span>
          <h2>Quality You Can Trust</h2>
        </div>
        <div className="certs-grid">
          {certs.map((c) => (
            <div className="cert-card" key={c.num}>
              <div className="cert-card-img">
                <Image
                  src={c.img}
                  alt={c.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  style={{ objectFit: 'cover' }}
                />
                <div className="cert-img-overlay" />
                <div className="cert-num">{c.num}</div>
              </div>
              <div className="cert-card-body">
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
