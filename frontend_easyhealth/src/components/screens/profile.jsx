import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../ui/card';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const authTokens = sessionStorage.getItem('authTokens');
      if (!authTokens) {
        setError('No token available. Please log in.');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const parsedTokens = JSON.parse(authTokens);
        const response = await axios.get('http://localhost:8000/api/user/profile/', {
          headers: {
            'Authorization': `Bearer ${parsedTokens.access}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        setError('Error fetching profile: ' + err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="eh-center" style={{ padding: '60px 20px' }}>
        <div className="eh-loader" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)' }}>
        <div className="eh-alert eh-alert--error">{error}</div>
      </div>
    );
  }

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      {user ? (
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 'var(--eh-spacing-xl)' }}>👤 {user.username}'s Profile</h1>

          {/* User Info */}
          <Card style={{ marginBottom: 'var(--eh-spacing-xl)' }}>
            <CardContent>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-primary)' }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-lg)' }}>
                <div>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Email</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>{user.email}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Username</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>{user.username}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>First Name</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>{user.first_name || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Last Name</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>{user.last_name || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Section */}
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-primary)' }}>📦 Order History</h2>
            {user.orders && user.orders.length > 0 ? (
              <div style={{ display: 'grid', gap: 'var(--eh-spacing-lg)' }}>
                {user.orders.map((order) => (
                  <Card key={order.order_id}>
                    <CardContent>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--eh-spacing-lg)', paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Order #{order.order_id}</h3>
                          <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem' }}>📍 {order.address}</p>
                        </div>
                        <span style={{ background: 'var(--eh-primary)', color: 'white', padding: '4px 12px', borderRadius: 'var(--eh-radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}>
                          {order.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--eh-success)', marginBottom: 'var(--eh-spacing-md)' }}>Total: NPR {order.total_price}</p>
                      <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--eh-text-primary)' }}>Items:</h4>
                        {order.cart_items.map((item) => (
                          <div key={item.product_id} style={{ background: 'var(--eh-bg)', padding: 'var(--eh-spacing-md)', borderRadius: 'var(--eh-radius-sm)', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <div>
                                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{item.product_name}</p>
                                <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem' }}>Qty: {item.quantity}</p>
                              </div>
                              <p style={{ fontWeight: 600 }}>NPR {item.total_price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent>
                  <p style={{ textAlign: 'center', color: 'var(--eh-text-muted)' }}>No orders yet. Start shopping now!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
