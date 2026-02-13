import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, AlertTriangle } from 'lucide-react';
import { BASE_URL, getImageUrl } from '../../api/config';
import './pages.css';

const CartScreen = () => {
  const { cartItems, removeFromCart, updateQuantity, toggleSelectItem, toggleSelectAll } = useCart();
  const navigate = useNavigate();
  const [updatedItems, setUpdatedItems] = useState(new Set());

  const selectedCount = cartItems.filter(item => item.selected !== false).length;
  const isAllSelected = selectedCount === cartItems.length && cartItems.length > 0;
  
  const totalPrice = cartItems.reduce((total, item) => {
    if (item.selected !== false) {
      return total + item.price * item.quantity;
    }
    return total;
  }, 0);


  const triggerUpdateAnimation = (itemId) => {
    setUpdatedItems(prev => new Set([...prev, itemId]));
    setTimeout(() => {
      setUpdatedItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }, 400);
  };

  const increaseQuantity = (id) => {
    updateQuantity(id, 'increase');
    triggerUpdateAnimation(id);
  };

  const decreaseQuantity = (id) => {
    updateQuantity(id, 'decrease');
    triggerUpdateAnimation(id);
  };

  if (cartItems.length === 0) {
    return (
      <div className="eh-container medicines-page">
        <motion.div 
          className="empty-cart-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="empty-cart-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <ShoppingCart size={64} />
          </motion.div>
          <h1 className="empty-cart-title">
            Your Cart is Empty
          </h1>
          <p className="empty-cart-subtitle">
            Looks like you haven't added any medicines yet.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="eh-container medicines-page">
      <motion.h1
        className="cart-page-header"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ShoppingCart size={28} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
        Your Cart ({cartItems.length} items)
      </motion.h1>

      <div className="cart-layout">
        <div className="cart-main-content">
          {/* Select All Bar */}
          <div className="select-all-bar">
            <label className="cart-checkbox-container">
              <input 
                type="checkbox" 
                className="cart-checkbox"
                checked={isAllSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Select All ({cartItems.length} items)</span>
            </label>
            {selectedCount > 0 && (
              <span style={{ fontSize: '0.9rem', color: 'var(--eh-success)', fontWeight: 600 }}>
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item, idx) => (
              <motion.div
                key={item.id}
                className="cart-item"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card hover>
                  <CardContent className="cart-item-content">
                    {/* Selection Checkbox */}
                    <div className="cart-item-checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        className="cart-checkbox"
                        checked={item.selected !== false}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                    </div>

                    {/* Image */}
                    <motion.div className="cart-item-image-wrapper">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="cart-item-image"
                      />
                    </motion.div>

                    {/* Product Info */}
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p className="cart-item-meta">{item.generic_name}</p>
                      {item.prescriptionRequired && (
                        <span className="prescription-badge">
                          <AlertTriangle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          Prescription Required
                        </span>
                      )}
                    </div>

                    {/* Quantity & Price */}
                    <div className="cart-item-actions">
                      <p className="cart-item-price">
                        NPR {(item.price * item.quantity).toLocaleString()}
                      </p>
                      
                      <div className="quantity-controls">
                        <motion.button
                          className="quantity-btn minus"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => decreaseQuantity(item.id)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </motion.button>
                        <span className={`quantity-value ${updatedItems.has(item.id) ? 'updated' : ''}`}>
                          {item.quantity}
                        </span>
                        <motion.button
                          className="quantity-btn plus"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => increaseQuantity(item.id)}
                          aria-label="Increase quantity"
                        >
                          +
                        </motion.button>
                      </div>
                      
                      <motion.button
                        className="remove-btn"
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(245, 87, 108, 0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Remove
                      </motion.button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>


        {/* Order Summary */}
        <div className="order-summary">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="order-summary-card">
              <div className="order-summary-header">
                <h2>Order Summary</h2>
              </div>
              <CardContent className="order-summary-body">
                <div className="order-summary-divider">
                  <div className="order-summary-row">
                    <span>Subtotal ({selectedCount} items selected):</span>
                    <span>NPR {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="order-summary-row free">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="order-summary-row">
                    <span>Tax:</span>
                    <span>NPR 0</span>
                  </div>
                </div>

                <div className="order-summary-total">
                  <span className="order-summary-total-label">Total:</span>
                  <span className="order-summary-total-value">
                    NPR {totalPrice.toLocaleString()}
                  </span>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={selectedCount > 0 ? "success" : "secondary"}
                    size="lg"
                    className="product-btn-block"
                    onClick={() => selectedCount > 0 && navigate('/checkout')}
                    disabled={selectedCount === 0}
                  >
                    Proceed to Checkout {selectedCount > 0 ? `(${selectedCount})` : ''}
                  </Button>

                </motion.div>

                <Button
                  variant="glass"
                  className="product-btn-block"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;

