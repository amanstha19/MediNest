import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

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
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <Card>
          <CardContent>
            <div style={{ marginBottom: 'var(--eh-spacing-2xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--eh-spacing-md)' }}>💊</div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Create Account</h1>
              <p style={{ color: 'var(--eh-text-muted)' }}>Join Easy Health today</p>
            </div>

            {generalError && (
              <div className="eh-alert eh-alert--error" style={{ marginBottom: 'var(--eh-spacing-lg)' }}>
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-md)' }}>
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
                {emailError && <div className="eh-form-group" style={{ color: 'var(--eh-accent)', fontSize: '0.85rem', marginTop: '4px' }}>{emailError}</div>}
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
                {passwordError && <div className="eh-form-group" style={{ color: 'var(--eh-accent)', fontSize: '0.85rem', marginTop: '4px' }}>{passwordError}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-md)' }}>
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
                className="eh-btn--block"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div style={{ marginTop: 'var(--eh-spacing-lg)', textAlign: 'center', paddingTop: 'var(--eh-spacing-lg)', borderTop: '1px solid var(--eh-border)' }}>
              <p style={{ color: 'var(--eh-text-muted)', marginBottom: '8px' }}>Already have an account?</p>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" className="eh-btn--block">
                  Sign In Instead
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
