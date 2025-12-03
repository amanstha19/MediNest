import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const BookingPayment = ({ bookingId, initialAmount }) => {
    const [amount, setAmount] = useState(initialAmount || ''); // Allows for dynamic or manual input
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactionUuid, setTransactionUuid] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const uuid = `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setTransactionUuid(uuid);

        const params = new URLSearchParams(location.search);
        const encodedData = params.get('data');
        if (encodedData) {
            handlePaymentCallback(encodedData);
        }
    }, [location.search]);

    const handlePaymentCallback = async (encodedData) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/booking-payment/', {
                params: { data: encodedData }
            });

            if (response.data.status === 'success') {
                setPaymentStatus('success');
                setPaymentMessage('Payment successful! Redirecting to booking confirmation...');

                setTimeout(() => {
                    navigate(`/booking-success/${bookingId}`);
                }, 3000);
            } else {
                throw new Error(response.data.message || 'Payment verification failed');
            }
        } catch (error) {
            setPaymentStatus('failure');
            setPaymentMessage(error.response?.data?.message || 'Payment verification failed. Please try again.');
            setTimeout(() => {
                navigate('/booking-failed');
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
            const formData = {
                booking_id: bookingId,
                amount: Number(amount),
                transaction_uuid: transactionUuid
            };

            const response = await axios.post('/api/booking-payment/', formData);

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

            Object.entries(response.data).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            setError(error.response?.data?.message || 'Payment initialization failed');
            setLoading(false);
        }
    };

    // Inline styles object
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f3f4f6'
        },
        card: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '24rem'
        },
        heading: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1.5rem'
        },
        errorMessage: {
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            textAlign: 'center'
        },
        input: {
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            backgroundColor: '#f9fafb',
            border: '1px solid #d1d5db'
        },
        button: {
            width: '100%',
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            fontWeight: '600',
            borderRadius: '0.375rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            outline: 'none',
            transition: 'background-color 0.3s',
        },
        buttonDisabled: {
            opacity: '0.5',
            cursor: 'not-allowed'
        },
        statusMessage: {
            marginTop: '1rem',
            textAlign: 'center'
        },
        success: {
            color: '#10b981'
        },
        failure: {
            color: '#ef4444'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.heading}>eSewa Payment for Booking</h2>

                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Amount (NPR)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ ...styles.button, ...(loading && styles.buttonDisabled) }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Pay with eSewa'
                        )}
                    </button>
                </form>

                {paymentStatus && (
                    <div
                        style={{
                            ...styles.statusMessage,
                            ...(paymentStatus === 'success' ? styles.success : styles.failure)
                        }}
                    >
                        {paymentMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPayment;
