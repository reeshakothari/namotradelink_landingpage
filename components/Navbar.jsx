'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';

const links = [
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/brands', label: 'Brands' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/clients', label: 'Clients' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalCount, setOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="nav" style={{ boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none' }}>
        <div className="container nav-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <Image src="/logo.png" alt="Namo Steel" width={40} height={40} style={{ objectFit: 'contain' }} />
            </div>
            <div className="logo-text">
              <span className="logo-name">NAMO STEEL</span>
              <span className="logo-tag">The Steel Hub</span>
            </div>
          </Link>

          <nav className="nav-links">
            {links.map(l => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
            <Link href="/contact" className="btn-nav">Contact Us</Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open cart"
              style={{ position: 'relative', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#fff', flexShrink: 0 }}
            >
              🛒
              {totalCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--orange)', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #1a2a4a' }}>
                  {totalCount}
                </span>
              )}
            </button>
          </nav>

          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : '' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : '' }} />
          </button>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {links.map(l => (
          <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</Link>
        ))}
        <Link href="/contact" onClick={() => setMenuOpen(false)} style={{ color: 'var(--orange)', fontWeight: 700 }}>Contact Us</Link>
      </div>
    </>
  );
}
