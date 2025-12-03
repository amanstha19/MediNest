import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const EsewaPayment = ({ totalPrice }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [transactionUuid, setTransactionUuid] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    // Validate and format amount
    const formatAmount = (amount) => {
        // Convert to number and handle invalid cases
        const numAmount = parseFloat(amount);
        
        // Check for NaN, null, undefined, or negative values
        if (isNaN(numAmount) || numAmount === null || numAmount === undefined || numAmount < 0) {
            throw new Error('Invalid amount provided');
        }
        
        // Return formatted amount with exactly 2 decimal places
        return numAmount.toFixed(2);
    };

    useEffect(() => {
        // Generate transaction UUID on component mount
        const uuid = `TID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setTransactionUuid(uuid);

        // Handle payment callback if present in URL
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const data = params.get('data');
        if (status && data) {
            handlePaymentCallback(status, data);
        }

        // Validate initial totalPrice
        try {
            formatAmount(totalPrice);
        } catch (error) {
            setError('Invalid price provided. Please contact support.');
        }
    }, [location.search, totalPrice]);

    const handlePaymentCallback = async (status, data) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/process-payment/', {
                status: status,
                data: data,
                transaction_uuid: transactionUuid
            });

            if (response.data.message === "Payment successful") {
                setPaymentStatus('success');
                setPaymentMessage('Payment successful! Redirecting to order summary...');
                setTimeout(() => {
                    navigate('/payment-success');
                }, 3000);
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            setPaymentStatus('failure');
            setPaymentMessage(error.response?.data?.error || 'Payment verification failed. Please try again.');
            setTimeout(() => {
                navigate('/payment-failed');
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Format and validate the amount
            const formattedAmount = formatAmount(totalPrice);
            const formattedTaxAmount = "0.00"; // Fixed tax amount for now

            const formData = {
                amount: formattedAmount,
                tax_amount: formattedTaxAmount,
                transaction_uuid: transactionUuid
            };

            console.log('Sending payment request with data:', formData); // Debug log

            const response = await axios.post('/api/process-payment/', formData);

            if (response.data) {
                // Create and submit eSewa form
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

                // Add all fields from the response
                Object.entries(response.data).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setError(error.message || error.response?.data?.error || 'Payment initialization failed. Please try again.');
            setLoading(false);
        }
    };

    // Don't render the payment form if there's an invalid amount
    if (!totalPrice || isNaN(parseFloat(totalPrice)) || parseFloat(totalPrice) <= 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: '400px' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'red' }}>
                        Invalid Amount
                    </h2>
                    <p style={{ textAlign: 'center' }}>
                        Please ensure a valid amount is provided before proceeding with payment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: '400px' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>eSewa Payment</h2>

                {error && (
                    <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                        Amount to Pay: NPR {formatAmount(totalPrice)}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: loading ? '#93c5fd' : '#2563eb', 
                            color: 'white', 
                            fontWeight: 'bold', 
                            borderRadius: '4px', 
                            cursor: loading ? 'not-allowed' : 'pointer', 
                            border: 'none',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} size={20} /> 
                                Processing...
                            </>
                        ) : (
                            'Pay with eSewa'
                        )}
                    </button>
                </form>

                {paymentStatus && (
                    <div style={{ 
                        marginTop: '1rem', 
                        textAlign: 'center', 
                        color: paymentStatus === 'success' ? 'green' : 'red' 
                    }}>
                        {paymentMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EsewaPayment;