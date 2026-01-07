import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px' 
      }}>
        <div className="eh-loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eh-container" style={{ paddingTop: 'var(--space-2xl)' }}>
        <div style={{ 
          padding: '16px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: '#f87171',
          textAlign: 'center'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="eh-container" 
      style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {user ? (
        <div>
          {/* Profile Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px', 
            marginBottom: '32px' 
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--bg-glass)',
              border: '2px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              👤
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{user.username}</h1>
              <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>

          {/* User Info */}
          <Card style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Personal Information</h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px' 
              }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Email</p>
                  <p style={{ fontWeight: 500 }}>{user.email}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Username</p>
                  <p style={{ fontWeight: 500 }}>{user.username}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>First Name</p>
                  <p style={{ fontWeight: 500 }}>{user.first_name || 'Not set'}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Last Name</p>
                  <p style={{ fontWeight: 500 }}>{user.last_name || 'Not set'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Orders Section */}
          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Order History</h2>
            {user.orders && user.orders.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {user.orders.map((order) => (
                  <Card key={order.order_id}>
                    <div style={{ padding: '20px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'start',
                        marginBottom: '16px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid var(--glass-border)'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Order #{order.order_id}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{order.address}</p>
                        </div>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: 'var(--bg-glass)',
                          border: '1px solid var(--glass-border)'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      <p style={{ fontWeight: 700, marginBottom: '16px' }}>Total: NPR {order.total_price}</p>
                      <div>
                        <p style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-muted)' }}>Items:</p>
                        {order.cart_items.map((item) => (
                          <div key={item.product_id} style={{ 
                            background: 'var(--bg-surface)', 
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '8px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <div>
                                <p style={{ fontWeight: 500, marginBottom: '2px' }}>{item.product_name}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Qty: {item.quantity}</p>
                              </div>
                              <p style={{ fontWeight: 500 }}>NPR {item.total_price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No orders yet. Start shopping now!
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </motion.div>
  );
};

export default Profile;

