const cases = [
  {
    num: '01',
    title: 'Industrial Packers',
    client: 'Client: Gaurav',
    project: 'Custom Skids from Chequered Plates',
    desc: 'We designed and supplied custom-made skids from chequered plates to securely transport engines. The skids were precisely engineered for a perfect fit, ensuring safe transport and reusability for up to 5 years. With a 7-year track record of supplying quality raw materials like channels & plates, we delivered a durable, returnable solution that met all requirements for accuracy, strength, and ease of handling.',
  },
  {
    num: '02',
    title: 'Omkar Industries',
    client: 'Client: Omkar Joshi (Owner)',
    project: 'Custom-Dimension CRC Sheets',
    desc: 'Omkar Industries required made-to-order CRC sheets in precise dimensions: 435 × 1250 × 1.5 mm and 353 × 1250 × 1.5 mm. They needed sheets with exact measurements, high-quality finish, scratch-free surfaces, no rust, and secure packaging. We delivered perfectly matched material meeting all quality standards. This has become a repeat order due to our consistent quality and reliability.',
  },
  {
    num: '03',
    title: 'Patil Automation Limited',
    client: '6-Year Partnership',
    project: 'Plates, Angles, Channels & CRC Sheets',
    desc: 'Referred by BNI member Shashi Ji, we began supplying plates, angles, channels, CRC sheets and more to Patil Automation Limited six years ago. Our quality and timely service have made this a lasting partnership that continues today.',
  },
  {
    num: '04',
    title: 'Convill Landmark',
    client: '₹10 Crore Project',
    project: 'PMC Bars for Entire Development',
    desc: 'Through a strong referral from BNI members Kareem Chambe and Omkar, we connected with Convill Landmark. This recommendation led to a ₹10 crore project, where we supplied PMC bars for the entire development.',
  },
  {
    num: '05',
    title: 'Doodh Techno Projects',
    client: '3-Year Partnership',
    project: 'TMT Bars & Structural Steel',
    desc: 'Referred by member Shubham, we have been supplying TMT bars and structural steel to Doodh Techno Projects for the past three years, ensuring consistent quality and timely delivery.',
  },
  {
    num: '06',
    title: 'Praveen Rawat & Associates',
    client: '3-Year Partnership',
    project: 'TMT Bars for Modern College Contractors',
    desc: 'Referred by member Sandeep Shah, we began supplying TMT bars to Praveen Rawat and Associates, contractors for Modern College, for the past three years. We also supplied materials to Innova Projects Pvt. Ltd., Sandeep Shah\'s own company.',
  },
];

export default function CaseStudies() {
  return (
    <section className="cases section" id="case-studies">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Case Studies</span>
          <h2>Real Projects, Real Results</h2>
        </div>
        <div className="cases-grid">
          {cases.map((c) => (
            <div className="case-card" key={c.num}>
              <div className="case-num">{c.num}</div>
              <h3>{c.title}</h3>
              <div className="case-meta"><span>{c.client}</span></div>
              <p className="case-project">{c.project}</p>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
