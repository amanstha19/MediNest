import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill, MapPin, Phone, Mail } from 'lucide-react';
import './layout.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-section">
            <h3 className="footer-brand">
              <span className="footer-brand-icon"><Pill size={24} /></span>
              <span className="footer-brand-text">MEDINEST</span>
            </h3>
            <p className="footer-description">
              Your trusted online pharmacy for medicines, healthcare products, and emergency services.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              {[
                { label: 'Home', path: '/' },
                { label: 'Medicines', path: '/category/medicines' },
                { label: 'Ambulance', path: '/ambulance' },
                { label: 'Cart', path: '/cart' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

         {/* Services */}
          <div className="footer-section">
            <h4 className="footer-title">Services</h4>
            <ul className="footer-links footer-services">
              {[
                'Online Medicine Ordering',
                'Lab Test Booking',
                'Ambulance Service',
                'Health Consultation',
              ].map((service) => (
                <li key={service}><span>{service}</span></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="footer-title">Contact</h4>
            <ul className="footer-contact">
              <li><span>📍 Kathmandu, Nepal</span></li>
              <li><span>📞 +977-01-XXXXXXX</span></li>
              <li><span>✉️ support@medinest.com</span></li>
            </ul>
          </div>
        </div>



        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} MEDINEST. All rights reserved.
          </p>
          <div className="footer-legal">
            {['Privacy Policy', 'Terms of Service', 'Help'].map((item) => (
              <motion.span
                key={item}
                className="footer-legal-item"
                whileHover={{ scale: 1.05 }}
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

