import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

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
      <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
        <div className="eh-center" style={{ padding: 'var(--eh-spacing-2xl) 0' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 'var(--eh-spacing-lg)' }}>🛒 Your Cart</h1>
          <p style={{ color: 'var(--eh-text-muted)', fontSize: '1.1rem', marginBottom: 'var(--eh-spacing-lg)' }}>Your cart is empty</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 'var(--eh-spacing-xl)' }}>🛒 Your Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--eh-spacing-xl)' }}>
        {/* Cart Items */}
        <div>
          {cartItems.map((item) => (
            <Card key={item.id} style={{ marginBottom: 'var(--eh-spacing-lg)' }}>
              <CardContent>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 'var(--eh-spacing-lg)', alignItems: 'start' }}>
                  {/* Image */}
                  <div style={{ borderRadius: 'var(--eh-radius-sm)', overflow: 'hidden' }}>
                    <img
                      src={`http://127.0.0.1:8000${item.image}`}
                      alt={item.name}
                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--eh-text-primary)' }}>
                      {item.name}
                    </h3>
                    <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                      {item.generic_name}
                    </p>
                    {item.prescriptionRequired && (
                      <p style={{ color: 'var(--eh-accent)', fontSize: '0.85rem', fontWeight: 600 }}>
                        ⚠️ Prescription Required
                      </p>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--eh-success)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px' }}>
                      NPR {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', justifyContent: 'flex-end' }}>
                      <Button variant="outline" size="sm" onClick={() => decreaseQuantity(item.id)}>
                        −
                      </Button>
                      <span style={{ minWidth: '40px', textAlign: 'center', paddingTop: '8px' }}>
                        {item.quantity}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => increaseQuantity(item.id)}>
                        +
                      </Button>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      className="eh-btn--block"
                      onClick={() => removeFromCart(item.id)}
                    >
                      🗑️ Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ height: 'fit-content', position: 'sticky', top: '20px' }}>
          <Card>
            <CardContent>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-text-primary)' }}>
                Order Summary
              </h2>

              <div style={{ marginBottom: 'var(--eh-spacing-lg)', paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--eh-text-secondary)' }}>
                  <span>Subtotal:</span>
                  <span>NPR {totalPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--eh-text-secondary)' }}>
                  <span>Shipping:</span>
                  <span>NPR 0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--eh-text-secondary)' }}>
                  <span>Tax:</span>
                  <span>NPR 0</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--eh-spacing-lg)' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total:</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--eh-success)' }}>
                  NPR {totalPrice.toLocaleString()}
                </span>
              </div>

              <Button
                variant="success"
                className="eh-btn--block"
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="outline"
                className="eh-btn--block"
                style={{ marginTop: '12px' }}
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;
