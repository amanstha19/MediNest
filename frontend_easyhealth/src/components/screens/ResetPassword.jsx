import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { API_URL } from '../../api/config';
import './auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}/verify-reset-token/${token}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setIsValidToken(true);
        } else {
          setError(data.error || 'Invalid or expired reset link.');
          addToast(data.error || 'Invalid or expired reset link.', 'error');
        }
      } catch (err) {
        setError('Failed to verify reset link. Please try again.');
        addToast('Failed to verify reset link.', 'error');
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setError('No reset token provided.');
    }
  }, [token, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      addToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      addToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        addToast('Password reset successful! Please login with your new password.', 'success');
      } else {
        setError(data.error || 'Failed to reset password. Please try again.');
        addToast(data.error || 'Failed to reset password.', 'error');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
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
                <Lock size={40} />
              </motion.div>
              <h1 className="auth-title">Verifying...</h1>
              <p className="auth-subtitle">
                Please wait while we verify your reset link
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

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
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <CheckCircle size={40} />
              </motion.div>
              <h1 className="auth-title">Password Reset!</h1>
              <p className="auth-subtitle">
                Your password has been reset successfully
              </p>
            </div>

            <div className="auth-card-body">
              <motion.div
                className="auth-success"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <p>You can now login with your new password.</p>
              </motion.div>

              <div className="auth-links" style={{ marginTop: '2rem' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!isValidToken) {
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
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
              >
                <Lock size={40} />
              </motion.div>
              <h1 className="auth-title">Invalid Link</h1>
              <p className="auth-subtitle">
                This password reset link is invalid or has expired
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

              <div className="auth-links" style={{ marginTop: '2rem' }}>
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg">
                    Request New Link
                  </Button>
                </Link>
                <Link to="/login" style={{ textDecoration: 'none', marginTop: '1rem' }}>
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
              <Lock size={40} />
            </motion.div>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">
              Enter your new password below
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
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  className="eh-input"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>

              <div className="eh-form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  className="eh-input"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
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
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>

            <div className="auth-links">
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

export default ResetPassword;
