import Image from 'next/image';

const p = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const services = [
  { title: 'Fast & On-Time Delivery', desc: 'We understand project timelines. Our logistics ensure your material arrives exactly when you need it.' },
  { title: 'High Accuracy in Order Fulfillment', desc: 'Precise quantities, correct grades, and verified dimensions on every single order.' },
  { title: 'Technical Support & Customized Solutions', desc: 'Our experts help you choose the right product and can supply made-to-order specifications.' },
];

export default function ServiceExcellence() {
  return (
    <section className="service section" id="service">
      <div className="container service-inner">
        <div className="service-text">
          <span className="section-label">Service Excellence</span>
          <h2>Delivering Beyond Expectations</h2>
          <div className="service-items">
            {services.map((s) => (
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
          <div className="service-img-grid">
            <div className="service-img-main">
              <Image
                src={p('steel-warehouse', 600, 440)}
                alt="Steel warehouse"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                style={{ objectFit: 'cover', borderRadius: '16px' }}
              />
            </div>
            <div className="service-img-small-grid">
              <div className="service-img-small">
                <Image
                  src={p('steel-pipes', 280, 200)}
                  alt="Steel pipes"
                  fill
                  sizes="140px"
                  style={{ objectFit: 'cover', borderRadius: '12px' }}
                />
              </div>
              <div className="service-img-small">
                <Image
                  src={p('steel-beams', 280, 200)}
                  alt="Steel beams"
                  fill
                  sizes="140px"
                  style={{ objectFit: 'cover', borderRadius: '12px' }}
                />
              </div>
              <div className="service-img-small">
                <Image
                  src={p('metal-work', 280, 200)}
                  alt="Metal work"
                  fill
                  sizes="140px"
                  style={{ objectFit: 'cover', borderRadius: '12px' }}
                />
              </div>
              <div className="service-img-small service-img-stat">
                <div className="service-stat-box">
                  <span className="service-stat-num">30+</span>
                  <span className="service-stat-label">Years of Trust</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
