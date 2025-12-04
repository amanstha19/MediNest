import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../ui/card';

const BookingPaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const transactionUuid = searchParams.get('transaction_uuid');
        const statusCode = searchParams.get('status');
        const transactionCode = searchParams.get('transaction_code');

        if (!transactionUuid) {
          setStatus('error');
          setMessage('Invalid payment data received.');
          return;
        }

        // Send callback data to backend
        const response = await axios.post('/api/booking-payment/', {
          transaction_uuid: transactionUuid,
          status: statusCode,
          transaction_code: transactionCode,
          data: 'callback' // Indicate this is a callback
        });

        if (statusCode === 'SUCCESS') {
          setStatus('success');
          setMessage('Payment verified successfully! Redirecting...');
          // Redirect to booking success page
          setTimeout(() => {
            navigate('/booking-success/1'); // Use a placeholder ID or get from response
          }, 2000);
        } else {
          setStatus('failed');
          setMessage('Payment verification failed.');
          setTimeout(() => {
            navigate('/book-test/1'); // Redirect back to booking page
          }, 3000);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('Payment verification failed. Please contact support.');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ maxWidth: '500px', width: '100%' }}>
        <CardContent style={{ textAlign: 'center', padding: 'var(--eh-spacing-3xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--eh-spacing-lg)' }}>
            {status === 'processing' && '⏳'}
            {status === 'success' && '✅'}
            {status === 'failed' && '❌'}
            {status === 'error' && '⚠️'}
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: 'var(--eh-spacing-md)',
            color: status === 'success' ? 'var(--eh-success)' : status === 'failed' ? 'var(--eh-accent)' : 'var(--eh-text-primary)'
          }}>
            {status === 'processing' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'error' && 'Verification Error'}
          </h2>
          <p style={{ color: 'var(--eh-text-secondary)', marginBottom: 'var(--eh-spacing-lg)' }}>
            {message}
          </p>
          {status === 'processing' && (
            <div className="eh-loader" style={{ margin: '0 auto' }}></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingPaymentVerification;
