import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../ui/card';
import Button from '../ui/button';
import AISearchModal from '../ui/AISearchModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pill, Syringe, FlaskConical, HeartPulse, Activity, 
  Baby, Leaf, Monitor, SquarePlus, Home, Search, Sparkles 
} from 'lucide-react';
import './pages.css';

const getIconComponent = (iconName) => {
  const iconComponents = {
    'Pill': Pill, 'Syringe': Syringe, 'FlaskConical': FlaskConical,
    'HeartPulse': HeartPulse, 'Activity': Activity, 'Baby': Baby,
    'Leaf': Leaf, 'Monitor': Monitor, 'SquarePlus': SquarePlus, 'Home': Home,
  };
  return iconComponents[iconName] || Pill;
};

const FALLBACK_CATEGORIES = [
  { value: '', label: 'All Products', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: 'Home', desc: 'Browse everything' },
  { value: 'OTC', label: 'Over-the-Counter', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', icon: 'Pill', desc: 'Medicines without prescription' },
  { value: 'RX', label: 'Prescription Medicines', color: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)', icon: 'Syringe', desc: 'Prescription required' },
  { value: 'SUP', label: 'Vitamins & Supplements', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', icon: 'FlaskConical', desc: 'Daily nutrition' },
  { value: 'WOM', label: "Women's Health", color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', icon: 'HeartPulse', desc: "Women's health products" },
  { value: 'MEN', label: "Men's Health", color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: 'Activity', desc: "Men's health products" },
  { value: 'PED', label: 'Pediatric Medicines', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', icon: 'Baby', desc: 'Baby medicines & products' },
  { value: 'HERB', label: 'Herbal & Ayurvedic', color: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', icon: 'Leaf', desc: 'Natural remedies' },
  { value: 'DIAG', label: 'Medical Devices', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', icon: 'Monitor', desc: 'BP monitors, glucometers' },
  { value: 'FIRST', label: 'First Aid', color: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', icon: 'SquarePlus', desc: 'Bandages, antiseptics' },
];

function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams] = useSearchParams();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const categoryRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/categories/');
        const data = await response.json();
        const allProductsEntry = { value: '', label: 'All Products', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: 'Home', description: 'Browse everything' };
        setCategories([allProductsEntry, ...data]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(FALLBACK_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/products');
        setProducts(data);
        setFilteredProducts(data);
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

  useEffect(() => {
    if (selectedCategory === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category && product.category.toUpperCase().includes(selectedCategory.toUpperCase()));
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  useEffect(() => {
    if (selectedCategory && categoryRef.current) {
      const activeElement = categoryRef.current.querySelector(`[data-category="${selectedCategory}"]`);
      if (activeElement) activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedCategory]);

  const clearFilters = () => { setSelectedCategory(''); setFilteredProducts(products); };

  const keyServices = [
    { name: 'Pharmacy & Medicines', icon: '💊', desc: 'Order prescription & OTC medicines with ease.', link: '/category/medicines' },
    { name: 'Emergency Ambulance', icon: '🚑', desc: '24/7 emergency ambulance with certified EMTs.', link: '/ambulance' },
  ];

  const tips = [
    { title: '💧 Hydration', desc: 'Drink 2-3 liters of water daily for better health.' },
    { title: '🥗 Healthy Eating', desc: 'Add leafy greens to your diet for essential vitamins.' },
    { title: '🏃 Exercise', desc: '30 mins daily activity improves mood & reduces stress.' },
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const getCategoryCount = (categoryValue) => {
    if (!categoryValue) return products.length;
    return products.filter(p => p.category && p.category.toUpperCase().includes(categoryValue.toUpperCase())).length;
  };

  const getCurrentCategoryInfo = () => categories.find(c => c.value === selectedCategory) || categories[0] || FALLBACK_CATEGORIES[0];

  const handleAISearch = (searchData) => {
    const { query, category, aiEnhanced, synonyms } = searchData;
    
    // Build search URL with AI enhancements
    let searchUrl = '/medicines?';
    const params = new URLSearchParams();
    
    if (query) params.append('search', query);
    if (category) params.append('category', category);
    if (aiEnhanced) params.append('ai', 'true');
    if (synonyms?.length) params.append('synonyms', synonyms.join(','));
    
    searchUrl += params.toString();
    navigate(searchUrl);
  };

  const renderIcon = (iconName, size = 16) => {
    if (!iconName) return null;
    if (typeof iconName !== 'string') {
      const IconComponent = iconName;
      return <IconComponent size={size} />;
    }
    const IconComponent = getIconComponent(iconName);
    return IconComponent ? <IconComponent size={size} /> : null;
  };

  return (
    <div className="home-page">
      <AnimatePresence mode="wait">
        {!selectedCategory && (
          <motion.div className="hero-section-professional" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
            <div className="hero-bg-pattern"></div>
            <div className="hero-content">
              <motion.div className="hero-icon-wrapper" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                <span className="hero-icon-large">⚕️</span>
              </motion.div>
              <motion.h1 className="hero-title-professional" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>Your Healthcare Revolution</motion.h1>
              <motion.p className="hero-subtitle-professional" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>Premium medicines • 24/7 Emergency Services • Fast delivery</motion.p>
              
              {/* AI Search Trigger */}
              <motion.div 
                className="ai-search-trigger-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <button 
                  className="ai-search-trigger"
                  onClick={() => setIsSearchModalOpen(true)}
                >
                  <Search size={20} />
                  <span>Search medicines, symptoms...</span>
                  <div className="ai-search-trigger-badges">
                    <span className="ai-badge-small">
                      <Sparkles size={10} />
                      AI
                    </span>
                    <kbd className="kbd-cmd">⌘K</kbd>
                  </div>
                </button>
              </motion.div>

              <motion.div className="hero-stats-professional" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="hero-stat-item"><span className="hero-stat-number">5000+</span><span className="hero-stat-label">Medicines</span></div>
                <div className="hero-stat-divider"></div>
                <div className="hero-stat-item"><span className="hero-stat-number">24/7</span><span className="hero-stat-label">Available</span></div>
                <div className="hero-stat-divider"></div>
                <div className="hero-stat-item"><span className="hero-stat-number">30min</span><span className="hero-stat-label">Delivery</span></div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Search Modal */}
      <AISearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleAISearch}
        products={products}
        categories={categories}
      />

      <motion.div className="category-section-professional" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="category-scroll-wrapper" ref={categoryRef}>
          <div className="category-pills-scroll">
            {categories.map((category, index) => (
              <motion.button key={category.value} data-category={category.value} className={`category-pill-professional ${selectedCategory === category.value ? 'active' : ''}`} style={{ '--pill-color': category.color }} onClick={() => setSelectedCategory(category.value === selectedCategory ? '' : category.value)} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <span className="pill-icon">{renderIcon(category.icon, 18)}</span>
                <span className="pill-label">{category.label}</span>
                <span className="pill-count">{getCategoryCount(category.value)}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedCategory && (
            <motion.div className="category-spotlight-professional" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: getCurrentCategoryInfo().color }}>
              <div className="spotlight-content">
                <span className="spotlight-icon">{renderIcon(getCurrentCategoryInfo().icon, 28)}</span>
                <div className="spotlight-info"><h3>{getCurrentCategoryInfo().label}</h3><p>{getCurrentCategoryInfo().desc}</p></div>
                <span className="spotlight-count">{filteredProducts.length} products</span>
                <button className="spotlight-clear" onClick={clearFilters}><span>✕</span> Clear</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="eh-container">
        <AnimatePresence>
          {selectedCategory && (
            <motion.div className="filtered-products-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="section-title">📦 {getCurrentCategoryInfo().label}</h2>
              <p className="section-subtitle">Showing {filteredProducts.length} products in {getCurrentCategoryInfo().label}</p>
              {loading ? (
                <div className="loader-container"><motion.div className="eh-loader" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /></div>
              ) : filteredProducts.length > 0 ? (
                <motion.div className="filtered-products-grid" variants={containerVariants} initial="hidden" animate="visible">
                  {filteredProducts.slice(0, 12).map((product) => (
                    <motion.div key={product.id} className="filtered-product-card" variants={itemVariants} layout>
                      <Link to={`/product/${product.id}`} className="product-link">
                        <div className="product-image-container">
                          {product.image ? <img src={`http://127.0.0.1:8000${product.image}`} alt={product.generic_name || product.name} /> : <div className="product-placeholder">💊</div>}
                          <div className="product-badges"><span className={`badge ${product.prescription_required ? 'badge-rx' : 'badge-otc'}`}>{product.prescription_required ? 'Rx' : 'OTC'}</span></div>
                        </div>
                        <div className="product-content">
                          <h4 className="product-name">{product.generic_name || product.name}</h4>
                          <p className="product-price">NPR {product.price?.toLocaleString() || 'N/A'}</p>
                          <Button variant="primary" size="sm" className="product-btn-block">Add to Cart</Button>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="no-products-found"><div className="no-products-icon">🔍</div><h3>No products found</h3><p>Try selecting a different category</p><Button variant="primary" onClick={clearFilters}>Clear Filters</Button></div>
              )}
              {filteredProducts.length > 12 && (
                <div className="load-more-container"><Link to={`/medicines${selectedCategory ? `?category=${selectedCategory}` : ''}`}><Button variant="glass" size="lg">View All {filteredProducts.length} Products →</Button></Link></div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="section-container-services" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid-compact">
            {keyServices.map((service, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.02 }}>
                <Card hover className="service-card-compact">
                  <div className="service-card-content">
                    <div className="service-icon-wrapper"><span className="service-icon">{service.icon}</span></div>
                    <div className="service-info"><h3>{service.name}</h3><p>{service.desc}</p></div>
                    <Link to={service.link}><Button variant="primary" size="sm">Explore →</Button></Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {!selectedCategory && (
          <motion.div className="recommendations-section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="section-title">🎬 Recommended for You</h2>
            <p className="section-subtitle">Discover products from different categories</p>
            {Object.entries(productsByCategory).slice(0, 5).map(([category, categoryProducts]) => (
              <motion.div key={category} className="recommendation-row" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="recommendation-category-title">{category}</h3>
                <div className="recommendation-products">
                  {categoryProducts.slice(0, 6).map((product, idx) => (
                    <motion.div key={product.id} className="recommendation-product-card" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                      <Link to={`/product/${product.id}`} className="product-link">
                        <div className="product-image-container">
                          {product.image ? <img src={`http://127.0.0.1:8000${product.image}`} alt={product.generic_name || product.name} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '1.2rem' }}>💊</div>}
                          <div className="product-badges"><span className={`badge ${product.prescription_required ? 'badge-rx' : 'badge-otc'}`}>{product.prescription_required ? 'Rx' : 'OTC'}</span></div>
                        </div>
                        <div className="product-content"><h4 className="product-name">{product.generic_name || product.name}</h4><p className="product-price">{product.price?.toLocaleString() || 'N/A'}</p></div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div className="health-tips-section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="section-title">💡 Health Tips</h2>
          <div className="health-tips-grid-compact">
            {tips.map((tip, idx) => (
              <Card key={idx} hover className="tip-card-compact">
                <div className="tip-card-content"><h3 className="tip-card-title">{tip.title}</h3><p style={{ color: 'var(--text-secondary)', margin: 0 }}>{tip.desc}</p></div>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <Card className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">Need Medical Assistance?</h2>
              <p className="cta-subtitle">Our team is available 24/7 to help you.</p>
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
