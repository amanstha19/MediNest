import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--glass-border)',
      padding: '48px 24px 24px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* Brand */}
          <div>
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-primary)'
            }}>
              <span style={{ fontSize: '1.6rem' }}>💊</span>
              <span style={{
                background: 'var(--gradient-primary)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                MEDINEST
              </span>
            </h3>
            <p style={{ 
              opacity: 0.8, 
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              Your trusted online pharmacy for medicines, healthcare products, and emergency services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: 700, 
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Home', path: '/' },
                { label: 'Medicines', path: '/category/medicines' },
                { label: 'Ambulance', path: '/ambulance' },
                { label: 'Cart', path: '/cart' },
              ].map((link) => (
                <li key={link.path} style={{ marginBottom: '8px' }}>
                  <Link 
                    to={link.path}
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'color 0.2s'
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: 700, 
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}>
              Services
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Online Medicine Ordering',
                'Lab Test Booking',
                'Ambulance Service',
                'Health Consultation',
              ].map((service) => (
                <li key={service} style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: 700, 
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}>
              Contact
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  📍 Kathmandu, Nepal
                </span>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  📞 +977-01-XXXXXXX
                </span>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  ✉️ support@medinest.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--glass-border)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.85rem',
            margin: 0
          }}>
            © {currentYear} MEDINEST. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Privacy Policy', 'Terms of Service', 'Help'].map((item) => (
              <motion.span
                key={item}
                whileHover={{ scale: 1.05 }}
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

