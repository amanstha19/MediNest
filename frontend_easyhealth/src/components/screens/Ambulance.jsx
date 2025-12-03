import React from 'react';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

const ambulanceServices = [
  { name: 'Nepal Ambulance Service', contact: '01-4427833, 102', location: 'Ghattekulo Marg, Kathmandu', phone: '01-4427833' },
  { name: 'Akhil Nepal Chiya Majdur Sangh', contact: '9814952000', location: 'Jhapa', phone: '9814952000' },
  { name: 'Ambulance Lalitpur Municipality', contact: '9841202641, 01-5527003', location: 'Pulchowk, Lalitpur', phone: '9841202641' },
  { name: 'Ambulance Service Siddhartha Club', contact: '061530200, 061521433', location: 'Siddhartha Chowk, Pokhara', phone: '061530200' },
  { name: 'Sanjivini Ayurvedic Prakritik Chikitsaylaya', contact: '9848554800', location: 'Chitwan', phone: '9848554800' },
  { name: 'B. P. Smriti Hospital', contact: '9841447710', location: 'Basundhara, Kathmandu', phone: '9841447710' },
];

const AmbulanceCard = ({ service }) => (
  <Card>
    <CardContent>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--eh-primary)' }}>
        🚑 {service.name}
      </h3>
      <div style={{ display: 'grid', gap: '8px', marginBottom: 'var(--eh-spacing-lg)' }}>
        <div>
          <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Location</p>
          <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>📍 {service.location}</p>
        </div>
        <div>
          <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Contact</p>
          <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>📞 {service.contact}</p>
        </div>
      </div>
      <a href={`tel:${service.phone.split(',')[0]}`} style={{ textDecoration: 'none' }}>
        <Button variant="success" className="eh-btn--block" size="sm">
          Call Now
        </Button>
      </a>
    </CardContent>
  </Card>
);

function Ambulance() {
  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      <div className="eh-hero" style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚑</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Emergency Ambulance Services</h1>
        <p>Quick access to emergency ambulance services across Nepal. Save these numbers for emergency.</p>
      </div>

      <div style={{ marginBottom: 'var(--eh-spacing-2xl)', padding: 'var(--eh-spacing-lg)', background: 'var(--eh-surface)', borderRadius: 'var(--eh-radius)', border: '2px solid var(--eh-accent)' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--eh-spacing-md)' }}>
          <div style={{ fontSize: '1.5rem' }}>⚠️</div>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--eh-accent)' }}>In Case of Emergency</h3>
            <p style={{ color: 'var(--eh-text-secondary)', marginBottom: '8px' }}>Call the nearest ambulance service immediately. Emergency response time may vary based on location and traffic conditions.</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>For general inquiries about non-emergency services, you can also book through our website.</p>
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--eh-spacing-lg)' }}>Available Ambulance Services</h2>
        <div className="eh-grid--3">
          {ambulanceServices.map((service, idx) => (
            <AmbulanceCard key={idx} service={service} />
          ))}
        </div>
      </div>

      <Card style={{ marginTop: 'var(--eh-spacing-2xl)', background: 'rgba(15, 118, 110, 0.05)' }}>
        <CardContent>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--eh-primary)' }}>Tips for Emergency</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-md)' }}>
            <li style={{ padding: 'var(--eh-spacing-md)', background: 'white', borderRadius: 'var(--eh-radius-sm)', border: '1px solid var(--eh-border)' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>✓ Stay Calm</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>Take a deep breath and try to remain calm.</p>
            </li>
            <li style={{ padding: 'var(--eh-spacing-md)', background: 'white', borderRadius: 'var(--eh-radius-sm)', border: '1px solid var(--eh-border)' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>✓ Provide Location</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>Give clear landmarks or address to dispatcher.</p>
            </li>
            <li style={{ padding: 'var(--eh-spacing-md)', background: 'white', borderRadius: 'var(--eh-radius-sm)', border: '1px solid var(--eh-border)' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>✓ Follow Instructions</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>Follow the dispatcher's instructions carefully.</p>
            </li>
            <li style={{ padding: 'var(--eh-spacing-md)', background: 'white', borderRadius: 'var(--eh-radius-sm)', border: '1px solid var(--eh-border)' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>✓ Have Info Ready</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>Have patient details and medical history ready.</p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default Ambulance;
