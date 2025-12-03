import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

const LabTestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTest, setExpandedTest] = useState(null);
  const navigate = useNavigate();

  const labTests = [
    {
      id: 1,
      name: 'Complete Blood Count (CBC)',
      price: 1200,
      description: 'Measures the number of red blood cells, white blood cells, and platelets in your blood.',
      duration: '15-20 minutes',
      preparation: 'No preparation required.',
      resultsTime: '1-2 days',
      icon: '🔴',
    },
    {
      id: 2,
      name: 'Lipid Profile',
      price: 1500,
      description: 'Measures cholesterol levels to assess the risk of heart disease.',
      duration: '10-15 minutes',
      preparation: 'Fasting for 12 hours prior to the test.',
      resultsTime: '1-2 days',
      icon: '❤️',
    },
    {
      id: 3,
      name: 'Blood Sugar Test',
      price: 800,
      description: 'Measures the glucose level in your blood to help diagnose diabetes.',
      duration: '5-10 minutes',
      preparation: 'Fasting for 8-10 hours prior to the test.',
      resultsTime: '1-2 days',
      icon: '🩸',
    },
  ];

  const filteredTests = labTests.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookTest = (testId) => {
    navigate(`/book-test/${testId}`);
  };

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      <div className="eh-hero" style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧪</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Laboratory Tests & Diagnostics</h1>
        <p>Comprehensive lab testing services with fast and accurate results.</p>
      </div>

      <div style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>
          Search Tests
        </label>
        <input
          type="search"
          placeholder="Search lab tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="eh-input"
          style={{ width: '100%', maxWidth: '500px' }}
        />
      </div>

      {filteredTests.length > 0 ? (
        <div className="eh-grid--2">
          {filteredTests.map((test) => (
            <Card key={test.id}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--eh-spacing-md)', marginBottom: 'var(--eh-spacing-md)' }}>
                  <div style={{ fontSize: '2rem' }}>{test.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--eh-text-primary)' }}>
                      {test.name}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>
                      {test.description}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: 'var(--eh-spacing-lg)',
                    paddingBottom: 'var(--eh-spacing-lg)',
                    borderBottom: '1px solid var(--eh-border)',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--eh-text-muted)', marginBottom: '4px' }}>Duration</p>
                    <p style={{ fontWeight: 600 }}>⏱️ {test.duration}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--eh-text-muted)', marginBottom: '4px' }}>Results</p>
                    <p style={{ fontWeight: 600 }}>📋 {test.resultsTime}</p>
                  </div>
                </div>

                {expandedTest === test.id && (
                  <div style={{ marginBottom: 'var(--eh-spacing-lg)', paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                      <strong>Preparation:</strong> {test.preparation}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--eh-text-muted)' }}>
                      <strong style={{ color: 'var(--eh-text-primary)' }}>Note:</strong> Follow preparation guidelines for accurate results.
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--eh-spacing-lg)', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>Price</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--eh-success)' }}>
                      NPR {test.price}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <Button
                      variant={expandedTest === test.id ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
                    >
                      {expandedTest === test.id ? 'Hide Details' : 'View Details'}
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleBookTest(test.id)}
                    >
                      Book Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent style={{ textAlign: 'center', padding: 'var(--eh-spacing-2xl)' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--eh-text-muted)' }}>
              No tests found
            </p>
          </CardContent>
        </Card>
      )}

      <Card style={{ marginTop: 'var(--eh-spacing-2xl)', background: 'rgba(15, 118, 110, 0.05)' }}>
        <CardContent>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--eh-spacing-md)', color: 'var(--eh-primary)' }}>
            ℹ️ Why Choose Our Lab?
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-md)' }}>
            <li style={{ paddingBottom: '12px' }}>✓ <strong>Certified Technicians</strong></li>
            <li style={{ paddingBottom: '12px' }}>✓ <strong>Accurate Results</strong></li>
            <li style={{ paddingBottom: '12px' }}>✓ <strong>Quick Sample Collection</strong></li>
            <li style={{ paddingBottom: '12px' }}>✓ <strong>Confidential Reports</strong></li>
            <li style={{ paddingBottom: '12px' }}>✓ <strong>Home Sample Collection</strong></li>
            <li style={{ paddingBottom: '12px' }}>✓ <strong>Affordable Pricing</strong></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabTestsPage;
