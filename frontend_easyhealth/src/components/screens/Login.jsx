import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';
import './auth.css';

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
    <div className="eh-container">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="auth-card">
          <div className="auth-card-header">
            <motion.div
              className="auth-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              💊
            </motion.div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to your MEDINEST account
            </p>
          </div>
          
          <div className="auth-card-body">
            {error && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
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
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="auth-links">
              <p className="auth-links-text">
                Do not have an account?
              </p>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <Button variant="glass" size="lg">
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

