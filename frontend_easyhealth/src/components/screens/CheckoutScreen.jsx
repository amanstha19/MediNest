import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EsewaPayment from '../screens/Payment';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';
import { ShoppingCart, MapPin, FileText, CreditCard, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const CheckoutScreen = () => {
  const { cartItems } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);


  useEffect(() => {
    const requiresPrescription = cartItems.some(item => item.prescriptionRequired);
    setPrescriptionRequired(requiresPrescription);

    // Calculate total price from cart items
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotalPrice(total);
  }, [cartItems]);

  const handlePrescriptionUpload = (e) => {
    setPrescription(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      addToast('Your cart is empty. Please add items before proceeding to checkout.', 'warning');
      return;
    }

    if (prescriptionRequired && !prescription) {
      addToast('Please upload your prescription.', 'warning');
      return;
    }

    if (!address.trim()) {
      addToast('Please enter a delivery address.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const userToken = sessionStorage.getItem('authTokens');
      if (!userToken) {
        addToast('You must be logged in to proceed with the checkout.', 'error');
        navigate('/login');
        return;
      }

      const parsedToken = JSON.parse(userToken);
      const token = parsedToken?.access;

      if (!token) {
        addToast('Invalid token. Please login again.', 'error');
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('address', address);
      formData.append('payment_method', paymentMethod);
      if (prescriptionRequired) {
        formData.append('prescription', prescription);
      }
      formData.append('cart_items', JSON.stringify(cartItems));

      const response = await axios.post('http://localhost:8000/api/order/place/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      addToast('Order placed successfully!', 'success');

      if (paymentMethod === 'online') {
        // Navigate to payment page with order details
        navigate(`/payment/${response.data.order_id}/${totalPrice}`);
        return;
      }

      navigate(`/order-success/${response.data.order_id}`);

    } catch (error) {
      console.error('Error during checkout:', error);
      addToast('There was an error processing your checkout. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
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
            <ShoppingCart size={80} style={{ color: 'var(--eh-primary)' }} />
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
            Add some medicines to proceed with checkout.
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
        <CreditCard size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Complete Your Order
      </motion.h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        {/* Order Items */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                  Order Items ({cartItems.length})
                </h2>
              </div>
              <CardContent style={{ padding: '24px' }}>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {cartItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr auto',
                        gap: '16px',
                        alignItems: 'center',
                        paddingBottom: '16px',
                        borderBottom: idx < cartItems.length - 1 ? '1px solid var(--glass-border)' : 'none',
                        marginBottom: '16px'
                      }}
                    >
                      <motion.img
                        src={`http://127.0.0.1:8000${item.image}`}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '12px'
                        }}
                        whileHover={{ scale: 1.05 }}
                      />
                      <div>
                        <h4 style={{
                          fontSize: '1.1rem',
                          marginBottom: '8px',
                          color: 'var(--eh-text-primary)',
                          fontWeight: 700
                        }}>
                          {item.name}
                        </h4>
                        <p style={{
                          color: 'var(--eh-text-muted)',
                          fontSize: '0.9rem',
                          marginBottom: '8px'
                        }}>
                          Quantity: {item.quantity}
                        </p>
                      {item.prescriptionRequired && (
                          <span style={{
                            color: '#f5576c',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: 'rgba(245, 87, 108, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <AlertTriangle size={12} /> Prescription Required
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: 800,
                          fontSize: '1.2rem'
                        }}>
                          NPR {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Checkout Form */}
        <div style={{ height: 'fit-content', position: 'sticky', top: '20px' }}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass" style={{ overflow: 'hidden' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                padding: '24px',
                borderBottom: '1px solid var(--glass-border)'
              }}>
                <h2 style={{
                  fontSize: '1.4rem',
                  marginBottom: 0,
                  color: 'var(--eh-text-primary)',
                  fontWeight: 800
                }}>
                  Order Details
                </h2>
              </div>
              <CardContent style={{ padding: '24px' }}>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 600,
                      color: 'var(--eh-text-primary)'
                    }}>
                      <MapPin size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Delivery Address
                    </label>
                    <textarea
                      className="input-glass"
                      placeholder="Enter your complete delivery address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      disabled={loading}
                      rows={3}
                      style={{
                        width: '100%',
                        fontSize: '1rem',
                        padding: '14px 16px',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {prescriptionRequired && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: 'var(--eh-text-primary)'
                      }}>
                        <FileText size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Upload Prescription
                      </label>
                      <input
                        type="file"
                        className="input-glass"
                        accept="image/*,application/pdf"
                        onChange={handlePrescriptionUpload}
                        required
                        disabled={loading}
                        style={{
                          width: '100%',
                          fontSize: '1rem',
                          padding: '12px 16px'
                        }}
                      />
                      <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--eh-text-muted)',
                        marginTop: '4px'
                      }}>
                        Upload a clear image or PDF of your prescription
                      </p>
                    </div>
                  )}

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 600,
                      color: 'var(--eh-text-primary)'
                    }}>
                      <CreditCard size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Payment Method
                    </label>
                    <select
                      className="input-glass"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                      disabled={loading}
                      style={{
                        width: '100%',
                        fontSize: '1rem',
                        padding: '14px 16px'
                      }}
                    >
                      <option value="cod">💵 Cash on Delivery</option>
                      <option value="online">💳 Online Payment (eSewa)</option>
                    </select>
                  </div>

                  <div style={{
                    marginBottom: '24px',
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
                      type="submit"
                      size="lg"
                      variant="primary"
                      disabled={loading}
                      style={{ width: '100%' }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} style={{ marginRight: '8px', verticalAlign: 'middle', animation: 'spin 1s linear infinite' }} /> Processing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Place Order
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;
