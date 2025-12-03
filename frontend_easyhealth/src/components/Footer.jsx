import React from 'react';

function Footer() {
  const links = [
    { label: 'About Us', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'FAQ', href: '#' },
  ];

  const socials = [
    { icon: '📘', label: 'Facebook', href: '#' },
    { icon: '𝕱', label: 'Twitter', href: '#' },
    { icon: '📧', label: 'Email', href: '#' },
    { icon: '📷', label: 'Instagram', href: '#' },
  ];

  return (
    <footer style={{ background: 'linear-gradient(135deg, var(--eh-primary) 0%, var(--eh-primary-dark) 100%)', color: 'white', marginTop: 'var(--eh-spacing-2xl)', padding: 'var(--eh-spacing-2xl) 0' }}>
      <div className="eh-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--eh-spacing-2xl)', marginBottom: 'var(--eh-spacing-2xl)' }}>
          {/* Brand */}
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--eh-spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💊 Easy Health
            </h3>
            <p style={{ opacity: 0.9, lineHeight: '1.6' }}>Your trusted online pharmacy and healthcare platform. We're committed to providing quality medicines and health services.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 'var(--eh-spacing-md)' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {links.map((link) => (
                <li key={link.label} style={{ marginBottom: '8px' }}>
                  <a href={link.href} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.85)'}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 'var(--eh-spacing-md)' }}>Services</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}><a href="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Buy Medicines</a></li>
              <li style={{ marginBottom: '8px' }}><a href="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Lab Tests</a></li>
              <li style={{ marginBottom: '8px' }}><a href="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Health Packages</a></li>
              <li style={{ marginBottom: '8px' }}><a href="/ambulance" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Ambulance</a></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 'var(--eh-spacing-md)' }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              {socials.map((social) => (
                <a key={social.label} href={social.href} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', textDecoration: 'none', fontSize: '1.2rem' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 'var(--eh-spacing-lg)', textAlign: 'center' }}>
          <p style={{ opacity: 0.8, marginBottom: 0 }}>
            © {new Date().getFullYear()} Easy Health. All rights reserved. | Developed for Engineering Final Year Project
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;