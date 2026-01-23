// Features component: Displays key features, services, trust indicators, and quality assurance for Easy Health platform
import React from 'react';
import { Card, CardContent } from '../ui/card';

const Features = () => {
  const features = [
    {
      icon: '🏥',
      title: 'Expert Healthcare',
      description: 'Access certified healthcare professionals and experienced pharmacists.',
      color: 'var(--eh-primary)',
      bgcolor: 'rgba(0, 102, 204, 0.05)'
    },
    {
      icon: '🚚',
      title: 'Fast Delivery',
      description: 'Quick and secure delivery of medicines to your doorstep within 24 hours.',
      color: 'var(--eh-secondary)',
      bgcolor: 'rgba(255, 107, 53, 0.05)'
    },
    {
      icon: '💳',
      title: 'Flexible Payments',
      description: 'Cash on delivery, cards, mobile wallets, eSewa, and digital banking payment options.',
      color: 'var(--eh-info)',
      bgcolor: 'rgba(2, 136, 209, 0.05)'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Industry-standard encryption protects your health information.',
      color: 'var(--eh-success)',
      bgcolor: 'rgba(46, 125, 50, 0.05)'
    },
    {
      icon: '💬',
      title: 'Expert Support',
      description: 'Free consultations with health experts for personalized recommendations.',
      color: 'var(--eh-purple)',
      bgcolor: 'rgba(106, 27, 154, 0.05)'
    },
    {
      icon: '⭐',
      title: 'Quality Assured',
      description: 'All products verified and sourced from authorized, trusted suppliers.',
      color: 'var(--eh-teal)',
      bgcolor: 'rgba(0, 137, 123, 0.05)'
    },
  ];

  const services = [
    {
      title: 'Pharmacy Services',
      icon: '💊',
      items: ['Prescription Medicines', 'OTC Medications', 'Health Supplements', 'First Aid Kits'],
      color: 'var(--eh-primary)',
    },
  

    {
      title: 'Emergency Services',
      icon: '🚑',
      items: ['24/7 Ambulance', 'Emergency Support', 'Quick Consultation', 'Hospital Referral'],
      color: 'var(--eh-accent)',
    },
  ];

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      {/* Hero */}
      <div style={{ marginBottom: 'var(--eh-spacing-3xl)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌟</div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '12px', color: 'var(--eh-text-primary)' }}>
          Why Choose Easy Health?
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--eh-text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          We're committed to making healthcare accessible, affordable, and convenient for everyone.
        </p>
      </div>

      {/* Features Grid - 3 columns */}
      <div style={{ marginBottom: 'var(--eh-spacing-3xl)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--eh-spacing-2xl)' }}>
          {features.map((feature, idx) => (
            <Card key={idx} style={{ background: feature.bgcolor, borderTop: `4px solid ${feature.color}` }}>
              <CardContent style={{ textAlign: 'center', paddingTop: 'var(--eh-spacing-2xl)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: feature.color }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--eh-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ marginBottom: 'var(--eh-spacing-3xl)' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px', textAlign: 'center', color: 'var(--eh-text-primary)' }}>
          Our Comprehensive Services
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--eh-text-secondary)', textAlign: 'center', marginBottom: 'var(--eh-spacing-2xl)', maxWidth: '700px', margin: '0 auto 32px' }}>
          Complete healthcare solutions under one platform
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--eh-spacing-2xl)' }}>
          {services.map((service, idx) => (
            <Card key={idx} style={{ borderLeft: `5px solid ${service.color}` }}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--eh-spacing-lg)' }}>
                  <div style={{ fontSize: '2rem' }}>{service.icon}</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: service.color, margin: 0 }}>
                    {service.title}
                  </h3>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                  {service.items.map((item, itemIdx) => (
                    <li key={itemIdx} style={{ color: 'var(--eh-text-secondary)' }}>
                      <span style={{ color: service.color, marginRight: '8px', fontWeight: 700 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trust Section */}
      <Card style={{ background: 'linear-gradient(135deg, var(--eh-primary) 0%, var(--eh-secondary) 100%)' }}>
        <CardContent style={{ textAlign: 'center', color: 'white', paddingTop: 'var(--eh-spacing-3xl)', paddingBottom: 'var(--eh-spacing-3xl)' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', color: 'white' }}>
            Trusted by Healthcare Professionals
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: 'var(--eh-spacing-2xl)', opacity: 0.95, maxWidth: '600px', margin: '0 auto 32px' }}>
            Join thousands of patients who rely on Easy Health for their medical needs
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--eh-spacing-2xl)', marginTop: 'var(--eh-spacing-2xl)' }}>
            <div>
              <p style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 8px 0' }}>25K+</p>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem' }}>Happy Customers</p>
            </div>
            <div>
              <p style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 8px 0' }}>1000+</p>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem' }}>Products & Services</p>
            </div>
            <div>
              <p style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 8px 0' }}>24/7</p>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem' }}>Always Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Assurance */}
      <Card style={{ marginTop: 'var(--eh-spacing-3xl)', background: 'var(--eh-success-light)' }}>
        <CardContent>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-success)' }}>
            ✓ Quality & Safety Commitment
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--eh-spacing-lg)' }}>
            <div>
              <p style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--eh-text-primary)' }}>Certified Products</p>
              <p style={{ color: 'var(--eh-text-secondary)', lineHeight: 1.6 }}>
                All medicines and products are verified for authenticity and quality from authorized sources.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--eh-text-primary)' }}>Professional Team</p>
              <p style={{ color: 'var(--eh-text-secondary)', lineHeight: 1.6 }}>
                Licensed pharmacists and healthcare professionals review every order.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--eh-text-primary)' }}>Data Security</p>
              <p style={{ color: 'var(--eh-text-secondary)', lineHeight: 1.6 }}>
                Your health information is encrypted and protected with industry standards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Features;
