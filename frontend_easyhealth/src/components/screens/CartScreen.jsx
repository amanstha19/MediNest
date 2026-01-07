import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';

const CartScreen = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const increaseQuantity = (id) => {
    updateQuantity(id, 'increase');
  };

  const decreaseQuantity = (id) => {
    updateQuantity(id, 'decrease');
  };

  if (cartItems.length === 0) {
    return (
      <div className="eh-container" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <motion.div 
          className="glass"
          style={{ 
            padding: '64px 48px', 
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            style={{ fontSize: '5rem', marginBottom: '24px' }}
          >
            🛒
          </motion.div>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: '16px',
            color: 'var(--eh-text-primary)',
            fontWeight: 800
          }}>
            Your Cart is Empty
          </h1>
          <p style={{ 
            color: 'var(--eh-text-muted)', 
            fontSize: '1.1rem', 
            marginBottom: '32px'
          }}>
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
    <div className="eh-container" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
      <motion.h1
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ 
          fontSize: '2rem', 
          marginBottom: '32px',
          color: 'var(--eh-text-primary)',
          fontWeight: 800
        }}
      >
        🛒 Your Cart ({cartItems.length} items)
      </motion.h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
        {/* Cart Items */}
        <div>
          {cartItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card hover style={{ marginBottom: '20px' }}>
                <CardContent style={{ padding: '24px' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '120px 1fr auto', 
                    gap: '24px', 
                    alignItems: 'center' 
                  }}>
                    {/* Image */}
                    <motion.div 
                      style={{ borderRadius: '12px', overflow: 'hidden' }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={`http://127.0.0.1:8000${item.image}`}
                        alt={item.name}
                        style={{ 
                          width: '100%', 
                          height: '120px', 
                          objectFit: 'cover' 
                        }}
                      />
                    </motion.div>

                    {/* Product Info */}
                    <div>
                      <h3 style={{ 
                        fontSize: '1.1rem', 
                        marginBottom: '8px', 
                        color: 'var(--eh-text-primary)',
                        fontWeight: 700
                      }}>
                        {item.name}
                      </h3>
                      <p style={{ 
                        color: 'var(--eh-text-muted)', 
                        fontSize: '0.9rem', 
                        marginBottom: '12px' 
                      }}>
                        {item.generic_name}
                      </p>
                      {item.prescriptionRequired && (
                        <span style={{ 
                          color: '#f5576c', 
                          fontSize: '0.85rem', 
                          fontWeight: 600,
                          background: 'rgba(245, 87, 108, 0.1)',
                          padding: '4px 12px',
                          borderRadius: '20px'
                        }}>
                          ⚠️ Prescription Required
                        </span>
                      )}
                    </div>

                    {/* Quantity & Price */}
                    <div style={{ textAlign: 'right', minWidth: '140px' }}>
                      <p style={{ 
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800, 
                        fontSize: '1.3rem', 
                        marginBottom: '16px'
                      }}>
                        NPR {(item.price * item.quantity).toLocaleString()}
                      </p>
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        marginBottom: '16px', 
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                      }}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => decreaseQuantity(item.id)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--glass-bg)',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          −
                        </motion.button>
                        <span style={{ 
                          minWidth: '40px', 
                          textAlign: 'center', 
                          fontWeight: 700,
                          fontSize: '1.1rem'
                        }}>
                          {item.quantity}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => increaseQuantity(item.id)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--glass-bg)',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </motion.button>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(245, 87, 108, 0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(245, 87, 108, 0.3)',
                          background: 'rgba(245, 87, 108, 0.1)',
                          color: '#f5576c',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}
                      >
                        🗑️ Remove
                      </motion.button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ height: 'fit-content', position: 'sticky', top: '20px' }}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass" style={{ overflow: 'hidden' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                padding: '24px',
                borderBottom: '1px solid var(--glass-border)'
              }}>
                <h2 style={{ 
                  fontSize: '1.4rem', 
                  marginBottom: 0,
                  color: 'var(--eh-text-primary)',
                  fontWeight: 800
                }}>
                  Order Summary
                </h2>
              </div>
              <CardContent style={{ padding: '24px' }}>
                <div style={{ 
                  marginBottom: '20px', 
                  paddingBottom: '20px', 
                  borderBottom: '1px solid var(--glass-border)' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px', 
                    color: 'var(--eh-text-secondary)' 
                  }}>
                    <span>Subtotal ({cartItems.length} items):</span>
                    <span>NPR {totalPrice.toLocaleString()}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px', 
                    color: 'var(--eh-text-secondary)' 
                  }}>
                    <span>Shipping:</span>
                    <span style={{ color: 'var(--eh-success)' }}>Free</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    color: 'var(--eh-text-secondary)' 
                  }}>
                    <span>Tax:</span>
                    <span>NPR 0</span>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '24px' 
                }}>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Total:</span>
                  <span style={{ 
                    fontWeight: 800, 
                    fontSize: '1.3rem', 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    NPR {totalPrice.toLocaleString()}
                  </span>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="success"
                    size="lg"
                    style={{ width: '100%', marginBottom: '12px' }}
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>
                </motion.div>

                <Button
                  variant="glass"
                  style={{ width: '100%' }}
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

