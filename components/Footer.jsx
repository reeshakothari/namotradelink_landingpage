import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="logo" style={{ marginBottom: 20 }}>
            <Image src="/logo.png" alt="Namo Steel" width={36} height={36} style={{ objectFit: 'contain' }} />
            <div className="logo-text">
              <span className="logo-name">NAMO STEEL</span>
              <span className="logo-tag">The Steel Hub</span>
            </div>
          </div>
          <p>Trusted dealers in construction and industrial steel products since 1995. Serving the industry with quality, reliability, and competitive pricing.</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            {[
              { href: '/about', label: 'About' },
              { href: '/products', label: 'Products' },
              { href: '/brands', label: 'Brands' },
              { href: '/case-studies', label: 'Case Studies' },
              { href: '/clients', label: 'Clients' },
              { href: '/contact', label: 'Contact' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-products">
          <h4>Products</h4>
          <ul>
            {['Flat Products', 'Tubular Products', 'Structural Steel', 'Roofing & Sheets', 'Accessories & Others'].map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p><a href="https://wa.me/919860489490" target="_blank" rel="noopener noreferrer">+91 98604 89490</a></p>
          <p><a href="mailto:namotradelink@gmail.com">namotradelink@gmail.com</a></p>
          <p>Office No. 801, Apex Business Court,<br/>Near Gangadham, Pune 411037</p>
          <p className="footer-person">Presented by: <strong>Pratik Khivsara</strong></p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© 2025 Namo Steel. All rights reserved. | Iron &amp; Steel Merchants Since 1995</p>
        </div>
      </div>
    </footer>
  );
}
