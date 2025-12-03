import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Spinner, Alert, Button, Card } from 'react-bootstrap';

const PaymentStatus = () => {
  const location = useLocation();
  const [status, setStatus] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    const data = queryParams.get('data');

    if (status && data) {
      setStatus(status);
      setData(data);
      setLoading(false);
    } else {
      setError('Invalid callback data');
      setLoading(false);
    }
  }, [location.search]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        {error}
      </Alert>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Payment Status</h1>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Payment Status: {status}</Card.Title>
          <Card.Text>
            <strong>Transaction Data:</strong> {data}
          </Card.Text>
          <Button variant="primary" href="/" className="mt-3">
            Back to Home
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentStatus;
