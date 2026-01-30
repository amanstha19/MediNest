import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%' }}>
        <div className="eh-center" style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--eh-spacing-md)' }}>❌</div>
          <h1 style={{ fontSize: '2rem', color: 'var(--eh-error)', marginBottom: 'var(--eh-spacing-md)' }}>Payment Failed</h1>
          <p style={{ color: 'var(--eh-text-muted)', fontSize: '1.1rem' }}>
            Your payment could not be processed. Please try again or use a different payment method.
          </p>
        </div>

        <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
          <CardContent>
            <div style={{ display: 'grid', gap: 'var(--eh-spacing-lg)', marginTop: 'var(--eh-spacing-xl)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-md)' }}>
                <Button variant="primary" onClick={() => navigate('/cart')}>
                  Back to Cart
                </Button>
                <Button variant="secondary" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailure;

