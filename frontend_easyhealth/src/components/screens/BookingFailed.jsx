import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

const BookingFailed = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // For now, we'll just show a failure message since we don't have individual booking fetch
        // In a real app, you'd want an endpoint to fetch individual booking by ID
        setBookingDetails({ id: bookingId });
      } catch (error) {
        setError('There was an error processing your booking.');
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

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
      {bookingDetails ? (
        <div style={{ width: '100%' }}>
          <div className="eh-center" style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--eh-spacing-md)' }}>❌</div>
            <h1 style={{ fontSize: '2rem', color: 'var(--eh-error)', marginBottom: 'var(--eh-spacing-md)' }}>Payment Failed!</h1>
            <p style={{ color: 'var(--eh-text-muted)', fontSize: '1.1rem' }}>Unfortunately, your payment could not be processed. Please try again.</p>
          </div>

          <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
            <CardContent>
              <div style={{ display: 'grid', gap: 'var(--eh-spacing-lg)' }}>
                <div style={{ paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Booking ID</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{bookingDetails.id}</p>
                </div>

                <div style={{ paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Status</p>
                  <span style={{ background: 'var(--eh-error)', color: 'white', padding: '6px 12px', borderRadius: 'var(--eh-radius-sm)', fontWeight: 600 }}>
                    Payment Failed
                  </span>
                </div>

                <div>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>What happened?</p>
                  <p style={{ fontSize: '1rem' }}>
                    Your payment was not successful. This could be due to insufficient funds, network issues, or other payment processing errors.
                    Your booking has not been confirmed and no charges have been made.
                  </p>
                </div>

                <div>
                  <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Next Steps</p>
                  <p style={{ fontSize: '1rem' }}>
                    Please check your payment details and try again. If the problem persists, contact our support team.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-md)', marginTop: 'var(--eh-spacing-2xl)' }}>
                <Button variant="primary" onClick={() => navigate('/book-test/1')}>Try Payment Again</Button>
                <Button variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="eh-center">
          <div className="eh-alert eh-alert--warning">No booking details found.</div>
          <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      )}
    </div>
  );
};

export default BookingFailed;
