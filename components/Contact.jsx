'use client';
import { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      e.target.reset();
    }, 4000);
  }

  return (
    <section className="contact section" id="contact">
      <div className="container contact-inner">
        <div className="contact-info">
          <span className="section-label">Get In Touch</span>
          <h2>Let&apos;s Build Something Strong Together</h2>
          <p>Reach out to us for inquiries, quotes, or customized steel solutions. We&apos;re ready to serve your project needs.</p>
          <div className="contact-items">
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/>
                </svg>
              </div>
              <div>
                <span className="contact-label">Phone</span>
                <a href="https://wa.me/919860489490" target="_blank" rel="noopener noreferrer">+91 98604 89490</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <span className="contact-label">Email</span>
                <a href="mailto:namotradelink@gmail.com">namotradelink@gmail.com</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <span className="contact-label">Office</span>
                <span>Office No. 801, Apex Business Court,<br/>Near Gangadham, Pune 411037</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-4 0v2"/>
                </svg>
              </div>
              <div>
                <span className="contact-label">Business</span>
                <span>Iron &amp; Steel Merchants</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-wrap">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3>Send Us a Message</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input type="text" id="name" name="name" placeholder="Rajesh Kumar" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" placeholder="+91 XXXXX XXXXX" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="you@company.com" />
            </div>
            <div className="form-group">
              <label htmlFor="product">Product / Requirement</label>
              <select id="product" name="product">
                <option value="">Select a product category</option>
                <option>Flat Products (HRC / CRC / GP Plates)</option>
                <option>Tubular Products (MS / GP / CRC Pipes)</option>
                <option>Structural Steel (TMT Bars / Angles / Channels / Beams)</option>
                <option>Roofing &amp; Sheets</option>
                <option>Accessories &amp; Others</option>
                <option>Custom / Plate Cutting</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={4} placeholder="Describe your requirement…" />
            </div>
            <button
              type="submit"
              className="btn-primary btn-full"
              style={submitted ? { background: '#16a34a', borderColor: '#16a34a' } : {}}
              disabled={submitted}
            >
              {submitted ? 'Message Sent! We\'ll be in touch.' : 'Send Inquiry →'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
