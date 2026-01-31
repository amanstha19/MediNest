import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, RefreshCw, Package, Clock, CheckCircle, MapPin } from 'lucide-react';
import './pages.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
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
      setError(null);
    } catch (err) {
      setError('Error fetching profile: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: <Clock size={14} />,
          color: '#856404',
          bg: '#fff3cd',
          label: 'Pending',
          description: 'Your order is being processed'
        };
      case 'shipped':
        return {
          icon: <Package size={14} />,
          color: '#004085',
          bg: '#cce5ff',
          label: 'Shipped',
          description: 'Your order is on its way'
        };
      case 'delivered':
        return {
          icon: <CheckCircle size={14} />,
          color: '#155724',
          bg: '#d4edda',
          label: 'Delivered',
          description: 'Your order has been delivered'
        };
      default:
        return {
          icon: <Package size={14} />,
          color: '#333',
          bg: '#f8f9fa',
          label: status,
          description: 'Order status unknown'
        };
    }
  };

  const getStatusProgress = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 33;
      case 'shipped': return 66;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="eh-container" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <div className="eh-loader"></div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="eh-container" style={{ paddingTop: 'var(--space-2xl)' }}>
        <Card>
          <div style={{ 
            padding: '24px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#ef4444',
            textAlign: 'center'
          }}>
            {error}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      className="eh-container" 
      style={{ paddingTop: '48px', paddingBottom: '48px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {user ? (
        <div>
          {/* Profile Header */}
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ padding: '32px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '24px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                }}>
                  <User size={48} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
                    {user.first_name} {user.last_name}
                  </h1>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>@{user.username}</p>
                  <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                </div>
                <Button variant="secondary" onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} /> : <RefreshCw size={16} style={{ marginRight: '8px' }} />} Refresh
                </Button>
              </div>
            </div>
          </Card>

          {/* User Info */}
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: 700 }}>
                Personal Information
              </h2>
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                <Package size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Your Orders ({user.orders?.length || 0})
              </h2>
              <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? '...' : '↻'}
              </Button>
            </div>
            
            {user.orders && user.orders.length > 0 ? (
              <div style={{ display: 'grid', gap: '20px' }}>
                {user.orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const progress = getStatusProgress(order.status);
                  
                  return (
                    <motion.div
                      key={order.order_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
                        <div style={{ padding: '24px' }}>
                          {/* Order Header */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '20px',
                            paddingBottom: '16px',
                            borderBottom: '1px solid var(--glass-border)',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Order #{order.order_id}</h3>
                                <span style={{
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  background: statusInfo.bg,
                                  color: statusInfo.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}>
                                  {statusInfo.icon} {statusInfo.label}
                                </span>
                              </div>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                <MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {order.address}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: 0
                              }}>
                                NPR {order.total_price}
                              </p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                                {statusInfo.description}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              marginBottom: '8px',
                              fontSize: '0.8rem'
                            }}>
                              <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                              <span style={{ color: 'var(--text-muted)' }}>Shipped</span>
                              <span style={{ color: 'var(--text-muted)' }}>Delivered</span>
                            </div>
                            <div style={{
                              height: '8px',
                              background: '#e9ecef',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
                              Items Ordered:
                            </p>
                            {order.cart_items.map((item, idx) => (
                              <div 
                                key={item.product_id || idx} 
                                style={{ 
                                  background: 'var(--bg-surface)', 
                                  padding: '16px',
                                  borderRadius: '12px',
                                  marginBottom: idx < order.cart_items.length - 1 ? '12px' : 0
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>{item.product_name}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                      Quantity: {item.quantity}
                                    </p>
                                  </div>
                                  <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                    NPR {item.total_price}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '16px' }}><Package size={64} style={{ color: 'var(--eh-primary)' }} /></div>
                  <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>No Orders Yet</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                    Start shopping to see your orders here!
                  </p>
                  <Button variant="primary" onClick={() => navigate('/medicines')}>
                    Browse Medicines
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="eh-loader"></div>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading profile...</p>
        </div>
      )}
    </motion.div>
  );
};

export default Profile;

