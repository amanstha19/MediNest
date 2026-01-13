import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';
import './pages.css';

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
      link: '/category/medicines'
    },
    { 
      name: 'Emergency Ambulance', 
      icon: '🚑', 
      desc: '24/7 emergency ambulance services with certified technicians and fast response times.',
      link: '/ambulance'
    },
  ];

  const tips = [
    { title: '💧 Hydration', desc: 'Drink 2-3 liters of water daily. It kickstarts metabolism and keeps you energized!' },
    { title: '🥗 Healthy Eating', desc: 'Incorporate leafy greens into your diet. They are packed with vitamins and minerals!' },
    { title: '🏃 Exercise', desc: 'Regular physical activity improves mood, reduces stress, and maintains healthy weight.' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <motion.div
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.div className="hero-icon" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            ⚕️
          </motion.div>
          <motion.h1 className="hero-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            Your Healthcare Revolution
          </motion.h1>
          <p className="hero-subtitle">
            Medicines • Lab Tests • Emergency Services<br />
            Everything for your health, delivered instantly
          </p>
          <div className="hero-buttons">
            <Link to="/category/medicines">
              <Button variant="glass" size="lg">🛒 Shop Medicines</Button>
            </Link>
            <Link to="/ambulance">
              <Button variant="glass" size="lg">🚑 Emergency</Button>
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: '#93c5fd' }}>24/7</div>
              <div className="hero-stat-label">Available</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: '#93c5fd' }}>5000+</div>
              <div className="hero-stat-label">Medicines</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: '#86efac' }}>10min</div>
              <div className="hero-stat-label">Delivery</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="eh-container">
        {/* Services Section */}
        <motion.div className="section-container" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="section-title">
            Our Services
          </h2>
          <div className="services-grid">
            {keyServices.map((service, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.01 }}>
                <Card hover style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div className="service-card">
                    <div className="service-icon">{service.icon}</div>
                    <div className="service-info">
                      <h3>{service.name}</h3>
                      <p>{service.desc}</p>
                    </div>
                    <Link to={service.link}>
                      <Button variant="primary">Explore →</Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div className="section-container" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="section-title">
            Popular Products
          </h2>
          <p className="section-subtitle">
            Curated selection of top-rated health products
          </p>
          
          {loading ? (
            <div className="loader-container">
              <div className="eh-loader"></div>
            </div>
          ) : products.length > 0 ? (
            <motion.div className="products-grid" variants={containerVariants} initial="hidden" whileInView="visible">
              {products.slice(0, 8).map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <Card hover>
                    <Link to={`/product/${product.id}`} className="product-link">
                      <div className="eh-card__media">
                        {product.image ? (
                          <img src={`http://127.0.0.1:8000${product.image}`} alt={product.generic_name} />
                        ) : (
                          <div className="eh-center" style={{ color: 'var(--text-muted)' }}>No image</div>
                        )}
                      </div>
                      <div className="card-content">
                        <h3 className="eh-card__title">{product.generic_name}</h3>
                        <p className="eh-card__meta">Category: {product.category}</p>
                        <p className="eh-card__price">NPR {product.price || 'N/A'}</p>
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="eh-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>No products available.</p>
          )}
        </motion.div>

        {/* Health Tips Section */}
        <motion.div
          className="health-tips-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="section-title">💡 Health Tips</h2>
          <div className="health-tips-grid">
            {tips.map((tip, idx) => (
              <Card key={idx} hover>
                <div className="tip-card-content">
                  <h3 className="tip-card-title">{tip.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{tip.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">
                Need Medical Assistance?
              </h2>
              <p className="cta-subtitle">
                Our team is available 24/7 to help you.
              </p>
              <div className="cta-buttons">
                <Button variant="glass" size="lg">📞 Call Support</Button>
                <Button variant="glass" size="lg">💬 Chat with Doctor</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default HomeScreen;

