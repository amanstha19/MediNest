// HomeScreen component: Main landing page displaying hero section, services, popular products, health tips, and call-to-action
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
    { title: '😴 Sleep Well', desc: 'Aim for 7-9 hours of quality sleep nightly to boost immunity and mental health.' },
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div
        className="hero-2027"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1}}
        transition={{ duration: 0.1 }}
      >
        <div className="hero-content">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            ⚕️
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            Your Healthcare Revolution
          </motion.h1>
          <p>
            Medicines • Emergency Services<br />
            Everything for your health, delivered instantly
          </p>

          <div className="flex gap-6 justify-center mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-secondary">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">5000+</div>
              <div className="text-sm text-secondary">Medicines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">fast</div>
              <div className="text-sm text-secondary">Delivery</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mui-container">
        {/* Services Section */}
        <motion.div className="py-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="text-3xl font-bold text-center mb-4 text-primary">
            Our Services
          </h2>
          <div className="mui-grid--2">
            {keyServices.map((service, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.01 }}>
                <Card hover style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div className="mui-card-content">
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                      <p className="text-secondary">{service.desc}</p>
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
        <motion.div className="py-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="text-3xl font-bold text-center mb-4 text-primary">
            Popular Products
          </h2>
          <p className="text-center text-secondary mb-12">
            Curated selection of top-rated health products
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="mui-loader"></div>
            </div>
          ) : products.length > 0 ? (
            <motion.div className="mui-grid" variants={containerVariants} initial="hidden" whileInView="visible">
              {products.slice(0, 8).map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <Card hover>
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="mui-card__media">
                        {product.image ? (
                          <img src={`http://127.0.0.1:8000${product.image}`} alt={product.generic_name} />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted">No image</div>
                        )}
                      </div>
                      <div className="mui-card-content">
                        <h3 className="mui-card__title">{product.generic_name}</h3>
                        <p className="mui-card__meta">Category: {product.category}</p>
                        <p className="mui-card__price">NPR {product.price || 'N/A'}</p>
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center py-12 text-muted">No products available.</p>
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
        <motion.div className="py-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="mui-card" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
            <div className="mui-card-content text-center">
              <h2 className="text-2xl font-bold mb-4">
                Need Medical Assistance?
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Our team is available 24/7 to help you.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
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

