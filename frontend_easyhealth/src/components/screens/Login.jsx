import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

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
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Card>
          <CardContent>
            <div style={{ marginBottom: 'var(--eh-spacing-2xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--eh-spacing-md)' }}>💊</div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Welcome Back</h1>
              <p style={{ color: 'var(--eh-text-muted)' }}>Sign in to your Easy Health account</p>
            </div>

            {error && (
              <div className="eh-alert eh-alert--error" style={{ marginBottom: 'var(--eh-spacing-lg)' }}>
                {error}
              </div>
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
                className="eh-btn--block"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div style={{ marginTop: 'var(--eh-spacing-lg)', textAlign: 'center', paddingTop: 'var(--eh-spacing-lg)', borderTop: '1px solid var(--eh-border)' }}>
              <p style={{ color: 'var(--eh-text-muted)', marginBottom: '8px' }}>Don't have an account?</p>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" className="eh-btn--block">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
