'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const LogoIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
    <rect width="40" height="40" rx="6" fill="#1a2a4a"/>
    <path d="M8 28 L14 14 L20 24 L26 14 L32 28" stroke="#e87722" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
    <circle cx="20" cy="30" r="3" fill="#e87722"/>
    <path d="M15 10 L25 10 M20 6 L20 14" stroke="#e87722" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const links = [
  { href: '#about', label: 'About' },
  { href: '#products', label: 'Products' },
  { href: '#brands', label: 'Brands' },
  { href: '#case-studies', label: 'Case Studies' },
  { href: '#clients', label: 'Clients' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="nav" style={{ boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none' }}>
        <div className="container nav-inner">
          <Link href="#home" className="logo">
            <div className="logo-icon"><LogoIcon /></div>
            <div className="logo-text">
              <span className="logo-name">NAMO TRADELINK</span>
              <span className="logo-tag">The Steel Hub</span>
            </div>
          </Link>

          <nav className="nav-links">
            {links.map(l => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
            <Link href="#contact" className="btn-nav">Contact Us</Link>
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
        <Link href="#contact" onClick={() => setMenuOpen(false)} style={{ color: 'var(--orange)', fontWeight: 700 }}>Contact Us</Link>
      </div>
    </>
  );
}
