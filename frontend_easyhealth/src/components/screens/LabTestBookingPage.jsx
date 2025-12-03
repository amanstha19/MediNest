import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';
import BookingPayment from './BookingPayment';

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
      setShowPayment(true);
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
        setReports(response.data.reports);
      }
    } catch (err) {
      setError('Failed to check status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      <div style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
        <div style={{ display: 'flex', gap: 'var(--eh-spacing-md)', borderBottom: '2px solid var(--eh-border)', marginBottom: 'var(--eh-spacing-lg)' }}>
          <button
            onClick={() => { setActiveTab('booking'); setError(null); }}
            style={{
              padding: 'var(--eh-spacing-md) var(--eh-spacing-lg)',
              background: activeTab === 'booking' ? 'var(--eh-primary)' : 'transparent',
              color: activeTab === 'booking' ? 'white' : 'var(--eh-text-primary)',
              border: 'none',
              borderRadius: 'var(--eh-radius-sm)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            📅 Book Appointment
          </button>
          <button
            onClick={() => { setActiveTab('status'); setError(null); }}
            style={{
              padding: 'var(--eh-spacing-md) var(--eh-spacing-lg)',
              background: activeTab === 'status' ? 'var(--eh-primary)' : 'transparent',
              color: activeTab === 'status' ? 'white' : 'var(--eh-text-primary)',
              border: 'none',
              borderRadius: 'var(--eh-radius-sm)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            📋 Check Status
          </button>
        </div>
      </div>

      {activeTab === 'booking' ? (
        <Card>
          <CardContent>
            <h2 style={{ fontSize: '1.8rem', marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-text-primary)' }}>
              Book a Lab Test
            </h2>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid var(--eh-accent)', borderRadius: 'var(--eh-radius)', padding: 'var(--eh-spacing-md)', marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-accent)' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '2px solid var(--eh-success)', borderRadius: 'var(--eh-radius)', padding: 'var(--eh-spacing-md)', marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-success)' }}>
                ✓ Booking submitted successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--eh-spacing-lg)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-lg)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="eh-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Mobile Number *</label>
                  <input
                    type="text"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    className="eh-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-lg)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="eh-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Test Service *</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="eh-input"
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - NPR {service.price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-lg)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Booking Date *</label>
                  <input
                    type="date"
                    name="booking_date"
                    value={formData.booking_date}
                    onChange={handleChange}
                    className="eh-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Appointment Time *</label>
                  <input
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    className="eh-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="eh-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="eh-input"
                  rows="3"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                  required
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: 'var(--eh-text-secondary)' }}>
                  I agree to the terms and conditions *
                </span>
              </label>

              <div style={{ display: 'flex', gap: 'var(--eh-spacing-lg)' }}>
                <Button
                  variant="success"
                  size="md"
                  disabled={loading || !formData.agreedToTerms}
                  style={{ flex: 1 }}
                >
                  {loading ? '⏳ Submitting...' : '✓ Book Appointment'}
                </Button>
              </div>
            </form>

            {showPayment && bookingId && (
              <div style={{ marginTop: 'var(--eh-spacing-2xl)', paddingTop: 'var(--eh-spacing-2xl)', borderTop: '2px solid var(--eh-border)' }}>
                <BookingPayment 
                  bookingId={bookingId} 
                  amount={services.find(s => s.id === parseInt(formData.service))?.price || 0}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <h2 style={{ fontSize: '1.8rem', marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-text-primary)' }}>
              Check Appointment Status
            </h2>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid var(--eh-accent)', borderRadius: 'var(--eh-radius)', padding: 'var(--eh-spacing-md)', marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-accent)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleStatusCheck} style={{ display: 'grid', gap: 'var(--eh-spacing-lg)', maxWidth: '500px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Email *</label>
                <input
                  type="email"
                  value={statusCheck.email}
                  onChange={(e) => setStatusCheck({ ...statusCheck, email: e.target.value })}
                  className="eh-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Mobile Number *</label>
                <input
                  type="text"
                  value={statusCheck.mobile_number}
                  onChange={(e) => setStatusCheck({ ...statusCheck, mobile_number: e.target.value })}
                  className="eh-input"
                  required
                />
              </div>

              <Button variant="primary" size="md" disabled={loading}>
                {loading ? '⏳ Checking...' : '🔍 Check Status'}
              </Button>
            </form>

            {bookingStatus && (
              <div style={{ marginTop: 'var(--eh-spacing-lg)', padding: 'var(--eh-spacing-lg)', background: 'rgba(15, 118, 110, 0.05)', borderRadius: 'var(--eh-radius)' }}>
                <p style={{ color: 'var(--eh-text-primary)' }}>
                  {typeof bookingStatus === 'string' ? bookingStatus : JSON.stringify(bookingStatus)}
                </p>
              </div>
            )}

            {reports.length > 0 && (
              <Card style={{ marginTop: 'var(--eh-spacing-lg)' }}>
                <CardContent>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-primary)' }}>
                    📄 Reports
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--eh-spacing-md)' }}>
                    {reports.map((report, index) => (
                      <div key={index} style={{ padding: 'var(--eh-spacing-md)', background: 'white', border: '1px solid var(--eh-border)', borderRadius: 'var(--eh-radius-sm)' }}>
                        {report}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LabTestBookingPage;
