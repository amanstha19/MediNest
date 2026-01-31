import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import Button from './ui/button';
import './layout.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/category/medicines', label: 'Medicines' },
    { path: '/ambulance', label: 'Emergency' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <motion.span
            className="navbar-logo-icon"
            whileHover={{ scale: 1.05 }}
          >
        
          </motion.span>
          <span className="navbar-logo-text">MEDINEST</span>

          

        </Link>

        {/* Hamburger Menu Button */}
        <button 
          className={`navbar-hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Desktop Navigation */}
        <div className={`navbar-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="navbar-link"
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="navbar-actions">
          {/* Cart */}
          <Link to="/cart" className="navbar-cart" onClick={closeMobileMenu}>
            <Button variant="primary">
              <ShoppingCart size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Cart
            </Button>
          </Link>

          {/* User Section */}
          {user ? (
            <div className="navbar-user">
              <span className="navbar-user-name">{user?.username}</span>
              <motion.button
                className="navbar-logout-btn"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" onClick={closeMobileMenu}>
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup" onClick={closeMobileMenu}>
                <Button variant="primary">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
