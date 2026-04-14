const brands = [
  'ROOPAM STEEL', 'TATA STEEL', 'SAIL (सेल)', 'VIZAG STEEL',
  'PUSHPA TMX 500', 'RAJURI STEEL', 'BHUSHAN POWER & STEEL',
  'SHREE OM 500 TMT', 'RAMA STEEL', 'ICON STEEL TMT REBAR',
  'APL APOLLO', 'UMA 550 TMT BARS', 'KALIKA STEEL', 'GSPL 500 TMT', 'JSW STEEL',
];

export default function Brands() {
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
