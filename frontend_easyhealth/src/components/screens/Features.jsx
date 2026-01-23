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
    <div className="mui-container py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="text-6xl mb-4">🌟</div>
        <h1 className="text-4xl font-bold mb-4 text-primary">
          Why Choose Easy Health?
        </h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
          We're committed to making healthcare accessible, affordable, and convenient for everyone.
        </p>
      </div>

      {/* Features Grid - 3 columns */}
      <div className="mb-16">
        <div className="mui-grid--3">
          {features.map((feature, idx) => (
            <Card key={idx} style={{ background: feature.bgcolor, borderTop: `4px solid ${feature.color}` }}>
              <CardContent className="text-center pt-8">
                <div className="text-6xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: feature.color }}>
                  {feature.title}
                </h3>
                <p className="text-secondary leading-relaxed">
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
      <Card className="mui-card" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
        <CardContent className="text-center py-16">
          <h2 className="text-4xl font-bold mb-3">
            Trusted by Healthcare Professionals
          </h2>
          <p className="text-lg mb-12 opacity-90 max-w-2xl mx-auto">
            Join thousands of patients who rely on Easy Health for their medical needs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <p className="text-4xl font-bold mb-2">25K+</p>
              <p className="opacity-90">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">1000+</p>
              <p className="opacity-90">Products & Services</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">24/7</p>
              <p className="opacity-90">Always Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Assurance */}
      <Card className="mui-card mt-16" style={{ background: 'var(--success-soft)' }}>
        <CardContent>
          <h3 className="text-2xl font-bold mb-8 text-success">
            ✓ Quality & Safety Commitment
          </h3>
          <div className="mui-grid--3">
            <div>
              <p className="font-bold mb-3 text-primary">Certified Products</p>
              <p className="text-secondary leading-relaxed">
                All medicines and products are verified for authenticity and quality from authorized sources.
              </p>
            </div>
            <div>
              <p className="font-bold mb-3 text-primary">Professional Team</p>
              <p className="text-secondary leading-relaxed">
                Licensed pharmacists and healthcare professionals review every order.
              </p>
            </div>
            <div>
              <p className="font-bold mb-3 text-primary">Data Security</p>
              <p className="text-secondary leading-relaxed">
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
