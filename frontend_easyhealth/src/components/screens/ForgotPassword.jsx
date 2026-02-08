import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft } from 'lucide-react';
import './auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      addToast('Please enter a valid email address.', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        addToast('Password reset link sent to your email!', 'success');
      } else {
        setError(data.error || 'Failed to send reset link. Please try again.');
        addToast(data.error || 'Failed to send reset link.', 'error');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
                <KeyRound size={40} />
              </motion.div>
              <h1 className="auth-title">Check Your Email</h1>
              <p className="auth-subtitle">
                We've sent a password reset link to {email}
              </p>
            </div>

            <div className="auth-card-body">
              <motion.div
                className="auth-success"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <p>Please check your email and click the reset link to set a new password.</p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  The link will expire in 1 hour.
                </p>
              </motion.div>

              <div className="auth-links" style={{ marginTop: '2rem' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="lg">
                    <ArrowLeft size={18} style={{ marginRight: '8px' }} />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

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
              <KeyRound size={40} />
            </motion.div>
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">
              Enter your email and we'll send you a reset link
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
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className="eh-input"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
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
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="auth-links">
              <p className="auth-links-text">
                Remember your password?
              </p>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="glass" size="lg">
                  <ArrowLeft size={18} style={{ marginRight: '8px' }} />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
