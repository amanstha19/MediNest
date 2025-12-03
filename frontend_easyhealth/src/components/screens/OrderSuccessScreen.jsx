import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

const OrderSuccessScreen = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const authTokens = sessionStorage.getItem('authTokens');
      if (!authTokens) {
        setError('No token found, please log in.');
        setLoading(false);
        return;
      }

      const parsedToken = JSON.parse(authTokens);
      const token = parsedToken?.access;

      if (!token) {
        setError('Invalid token, please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/order/${orderId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrderDetails(response.data);
      } catch (error) {
        setError('There was an error fetching your order details.');
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="eh-center" style={{ padding: '60px 20px' }}>
        <div className="eh-loader" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)' }}>
        <div className="eh-alert eh-alert--error">{error}</div>
        <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      {orderDetails ? (
        <div style={{ width: '100%' }}>
          <div className="eh-center" style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--eh-spacing-md)' }}>✅</div>
            <h1 style={{ fontSize: '2rem', color: 'var(--eh-success)', marginBottom: 'var(--eh-spacing-md)' }}>Order Placed Successfully!</h1>
            <p style={{ color: 'var(--eh-text-muted)', fontSize: '1.1rem' }}>Thank you for your order. Your purchase has been confirmed.</p>
          </div>

          <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
            <CardContent>
              <div style={{ display: 'grid', gap: 'var(--eh-spacing-lg)' }}>
                <div style={{ paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Order ID</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{orderDetails.id}</p>
                </div>

                <div style={{ paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Order Total</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--eh-success)' }}>NPR {orderDetails.total_price}</p>
                </div>

                <div style={{ paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Status</p>
                  <span style={{ background: 'var(--eh-primary)', color: 'white', padding: '6px 12px', borderRadius: 'var(--eh-radius-sm)', fontWeight: 600 }}>
                    {orderDetails.status}
                  </span>
                </div>

                <div>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Shipping Address</p>
                  <p style={{ fontSize: '1rem' }}>{orderDetails.address || 'Address not provided'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-md)', marginTop: 'var(--eh-spacing-2xl)' }}>
                <Button variant="primary" onClick={() => navigate('/profile')}>View Orders</Button>
                <Button variant="secondary" onClick={() => navigate('/')}>Continue Shopping</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="eh-center">
          <div className="eh-alert eh-alert--warning">No order details found.</div>
          <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      )}
    </div>
  );
};

export default OrderSuccessScreen;
