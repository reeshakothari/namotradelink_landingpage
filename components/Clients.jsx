const clients = [
  'Abhiyanta PMC Pvt Ltd', 'Matchwell Engineering Pvt Ltd',
  'Darsheel Construction', 'Mahati Industries Pvt Ltd',
  'Elements Technofabs Pvt Ltd', 'Omkar Industries',
  'Konbil Landmarks', 'Patil Automation',
  'Industrial Packers', 'Pravin Raut & Associates',
  'Innoova Construction', 'Q Point Engineering',
  'Surich Industries', 'Scon Projects',
];

export default function Clients() {
  return (
    <section className="clients section" id="clients">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Our Clients</span>
          <h2>Clients Through BNI</h2>
        </div>
        <div className="clients-grid">
          {clients.map((c) => (
            <div className="client-pill" key={c}>{c}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
