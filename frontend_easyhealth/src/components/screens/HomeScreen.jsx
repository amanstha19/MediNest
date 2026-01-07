import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';

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
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <motion.div
        className="hero-2027"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⚕️</div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            Your Healthcare Revolution
          </motion.h1>
          <p>
            Medicines • Lab Tests • Emergency Services<br />
            Everything for your health, delivered instantly
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
            <Link to="/category/medicines">
              <Button variant="glass" size="lg">🛒 Shop Medicines</Button>
            </Link>
            <Link to="/ambulance">
              <Button variant="glass" size="lg">🚑 Emergency</Button>
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '48px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#93c5fd' }}>24/7</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Available</div>
            </div>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#93c5fd' }}>5000+</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Medicines</div>
            </div>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#86efac' }}>10min</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Delivery</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="eh-container">
        {/* Services Section */}
        <motion.div style={{ marginBottom: '48px' }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '32px', textAlign: 'center' }}>
            Our Services
          </h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {keyServices.map((service, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.01 }}>
                <Card hover style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'auto 1fr auto', 
                    gap: '24px', 
                    alignItems: 'center',
                    padding: '24px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ fontSize: '3rem' }}>{service.icon}</div>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>{service.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{service.desc}</p>
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
        <motion.div style={{ marginBottom: '48px' }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
            Popular Products
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center' }}>
            Curated selection of top-rated health products
          </p>
          
          {loading ? (
            <div className="eh-center" style={{ padding: '40px' }}>
              <div className="eh-loader"></div>
            </div>
          ) : products.length > 0 ? (
            <motion.div className="eh-grid" variants={containerVariants} initial="hidden" whileInView="visible">
              {products.slice(0, 8).map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <Card hover>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          style={{ 
            background: 'var(--gradient-surface)', 
            borderRadius: '20px', 
            padding: '48px 24px', 
            marginBottom: '48px'
          }}
        >
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '32px', textAlign: 'center' }}>
            💡 Health Tips
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {tips.map((tip, idx) => (
              <Card key={idx} hover>
                <div className="card-content">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--primary)' }}>
                    {tip.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{tip.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card style={{ background: 'var(--gradient-primary)', color: 'white' }}>
            <div style={{ padding: '48px 32px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px', color: 'white' }}>
                Need Medical Assistance?
              </h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '32px', opacity: 0.95 }}>
                Our team is available 24/7 to help you.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
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

