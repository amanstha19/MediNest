import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="hero-2027"
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <Card>
          <div style={{ 
            background: 'var(--gradient-surface)',
            padding: '32px 24px',
            textAlign: 'center'
          }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              style={{ fontSize: '3rem', marginBottom: '16px' }}
            >
              💊
            </motion.div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: 800 }}>
              Welcome Back
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Sign in to your MEDINEST account
            </p>
          </div>
          
          <div style={{ padding: '32px 24px' }}>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ 
                  marginBottom: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  textAlign: 'center'
                }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="eh-form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  className="eh-input"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                />
              </div>

              <div className="eh-form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="eh-input"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div style={{ 
              marginTop: '24px', 
              textAlign: 'center', 
              paddingTop: '24px',
              borderTop: '1px solid var(--glass-border)'
            }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                Do not have an account?
              </p>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <Button variant="glass" size="lg" style={{ width: '100%' }}>
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;

