import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

const HealthPackagesPage = () => {
  const [expandedPackage, setExpandedPackage] = useState(null);

  const packages = [
    {
      id: 1,
      name: 'Basic Health Checkup',
      price: 2500,
      description: 'Essential health screening to ensure you are in good health.',
      icon: '✅',
      badge: 'Popular',
      tests: [
        'Complete Blood Count (CBC)',
        'Blood Sugar Test',
        'Cholesterol Test',
        'Liver Function Test',
      ],
      benefits: [
        'Early detection of potential health issues',
        'Affordable for regular checkups',
        'Quick and easy testing',
      ],
    },
    {
      id: 2,
      name: 'Comprehensive Health Checkup',
      price: 5000,
      description: 'Detailed health checkup with wide range of tests for complete health picture.',
      icon: '⭐',
      badge: 'Best Value',
      tests: [
        'Complete Blood Count (CBC)',
        'Blood Sugar Test',
        'Lipid Profile',
        'Kidney Function Test',
        'Thyroid Function Test',
        'Urine Analysis',
        'Chest X-Ray',
      ],
      benefits: [
        'Thorough testing for early disease detection',
        'Complete overview of your health',
        'Includes imaging tests like Chest X-ray',
      ],
    },
    {
      id: 3,
      name: 'Senior Citizen Health Package',
      price: 4000,
      description: 'Specialized package for seniors focusing on age-related health concerns.',
      icon: '👴',
      badge: 'Specialized',
      tests: [
        'Blood Pressure Monitoring',
        'Complete Blood Count (CBC)',
        'Kidney Function Test',
        'Bone Density Test',
        'Electrocardiogram (ECG)',
      ],
      benefits: [
        'Tailored for seniors\' unique health needs',
        'Helps monitor chronic conditions',
        'Includes tests for bone density and heart health',
      ],
    },
  ];

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      <div className="eh-hero" style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💪</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Health Packages</h1>
        <p>Comprehensive health screening packages tailored to your needs.</p>
      </div>

      <div className="eh-grid--3">
        {packages.map((pkg) => (
          <Card key={pkg.id} style={{ position: 'relative', overflow: 'hidden' }}>
            {pkg.badge && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--eh-accent)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 'var(--eh-radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  zIndex: 10,
                }}
              >
                {pkg.badge}
              </div>
            )}
            <CardContent style={{ paddingBottom: 'var(--eh-spacing-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--eh-spacing-lg)' }}>
                <div style={{ fontSize: '2.5rem' }}>{pkg.icon}</div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--eh-text-primary)' }}>
                  {pkg.name}
                </h3>
              </div>

              <p style={{ color: 'var(--eh-text-secondary)', marginBottom: 'var(--eh-spacing-md)' }}>
                {pkg.description}
              </p>

              <div style={{ marginBottom: 'var(--eh-spacing-lg)', paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--eh-text-primary)' }}>Price</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--eh-success)' }}>
                  NPR {pkg.price.toLocaleString()}
                </p>
              </div>

              {expandedPackage === pkg.id && (
                <div style={{ marginBottom: 'var(--eh-spacing-lg)', paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                  <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--eh-text-primary)' }}>Tests Included:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 'var(--eh-spacing-lg)' }}>
                    {pkg.tests.map((test, idx) => (
                      <li key={idx} style={{ paddingBottom: '6px', color: 'var(--eh-text-secondary)' }}>
                        ✓ {test}
                      </li>
                    ))}
                  </ul>

                  <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--eh-text-primary)' }}>Benefits:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {pkg.benefits.map((benefit, idx) => (
                      <li key={idx} style={{ paddingBottom: '6px', color: 'var(--eh-text-secondary)' }}>
                        ✓ {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                variant={expandedPackage === pkg.id ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)}
                style={{ width: '100%', marginBottom: '8px' }}
              >
                {expandedPackage === pkg.id ? 'Show Less' : 'View Details'}
              </Button>
              <Button variant="success" size="sm" style={{ width: '100%' }}>
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: 'var(--eh-spacing-2xl)', background: 'rgba(15, 118, 110, 0.05)' }}>
        <CardContent>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--eh-spacing-lg)', color: 'var(--eh-primary)' }}>
            Why Choose Our Health Packages?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-lg)' }}>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>✓ Comprehensive Coverage</p>
              <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.95rem' }}>Covers all major health aspects with carefully selected tests.</p>
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>✓ Affordable Pricing</p>
              <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.95rem' }}>Great value packages at competitive rates.</p>
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>✓ Expert Technicians</p>
              <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.95rem' }}>Certified and experienced lab technicians.</p>
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>✓ Fast Results</p>
              <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.95rem' }}>Get your results quickly and securely online.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthPackagesPage;
