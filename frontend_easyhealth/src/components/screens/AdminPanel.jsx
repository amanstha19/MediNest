import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import './pages.css';

const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [updatingStock, setUpdatingStock] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authTokens = sessionStorage.getItem('authTokens');
  const parsedTokens = authTokens ? JSON.parse(authTokens) : null;
  const token = parsedTokens?.access;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchOrders(), fetchProducts()]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/orders/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/products/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    setError('');
    setSuccess('');
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/orders/${orderId}/status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Order #${orderId} status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const updateProductStock = async (productId) => {
    if (!newStockValue || newStockValue < 0) {
      setError('Please enter a valid stock value');
      return;
    }
    setUpdatingStock(productId);
    setError('');
    setSuccess('');
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/admin/products/${productId}/stock/`,
        { stock: parseInt(newStockValue) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Stock updated for product #${productId}`);
      setNewStockValue('');
      setUpdatingStock(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update stock');
    } finally {
      setUpdatingStock(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#fff3cd', color: '#856404' };
      case 'shipped': return { bg: '#cce5ff', color: '#004085' };
      case 'delivered': return { bg: '#d4edda', color: '#155724' };
      default: return { bg: '#f8f9fa', color: '#333' };
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: '#dc3545', label: 'Out of Stock' };
    if (stock < 10) return { color: '#fd7e14', label: 'Low Stock' };
    return { color: '#28a745', label: 'In Stock' };
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
          🔧 Admin Panel
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Manage orders, track deliveries, and update inventory
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
                color: '#155724'
              }}
            >
              ✅ {success}
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
                color: '#721c24'
              }}
            >
              ❌ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <Button
            variant={activeTab === 'orders' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders ({orders.length})
          </Button>
          <Button
            variant={activeTab === 'inventory' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('inventory')}
          >
            💊 Inventory ({products.length})
          </Button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Order Management</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Update order status: Pending → Shipped → Delivered
                </p>
              </div>
              
              {orders.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No orders yet
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Order ID</th>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Customer</th>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Items</th>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Total</th>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Current Status</th>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const statusColors = getStatusColor(order.status);
                        return (
                          <tr key={order.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <td style={{ padding: '16px' }}>
                              <strong>#{order.id}</strong>
                              <br />
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {order.created_at}
                              </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: 500 }}>{order.username}</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {order.email}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                📞 {order.phone || 'N/A'}
                              </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              {order.cart_items.slice(0, 2).map((item, idx) => (
                                <div key={idx} style={{ fontSize: '0.9rem' }}>
                                  {item.quantity}x {item.product_name}
                                </div>
                              ))}
                              {order.cart_items.length > 2 && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  +{order.cart_items.length - 2} more
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '16px', fontWeight: 600 }}>
                              NPR {order.total_price.toLocaleString()}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                background: statusColors.bg,
                                color: statusColors.color,
                                textTransform: 'capitalize'
                              }}>
                                {order.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['pending', 'shipped', 'delivered'].map((status) => (
                                  <Button
                                    key={status}
                                    size="sm"
                                    variant={order.status === status ? 'primary' : 'secondary'}
                                    disabled={order.status === status || updatingOrder === order.id}
                                    onClick={() => updateOrderStatus(order.id, status)}
                                    style={{ textTransform: 'capitalize' }}
                                  >
                                    {updatingOrder === order.id ? '...' : status}
                                  </Button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Inventory Management</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Track and update product stock levels
                </p>
              </div>
              
              {products.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No products found
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Product</th>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Category</th>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Price</th>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Current Stock</th>
                        <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Update Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                          <tr key={product.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: 500 }}>{product.name}</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {product.generic_name}
                              </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                background: '#e9ecef',
                                color: '#495057'
                              }}>
                                {product.category}
                              </span>
                            </td>
                            <td style={{ padding: '16px', fontWeight: 600 }}>
                              NPR {product.price.toLocaleString()}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ 
                                fontWeight: 700, 
                                fontSize: '1.1rem',
                                color: stockStatus.color 
                              }}>
                                {product.stock}
                              </div>
                              <div style={{ 
                                fontSize: '0.8rem',
                                color: stockStatus.color 
                              }}>
                                {stockStatus.label}
                              </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              {updatingStock === product.id ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input
                                    type="number"
                                    value={newStockValue}
                                    onChange={(e) => setNewStockValue(e.target.value)}
                                    placeholder="New stock"
                                    min="0"
                                    style={{
                                      padding: '8px 12px',
                                      border: '2px solid var(--primary)',
                                      borderRadius: '8px',
                                      width: '100px'
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => updateProductStock(product.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                      setUpdatingStock(null);
                                      setNewStockValue('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setUpdatingStock(product.id);
                                    setNewStockValue(product.stock.toString());
                                  }}
                                >
                                  ✏️ Edit
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPanel;

