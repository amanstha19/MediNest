import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import './auth.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const checkEmailUniqueness = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/check-email/', { email });
      if (response.data.message === 'Email is available.') {
        setEmailError('');
        return true;
      } else {
        setEmailError(response.data.error || 'This email is already registered.');
        return false;
      }
    } catch (err) {
      setEmailError(err.response?.data?.error || 'Error checking email. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setLoading(true);

    if (!await checkEmailUniqueness()) {
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must be 8+ characters with at least 1 special character (!@#$%^&*)');
      setLoading(false);
      return;
    }

    try {
      await signup({ email, password, username, firstName, lastName, city, phone });
      navigate('/login');
    } catch (err) {
      setGeneralError(err.message || 'Signup failed. Please try again.');
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
              <UserPlus size={40} />
            </motion.div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join MEDINEST today</p>
          </div>

          <div className="auth-card-body">
            {generalError && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {generalError}
              </motion.div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="signup-form-grid">
                <div className="eh-form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    className="eh-input"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="eh-form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    className="eh-input"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="eh-form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  className="eh-input"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                />
              </div>

              <div className="eh-form-group">
                <label htmlFor="email">Email</label>
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
                {emailError && <div className="eh-error">{emailError}</div>}
              </div>

              <div className="eh-form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="eh-input"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars with special character"
                  required
                  disabled={loading}
                />
                {passwordError && <div className="eh-error">{passwordError}</div>}
              </div>

              <div className="signup-form-grid">
                <div className="eh-form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    className="eh-input"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Your city"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="eh-form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    className="eh-input"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your phone"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="auth-links">
              <p className="auth-links-text">Already have an account?</p>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="secondary">
                  Sign In Instead
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;

