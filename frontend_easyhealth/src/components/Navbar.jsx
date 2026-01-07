import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { useDarkMode } from '../context/DarkModeContext';
import { motion } from 'framer-motion';
import Button from './ui/button';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
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
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '0 24px',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--glass-border)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <motion.span
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-primary)'
            }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: '1.8rem' }}
            >
              💊
            </motion.span>
            <span style={{
              background: 'var(--gradient-primary)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              MEDINEST
            </span>
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              style={{ 
                textDecoration: 'none', 
                color: 'var(--text-primary)',
                padding: '8px 0',
                fontSize: '0.95rem',
                fontWeight: 500
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Dark Mode Toggle */}
          <motion.button
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </motion.button>

          {/* Cart */}
          <Link to="/cart">
            <Button variant="primary">🛒 Cart</Button>
          </Link>

          {/* User Section */}
          {user ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ 
                color: 'var(--text-primary)', 
                fontSize: '0.9rem', 
                fontWeight: 600 
              }}>
                {user?.username}
              </span>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'var(--danger)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
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

