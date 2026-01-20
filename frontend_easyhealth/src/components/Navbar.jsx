import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { motion } from 'framer-motion';
import Button from './ui/button';
import './layout.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
        <Link to="/" className="navbar-logo">
          <motion.span
            className="navbar-logo-icon"
            whileHover={{ scale: 1.05 }}
          >
        
          </motion.span>
          <span className="navbar-logo-text">MEDINEST</span>

          

        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="navbar-link"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="navbar-actions">
          {/* Cart */}
          <Link to="/cart" className="navbar-cart">
            <Button variant="primary">🛒 Cart</Button>
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
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
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
