import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';
import './pages.css';

function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const CATEGORIES = [
    { value: 'OTC', label: 'Over-the-Counter' },
    { value: 'RX', label: 'Prescription Medicines' },
    { value: 'SUP', label: 'Supplements & Vitamins' },
    { value: 'WOM', label: "Women's Health" },
    { value: 'MEN', label: "Men's Health" },
    { value: 'PED', label: 'Pediatric Medicines' },
    { value: 'HERB', label: 'Herbal & Ayurvedic' },
    { value: 'DIAG', label: 'Diagnostics & Medical Devices' },
    { value: 'FIRST', label: 'First Aid' },
  ];

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/products');

        // Group products by category for recommendations
        const grouped = data.reduce((acc, product) => {
          const cat = product.category || 'Other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(product);
          return acc;
        }, {});
        setProductsByCategory(grouped);
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
        animate={{ opacity: 1}}
        transition={{ duration: 0.1 }}
      >
        <div className="hero-content">
          <motion.div className="hero-icon" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            ⚕️
          </motion.div>
          <motion.h1 className="hero-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            Your Healthcare Revolution
          </motion.h1>
          <p className="hero-subtitle">
            Medicines • Emergency Services<br />
            Everything for your health, delivered instantly
          </p>

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
              <div className="hero-stat-value" style={{ color: '#86efac' }}>fast</div>
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



        {/* Netflix-Style Recommendations */}
        <motion.div
          className="recommendations-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="section-title">🎬 Recommended for You</h2>
          <p className="section-subtitle">Discover products from different categories</p>
          {Object.entries(productsByCategory).slice(0, 5).map(([category, categoryProducts]) => (
            <motion.div
              key={category}
              className="recommendation-row"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="recommendation-category-title">{category}</h3>
              <div className="recommendation-products">
                {categoryProducts.slice(0, 6).map((product, idx) => (
                  <motion.div
                    key={product.id}
                    className="recommendation-product-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link to={`/product/${product.id}`} className="product-link">
                      <div className="product-image-container">
                        {product.image ? (
                          <img
                            src={`http://127.0.0.1:8000${product.image}`}
                            alt={product.generic_name || product.name}
                          />
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'var(--text-muted)',
                            fontSize: '1.2rem'
                          }}>
                            💊
                          </div>
                        )}
                        <div className="product-badges">
                          <span className={`badge ${product.prescription_required ? 'badge-rx' : 'badge-otc'}`}>
                            {product.prescription_required ? 'Rx' : 'OTC'}
                          </span>
                        </div>
                      </div>
                      <div className="product-content">
                        <h4 className="product-name">{product.generic_name || product.name}</h4>
                        <p className="product-price">{product.price?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
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

