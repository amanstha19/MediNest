import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

const AllServicesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const allServices = [
    // Pharmacy & Medicines
    {
      id: 1,
      name: 'Pharmacy & Medicines',
      icon: '💊',
      category: 'pharmacy',
      description: 'Browse and order prescription medicines, OTC drugs, and supplements.',
      link: '/category/medicines',
      color: '#0066cc'
    },
    {
      id: 2,
      name: 'Medicine Delivery',
      icon: '🚚',
      category: 'pharmacy',
      description: 'Fast home delivery of medicines within 24-48 hours.',
      link: '/category/medicines',
      color: '#ff6b35'
    },

    // Lab & Diagnostics
    {
      id: 3,
      name: 'Lab Tests & Diagnostics',
      icon: '🧪',
      category: 'diagnostics',
      description: 'Book professional lab tests with home sample collection.',
      link: '/category/lab-tests',
      color: '#ff6b35'
    },
    {
      id: 4,
      name: 'Health Packages',
      icon: '📦',
      category: 'diagnostics',
      description: 'Comprehensive health check-up packages for all ages.',
      link: '/category/health-packages',
      color: '#6a1b9a'
    },

    // Emergency & Ambulance
    {
      id: 5,
      name: 'Emergency Ambulance',
      icon: '🚑',
      category: 'emergency',
      description: '24/7 emergency ambulance with certified technicians.',
      link: '/ambulance',
      color: '#d32f2f'
    },
    {
      id: 6,
      name: 'Emergency Care',
      icon: '🏥',
      category: 'emergency',
      description: 'Instant emergency medical assistance and advice.',
      link: '/ambulance',
      color: '#d32f2f'
    },

    // Doctor Consultation (Coming Soon)
    {
      id: 7,
      name: 'Doctor Consultation',
      icon: '👨‍⚕️',
      category: 'consultation',
      description: 'Video/Chat consultation with licensed doctors.',
      link: '#',
      color: '#00897b',
      comingSoon: true
    },
    {
      id: 8,
      name: 'Online Appointment',
      icon: '📅',
      category: 'consultation',
      description: 'Book appointments with top specialists.',
      link: '#',
      color: '#00897b',
      comingSoon: true
    },

    // Health Records
    {
      id: 9,
      name: 'Health Records',
      icon: '📋',
      category: 'records',
      description: 'Store and manage your medical records securely.',
      link: '#',
      color: '#2e7d32',
      comingSoon: true
    },
    {
      id: 10,
      name: 'Prescription Upload',
      icon: '📸',
      category: 'records',
      description: 'Upload and store your prescriptions digitally.',
      link: '#',
      color: '#2e7d32',
      comingSoon: true
    },

    // Wellness & Prevention
    {
      id: 11,
      name: 'Fitness & Wellness',
      icon: '🏃',
      category: 'wellness',
      description: 'Personalized fitness plans and wellness guides.',
      link: '#',
      color: '#1976d2',
      comingSoon: true
    },
    {
      id: 12,
      name: 'Mental Health Support',
      icon: '🧠',
      category: 'wellness',
      description: 'Counseling and mental health support services.',
      link: '#',
      color: '#1976d2',
      comingSoon: true
    },

    // Home Services
    {
      id: 13,
      name: 'Vaccination at Home',
      icon: '💉',
      category: 'home-services',
      description: 'Get vaccinated at your home with professional staff.',
      link: '#',
      color: '#c2185b',
      comingSoon: true
    },
    {
      id: 14,
      name: 'Health Monitoring',
      icon: '⌚',
      category: 'home-services',
      description: 'Regular health check-ups and monitoring at home.',
      link: '#',
      color: '#c2185b',
      comingSoon: true
    },

    // Insurance & Billing
    {
      id: 15,
      name: 'Health Insurance',
      icon: '🛡️',
      category: 'insurance',
      description: 'Affordable health insurance plans for everyone.',
      link: '#',
      color: '#f57c00',
      comingSoon: true
    },
    {
      id: 16,
      name: 'Medical Reimbursement',
      icon: '💳',
      category: 'insurance',
      description: 'Easy claims and reimbursement process.',
      link: '#',
      color: '#f57c00',
      comingSoon: true
    },
  ];

  const categories = [
    { value: 'all', label: '🌍 All Services' },
    { value: 'pharmacy', label: '💊 Pharmacy' },
    { value: 'diagnostics', label: '🧪 Diagnostics' },
    { value: 'emergency', label: '🚑 Emergency' },
    { value: 'consultation', label: '👨‍⚕️ Consultation' },
    { value: 'records', label: '📋 Records' },
    { value: 'wellness', label: '🏃 Wellness' },
    { value: 'home-services', label: '🏠 Home Services' },
    { value: 'insurance', label: '🛡️ Insurance' },
  ];

  const filteredServices = selectedCategory === 'all' 
    ? allServices 
    : allServices.filter(service => service.category === selectedCategory);

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      {/* Hero Section */}
      <div className="eh-hero" style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🏥</div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: 800 }}>
          Complete Healthcare Solutions
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--eh-text-secondary)', maxWidth: '600px' }}>
          Everything you need for your health - from medicines and diagnostics to doctor consultations and emergency care, all in one platform.
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: 'var(--eh-spacing-2xl)', overflowX: 'auto', paddingBottom: 'var(--eh-spacing-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--eh-spacing-md)', minWidth: 'min-content' }}>
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              style={{
                padding: 'var(--eh-spacing-md) var(--eh-spacing-lg)',
                background: selectedCategory === category.value 
                  ? 'linear-gradient(135deg, var(--eh-primary) 0%, var(--eh-secondary) 100%)' 
                  : 'var(--eh-surface)',
                color: selectedCategory === category.value ? 'white' : 'var(--eh-text-primary)',
                border: selectedCategory === category.value 
                  ? 'none' 
                  : '2px solid var(--eh-border)',
                borderRadius: 'var(--eh-radius-lg)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.value) {
                  e.target.style.borderColor = 'var(--eh-primary)';
                  e.target.style.background = 'rgba(0, 102, 204, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.value) {
                  e.target.style.borderColor = 'var(--eh-border)';
                  e.target.style.background = 'var(--eh-surface)';
                }
              }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--eh-spacing-xl)', marginBottom: 'var(--eh-spacing-2xl)' }}>
        {filteredServices.map(service => (
          <Card
            key={service.id}
            style={{
              borderTop: `5px solid ${service.color}`,
              opacity: service.comingSoon ? 0.7 : 1,
              position: 'relative',
            }}
          >
            {service.comingSoon && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'var(--eh-warning)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                zIndex: 10
              }}>
                COMING SOON
              </div>
            )}
            <CardContent style={{ padding: 'var(--eh-spacing-lg)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                {service.icon}
              </div>
              <h3 style={{ 
                fontSize: '1.2rem', 
                fontWeight: 700, 
                marginBottom: '8px', 
                color: service.color 
              }}>
                {service.name}
              </h3>
              <p style={{ 
                fontSize: '0.95rem', 
                color: 'var(--eh-text-secondary)', 
                marginBottom: 'var(--eh-spacing-lg)',
                lineHeight: '1.6'
              }}>
                {service.description}
              </p>
              
              <Link to={service.link} style={{ textDecoration: 'none' }}>
                <Button 
                  variant={service.comingSoon ? 'outline' : 'primary'}
                  size="md"
                  style={{ width: '100%' }}
                  disabled={service.comingSoon}
                >
                  {service.comingSoon ? '🔔 Notify Me' : 'Explore →'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <Card style={{ background: 'linear-gradient(135deg, var(--eh-primary) 0%, var(--eh-secondary) 100%)', color: 'white' }}>
        <CardContent style={{ padding: 'var(--eh-spacing-2xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--eh-spacing-2xl)', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>1000+</div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Medicines & Products</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>50+</div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Lab Tests Available</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>24/7</div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Emergency Service</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>100K+</div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Happy Customers</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllServicesPage;
