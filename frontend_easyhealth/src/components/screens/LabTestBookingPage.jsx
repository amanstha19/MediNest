import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import BookingPayment from './BookingPayment'; // Import your payment component

const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const LabTestBookingPage = () => {
  const [activeTab, setActiveTab] = useState('booking');
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    email: '',
    service: '',
    booking_date: '',
    appointment_time: '',
    address: '',
    notes: '',
    agreedToTerms: false,
  });

  const [statusCheck, setStatusCheck] = useState({
    email: '',
    mobile_number: ''
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [reports, setReports] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const api = axios.create({
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services/');
      setServices(response.data);
    } catch (err) {
      setError(`Failed to fetch services: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'email' || name === 'mobile_number') {
      setStatusCheck({ ...statusCheck, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const submitData = {
      ...formData,
      service: parseInt(formData.service),
    };
    delete submitData.agreedToTerms;

    try {
      const response = await api.post('/api/bookings/', submitData);
      setSuccess(true);
      setBookingId(response.data.id);
      setShowPayment(true); // Show payment option after booking
    } catch (err) {
      if (err.response?.data?.error === 'This time slot is already booked') {
        setError('The selected time slot is already booked. Please choose another time.');
      } else {
        setError(err.response?.data?.error || 'Failed to create booking');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/bookings/status?email=${statusCheck.email}&mobile_number=${statusCheck.mobile_number}`);
      if (response.data.status === 'no booking') {
        setBookingStatus('No booking found with the provided information.');
      } else {
        setBookingStatus(response.data);
        setReports(response.data.reports); // Assuming response includes reports
      }
    } catch (err) {
      setError('Failed to check status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <div className="mb-4">
        <Button
          variant={activeTab === 'booking' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setActiveTab('booking')}
        >
          Book Appointment
        </Button>
        <Button
          variant={activeTab === 'status' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveTab('status')}
        >
          Check Status
        </Button>
      </div>

      {activeTab === 'booking' ? (
        <>
          <h2 className="text-center mb-4">Book an Appointment</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Booking submitted successfully!</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Service</Form.Label>
              <Form.Control
                as="select"
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Booking Date</Form.Label>
              <Form.Control
                type="date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Appointment Time</Form.Label>
              <Form.Control
                type="time"
                name="appointment_time"
                value={formData.appointment_time}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="I agree to the terms and conditions"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={loading || !formData.agreedToTerms}
            >
              {loading ? 'Submitting...' : 'Book Appointment'}
            </Button>
          </Form>

          {/* Payment Component */}
          {showPayment && bookingId && (
            <BookingPayment 
              bookingId={bookingId} 
              amount={services.find(s => s.id === parseInt(formData.service))?.price || 0}
            />
          )}
        </>
      ) : (
        <>
          <h2 className="text-center mb-4">Check Appointment Status</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {bookingStatus && <Alert variant="info">{bookingStatus}</Alert>}
          <Form onSubmit={handleStatusCheck}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={statusCheck.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="mobile_number"
                value={statusCheck.mobile_number}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Status'}
            </Button>
          </Form>

          {/* Display reports */}
          {reports.length > 0 && (
            <Card className="mt-4">
              <Card.Header>Reports</Card.Header>
              <Card.Body>
                {reports.map((report, index) => (
                  <p key={index}>{report}</p>
                ))}
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default LabTestBookingPage;