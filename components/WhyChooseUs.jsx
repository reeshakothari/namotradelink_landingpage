import Image from 'next/image';

const p = (seed) => `https://picsum.photos/seed/${seed}/480/260`;

const reasons = [
  { img: p('industry-exp'), title: '30+ Years of Industry Experience', desc: 'Three decades of deep expertise in construction and industrial steel supply.' },
  { img: p('isi-cert'), title: 'ISI-Certified, High-Strength Products', desc: 'Every product we supply carries ISI certification with assured strength.' },
  { img: p('manufacturer'), title: 'Strong Manufacturer Partnerships', desc: 'Direct tie-ups with TATA, JSW, SAIL, APL Apollo and 15+ top brands.' },
  { img: p('delivery-truck'), title: 'Fast, On-Time Delivery', desc: 'Our logistics network ensures your steel reaches the site exactly on schedule.' },
  { img: p('pricing-steel'), title: 'Competitive Pricing', desc: 'Best market rates backed by bulk procurement and manufacturer partnerships.' },
  { img: p('product-range'), title: 'Wide Product Range Under One Roof', desc: 'From TMT bars to roofing sheets — everything your project needs, one place.' },
];

export default function WhyChooseUs() {
  return (
    <section className="why section" id="why">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Why Choose Us?</span>
          <h2>Reasons to Partner with Namo Tradelink</h2>
        </div>
        <div className="why-grid">
          {reasons.map((r) => (
            <div className="why-card" key={r.title}>
              <div className="why-card-img">
                <Image
                  src={r.img}
                  alt={r.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 360px"
                  className="why-img"
                  style={{ objectFit: 'cover' }}
                />
                <div className="why-img-overlay" />
              </div>
              <div className="why-card-body">
                <h4>{r.title}</h4>
                <p>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
