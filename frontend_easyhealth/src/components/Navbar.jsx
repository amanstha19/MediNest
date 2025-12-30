import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="eh-navbar" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="eh-container" style={{ padding: '0 var(--eh-spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span className="eh-navbar__brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.6rem' }}>
              💊 <span style={{ fontWeight: 800, letterSpacing: '0.5px' }}>Easy Health</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div style={{ display: 'flex', gap: 'var(--eh-spacing-2xl)', alignItems: 'center' }}>
            <Link to="/" className="eh-navbar__link" style={{ textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease' }}>
              Home
            </Link>
            <Link to="/category/medicines" className="eh-navbar__link" style={{ textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease' }}>
              Medicines
            </Link>
            <Link to="/ambulance" className="eh-navbar__link" style={{ textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease' }}>
              Emergency
            </Link>
          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', gap: 'var(--eh-spacing-lg)', alignItems: 'center' }}>
            <Link to="/cart" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
                fontWeight: 600
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.transform = 'translateY(0)';
              }}
              >
                🛒 Cart
              </button>
            </Link>

            {user ? (
              <div style={{ display: 'flex', gap: 'var(--eh-spacing-md)', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '0.95rem', fontWeight: 600 }}>
                  Hi, {user?.username}
                </span>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  >
                    👤 Profile
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(211, 47, 47, 0.7)',
                    border: '2px solid rgba(211, 47, 47, 0.3)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(211, 47, 47, 0.9)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(211, 47, 47, 0.7)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--eh-spacing-md)' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  >
                    Login
                  </button>
                </Link>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: 'white',
                    color: 'var(--eh-primary)',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  >
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;