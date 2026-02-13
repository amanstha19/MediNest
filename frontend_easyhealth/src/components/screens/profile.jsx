import { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, RefreshCw, Package, Clock, CheckCircle, MapPin, Heart, Shield, Star, RefreshCcw } from 'lucide-react';
import { getImageUrl } from '../../api/config';
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
      const response = await API.get('user/profile/', {
        headers: {
          'Authorization': `Bearer ${parsedTokens.access}`,
        },
      });
      console.log('Profile data fetched:', response.data);
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Error fetching profile: ' + (err.response?.data?.detail || err.message));
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate('/login');
      }
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
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      {user ? (
        <div>
          {/* Hero Section */}
          <div className="eh-hero" style={{
            marginBottom: 'var(--eh-spacing-2xl)',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
            color: 'white',
            padding: '40px 24px',
            borderRadius: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(138, 43, 226, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 20, 147, 0.3) 0%, transparent 50%)',
              pointerEvents: 'none'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                <User size={48} />
              </div>
              <h1 style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 900,
                marginBottom: '10px',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 50%, #dbeafe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Welcome back, {user.first_name || user.username}!
              </h1>
              <p style={{ fontSize: '1rem', opacity: 0.95, marginBottom: '24px' }}>
                Manage your account, track orders, and access your health information
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}>
                  <Package size={16} />
                  {user.orders?.length || 0} Orders
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}>
                  <Heart size={16} />
                  Member since 2024
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--eh-spacing-lg)' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--primary)' }}>
                  <Package size={32} />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {user.orders?.length || 0}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Orders</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#10b981' }}>
                  <CheckCircle size={32} />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {user.orders?.filter(order => order.status.toLowerCase() === 'delivered').length || 0}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Delivered Orders</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#f59e0b' }}>
                  <Clock size={32} />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {user.orders?.filter(order => order.status.toLowerCase() === 'pending').length || 0}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending Orders</div>
              </motion.div>
            </div>
          </div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: 'var(--eh-spacing-2xl)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
          >
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
                <h1 style={{ fontSize: '1.75rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {user.first_name} {user.last_name}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>@{user.username}</p>
                <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>{user.email}</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: '#10b981'
                  }}>
                    <Shield size={14} />
                    Verified Account
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: 'var(--primary)'
                  }}>
                    <Star size={14} />
                    Premium Member
                  </div>
                </div>
              </div>
              <Button variant="secondary" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} /> : <RefreshCw size={16} style={{ marginRight: '8px' }} />} Refresh
              </Button>
            </div>
          </motion.div>

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
    </div>
  );
};

export default Profile;

