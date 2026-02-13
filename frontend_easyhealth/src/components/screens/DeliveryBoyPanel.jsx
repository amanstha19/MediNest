import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckCircle, XCircle, Phone, MapPin, User, Mail, Clock } from 'lucide-react';
import { API_URL } from '../../api/config';
import './pages.css';

const DeliveryBoyPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingOrder, setProcessingOrder] = useState(null);

  const authTokens = sessionStorage.getItem('authTokens');
  const parsedTokens = authTokens ? JSON.parse(authTokens) : null;
  const token = parsedTokens?.access;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/delivery-boy/orders/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.error || 'Failed to load delivery orders');
    } finally {
      setLoading(false);
    }
  };

  const markOrderDelivered = async (orderId) => {
    setProcessingOrder(orderId);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(
        `${API_URL}/delivery-boy/orders/${orderId}/deliver/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.email_sent) {
        setSuccess(`Order #${orderId} delivered successfully! Customer notified via email.`);
      } else {
        setSuccess(`Order #${orderId} delivered successfully!`);
      }
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark order as delivered');
    } finally {
      setProcessingOrder(null);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    
    setProcessingOrder(orderId);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(
        `${API_URL}/delivery-boy/orders/${orderId}/cancel/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Order #${orderId} has been canceled. Customer will be notified.`);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setProcessingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#fff3cd', color: '#856404' };
      case 'processing': return { bg: '#cce5ff', color: '#004085' };
      case 'shipped': return { bg: '#d1ecf1', color: '#0c5460' };
      case 'delivered': return { bg: '#d4edda', color: '#155724' };
      case 'canceled': return { bg: '#f8d7da', color: '#721c24' };
      default: return { bg: '#f8f9fa', color: '#333' };
    }
  };

  if (loading) {
    return (
      <div className="eh-container" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className="eh-loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="eh-container" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
          <Package size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} /> Delivery Boy Panel
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Manage your delivery orders - mark as delivered or cancel orders
        </p>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                color: '#155724',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={20} /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                color: '#721c24',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <XCircle size={20} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders Count */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          color: 'white'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 800 }}>{orders.length}</div>
          <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>Pending Deliveries</div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Package size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>No Delivery Orders</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                There are no orders ready for delivery at the moment.
              </p>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => {
              const statusColors = getStatusColor(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <Card>
                    <div style={{ padding: '24px' }}>
                      {/* Order Header */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '4px' }}>
                            Order #{order.id}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                            <Clock size={14} />
                            <span style={{ fontSize: '0.9rem' }}>{order.created_at}</span>
                          </div>
                        </div>
                        <span style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          background: statusColors.bg,
                          color: statusColors.color,
                          textTransform: 'capitalize'
                        }}>
                          {order.status}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div style={{ 
                        background: '#f8f9fa', 
                        borderRadius: '12px', 
                        padding: '16px',
                        marginBottom: '20px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={18} style={{ color: '#667eea' }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer</div>
                            <div style={{ fontWeight: 500 }}>{order.first_name} {order.last_name}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={18} style={{ color: '#28a745' }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</div>
                            <div style={{ fontWeight: 500 }}>{order.phone || 'N/A'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={18} style={{ color: '#6f42c1' }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{order.email}</div>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div style={{ 
                        background: '#e8f4fd', 
                        borderRadius: '12px', 
                        padding: '16px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <MapPin size={20} style={{ color: '#004085', marginTop: '2px' }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', color: '#004085', fontWeight: 600, marginBottom: '4px' }}>
                              Delivery Address
                            </div>
                            <div style={{ color: '#004085', lineHeight: '1.5' }}>
                              {order.address}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Order Items</h4>
                        <div style={{ 
                          border: '1px solid var(--glass-border)',
                          borderRadius: '12px',
                          overflow: 'hidden'
                        }}>
                          {order.cart_items.map((item, idx) => (
                            <div 
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                borderBottom: idx < order.cart_items.length - 1 ? '1px solid var(--glass-border)' : 'none',
                                background: idx % 2 === 0 ? '#f8f9fa' : 'white'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                  background: '#667eea',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 600
                                }}>
                                  {item.quantity}
                                </span>
                                <span style={{ fontWeight: 500 }}>{item.product_name}</span>
                              </div>
                              <span style={{ fontWeight: 600, color: '#667eea' }}>
                                Rs. {item.total_price.toLocaleString()}
                              </span>
                            </div>
                          ))}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                          }}>
                            <span style={{ fontWeight: 600 }}>Total Amount</span>
                            <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                              Rs. {order.total_price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Button
                          variant="primary"
                          disabled={processingOrder === order.id}
                          onClick={() => markOrderDelivered(order.id)}
                          style={{ flex: 1, minWidth: '150px' }}
                        >
                          {processingOrder === order.id ? (
                            'Processing...'
                          ) : (
                            <>
                              <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                              Mark Delivered
                            </>
                          )}
                        </Button>
                        <Button
                          variant="danger"
                          disabled={processingOrder === order.id}
                          onClick={() => cancelOrder(order.id)}
                          style={{ flex: 1, minWidth: '150px' }}
                        >
                          {processingOrder === order.id ? (
                            'Processing...'
                          ) : (
                            <>
                              <XCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                              Cancel Order
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DeliveryBoyPanel;

