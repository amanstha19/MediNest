import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EsewaPayment from '../screens/Payment';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

const CheckoutScreen = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showEsewaPayment, setShowEsewaPayment] = useState(false);

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
      alert('Your cart is empty. Please add items before proceeding to checkout.');
      return;
    }

    if (prescriptionRequired && !prescription) {
      alert('Please upload your prescription.');
      return;
    }

    if (!address.trim()) {
      alert('Please enter a delivery address.');
      return;
    }

    setLoading(true);

    try {
      const userToken = sessionStorage.getItem('authTokens');
      if (!userToken) {
        alert('You must be logged in to proceed with the checkout.');
        navigate('/login');
        return;
      }

      const parsedToken = JSON.parse(userToken);
      const token = parsedToken?.access;

      if (!token) {
        alert('Invalid token. Please login again.');
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

      if (paymentMethod === 'online') {
        // First, ensure stock is reduced by placing the order
        setShowEsewaPayment(true);
        return;
      }

      navigate(`/order-success/${response.data.order_id}`);

    } catch (error) {
      console.error('Error during checkout:', error);
      alert('There was an error processing your checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showEsewaPayment) {
    return <EsewaPayment totalPrice={totalPrice} />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)' }}>
        <div className="eh-center" style={{ padding: 'var(--eh-spacing-2xl) 0' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 'var(--eh-spacing-lg)' }}>🛒 Checkout</h1>
          <p style={{ color: 'var(--eh-text-muted)', fontSize: '1.1rem', marginBottom: 'var(--eh-spacing-lg)' }}>Your cart is empty</p>
          <Button variant="primary" onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 'var(--eh-spacing-xl)' }}>💳 Order Summary</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--eh-spacing-xl)' }}>
        {/* Order Items */}
        <div>
          <Card>
            <CardContent>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--eh-spacing-lg)' }}>Items</h2>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {cartItems.map((item, idx) => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 'var(--eh-spacing-lg)', alignItems: 'center', paddingBottom: 'var(--eh-spacing-lg)', borderBottom: idx < cartItems.length - 1 ? '1px solid var(--eh-border)' : 'none' }}>
                    <img src={`http://127.0.0.1:8000${item.image}`} alt={item.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: 'var(--eh-radius-sm)' }} />
                    <div>
                      <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>{item.name}</h4>
                      <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Qty: {item.quantity}</p>
                      <p style={{ fontWeight: 700, color: 'var(--eh-success)' }}>NPR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checkout Form */}
        <div style={{ height: 'fit-content', position: 'sticky', top: '20px' }}>
          <Card>
            <CardContent>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--eh-spacing-lg)' }}>Place Order</h2>

              <form onSubmit={handleSubmit}>
                <div className="eh-form-group">
                  <label>Delivery Address</label>
                  <input
                    type="text"
                    className="eh-input"
                    placeholder="Your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {prescriptionRequired && (
                  <div className="eh-form-group">
                    <label>Upload Prescription</label>
                    <input
                      type="file"
                      className="eh-input"
                      accept="image/*,application/pdf"
                      onChange={handlePrescriptionUpload}
                      required
                      disabled={loading}
                    />
                  </div>
                )}

                <div className="eh-form-group">
                  <label>Payment Method</label>
                  <select
                    className="eh-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment (eSewa)</option>
                  </select>
                </div>

                <div style={{ marginBottom: 'var(--eh-spacing-lg)', paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Total:</span>
                    <span style={{ fontWeight: 700, color: 'var(--eh-success)', fontSize: '1.2rem' }}>NPR {totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="eh-btn--block"
                  size="lg"
                  variant="success"
                  disabled={loading}
                >
                  {loading ? '⏳ Processing...' : '✓ Place Order'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;
