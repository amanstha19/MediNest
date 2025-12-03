import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const keyServices = [
    { 
      name: 'Pharmacy & Medicines', 
      icon: '💊', 
      desc: 'Browse and order from a wide range of prescription medicines, OTC drugs, and health supplements.',
      link: '/category/medicines',
      color: 'var(--eh-primary)'
    },
    { 
      name: 'Lab Tests & Diagnostics', 
      icon: '🧪', 
      desc: 'Book professional lab tests online with home sample collection and instant online reports.',
      link: '/category/lab-tests',
      color: 'var(--eh-secondary)'
    },
    { 
      name: 'Emergency Ambulance', 
      icon: '🚑', 
      desc: '24/7 emergency ambulance services with certified technicians and fast response times.',
      link: '/ambulance',
      color: 'var(--eh-accent)'
    },
  ];

  const tips = [
    { title: '🚰 Hydration', desc: 'Drink 2-3 liters of water daily. It kickstarts metabolism and keeps you energized!' },
    { title: '🥗 Healthy Eating', desc: 'Incorporate leafy greens into your diet. They\'re packed with vitamins and minerals!' },
    { title: '🏃 Exercise Routine', desc: 'Regular physical activity improves mood, reduces stress, and maintains healthy weight.' },
  ];

  return (
    <div className="eh-bg">
      {/* Hero Section - BIG & BOLD */}
      <div className="eh-hero" style={{ marginBottom: 0 }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⚕️</div>
        <h1>Your Trusted Online Healthcare Companion</h1>
        <p>Medicines, Lab Tests, Emergency Services - Everything You Need for Your Health, Available 24/7</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
          <Link to="/medicines" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="lg">🛒 Shop Medicines</Button>
          </Link>
          <Link to="/lab-tests" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="lg">📋 Book Test</Button>
          </Link>
        </div>
      </div>

      <div className="eh-container">
        {/* KEY SERVICES - Main Feature Section */}
        <div style={{ marginBottom: 'var(--eh-spacing-3xl)' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px', color: 'var(--eh-text-primary)' }}>
            Our Key Services
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--eh-text-secondary)', marginBottom: 'var(--eh-spacing-2xl)', maxWidth: '800px' }}>
            Comprehensive healthcare solutions tailored for your needs. Quick, reliable, and always available.
          </p>

          {/* Vertical Stack of Key Services */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--eh-spacing-2xl)' }}>
            {keyServices.map((service, idx) => (
              <Card key={idx} style={{ borderLeft: `5px solid ${service.color}` }}>
                <CardContent style={{ padding: 'var(--eh-spacing-2xl)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 'var(--eh-spacing-2xl)', alignItems: 'center' }}>
                    {/* Left Icon */}
                    <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                      {service.icon}
                    </div>

                    {/* Middle Content */}
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: service.color }}>
                        {service.name}
                      </h3>
                      <p style={{ fontSize: '1rem', color: 'var(--eh-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {service.desc}
                      </p>
                    </div>

                    {/* Right Button */}
                    <Link to={service.link} style={{ textDecoration: 'none' }}>
                      <Button 
                        variant={service.color === 'var(--eh-primary)' ? 'primary' : service.color === 'var(--eh-secondary)' ? 'secondary' : 'danger'} 
                        size="lg"
                      >
                        Explore →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="eh-section">
          <h2>Popular Products</h2>
          <p style={{ color: 'var(--eh-text-secondary)', marginBottom: 'var(--eh-spacing-xl)', fontSize: '1.05rem' }}>
            Curated selection of top-rated health products
          </p>
          
          {loading ? (
            <div className="eh-center" style={{ padding: '40px' }}>
              <div className="eh-loader" style={{ margin: '0 auto' }}></div>
            </div>
          ) : products.length > 0 ? (
            <div className="eh-grid">
              {products.slice(0, 8).map((product) => (
                <Card key={product.id}>
                  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="eh-card__media">
                      {product.image ? (
                        <img src={`http://127.0.0.1:8000${product.image}`} alt={product.generic_name} />
                      ) : (
                        <div className="eh-center">No image</div>
                      )}
                    </div>
                    <CardContent>
                      <h3 className="eh-card__title">{product.generic_name}</h3>
                      <p className="eh-card__meta">Category: {product.category}</p>
                      <p className="eh-card__price">NPR {product.price || 'N/A'}</p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <p className="eh-center" style={{ padding: '40px' }}>No products available.</p>
          )}
        </div>

        {/* Health Tips Section */}
        <div style={{ background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)', borderRadius: 'var(--eh-radius-lg)', padding: 'var(--eh-spacing-2xl) var(--eh-spacing-lg)', marginBottom: 'var(--eh-spacing-2xl)' }}>
          <h2 style={{ marginBottom: 'var(--eh-spacing-xl)' }}>💡 Health Tips & Insights</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--eh-spacing-xl)' }}>
            {tips.map((tip, idx) => (
              <Card key={idx}>
                <CardContent style={{ paddingTop: 'var(--eh-spacing-xl)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--eh-primary)' }}>
                    {tip.title}
                  </h3>
                  <p style={{ color: 'var(--eh-text-secondary)', lineHeight: 1.6 }}>
                    {tip.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card style={{ background: 'linear-gradient(135deg, var(--eh-primary) 0%, var(--eh-secondary) 100%)', color: 'white' }}>
          <CardContent style={{ textAlign: 'center', padding: 'var(--eh-spacing-3xl) var(--eh-spacing-2xl)' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '12px', color: 'white' }}>
              Need Medical Assistance?
            </h2>
            <p style={{ fontSize: '1.1rem', marginBottom: 'var(--eh-spacing-2xl)', opacity: 0.95 }}>
              Our team of healthcare professionals is available 24/7 to help you.
            </p>
            <div style={{ display: 'flex', gap: 'var(--eh-spacing-lg)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="secondary" size="lg">📞 Call Support</Button>
              <Button variant="secondary" size="lg">💬 Chat with Doctor</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HomeScreen;
