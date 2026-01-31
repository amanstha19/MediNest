import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import './pages.css';

// User-friendly categories with unique visual themes
const CATEGORIES = [
  { value: '', label: '🏠 All Products', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🏠', desc: 'Browse everything' },
  { value: 'PAIN', label: '💊 Pain Relief', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '💊', desc: 'Headaches, body pain, fever' },
  { value: 'COLD', label: '🤧 Cold & Flu', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: '🤧', desc: 'Cough, cold, congestion' },
  { value: 'RX', label: '🦠 Antibiotics', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: '🦠', desc: 'Prescription medicines' },
  { value: 'SUP', label: '💪 Vitamins & Supplements', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', icon: '💪', desc: 'Daily nutrition' },
  { value: 'WOM', label: '🌸 Women\'s Care', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', icon: '🌸', desc: 'Women\'s health products' },
  { value: 'MEN', label: '🧔 Men\'s Care', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🧔', desc: 'Men\'s health products' },
  { value: 'PED', label: '👶 Baby Care', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', icon: '👶', desc: 'Baby medicines & products' },
  { value: 'DENTAL', label: '🦷 Dental Care', color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', icon: '🦷', desc: 'Oral health products' },
  { value: 'SKIN', label: '🧴 Skin Care', color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', icon: '🧴', desc: 'Creams, lotions, beauty' },
  { value: 'EYE', label: '👁️ Eye & Ear Care', color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', icon: '👁️', desc: 'Eye drops, ear care' },
  { value: 'FIRST', label: '🩹 First Aid', color: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', icon: '🩹', desc: 'Bandages, antiseptics' },
  { value: 'DIAG', label: '🔬 Medical Devices', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', icon: '🔬', desc: 'BP monitors, glucometers' },
  { value: 'DIAB', label: '💉 Diabetic Care', color: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)', icon: '💉', desc: 'Insulin, sugar monitors' },
  { value: 'HERB', label: '🌿 Herbal & Ayurvedic', color: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', icon: '🌿', desc: 'Natural remedies' },
];

function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const categoryRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    const lowerQuery = query.toLowerCase();
    const results = products.filter(product => 
      (product.generic_name && product.generic_name.toLowerCase().includes(lowerQuery)) ||
      (product.name && product.name.toLowerCase().includes(lowerQuery)) ||
      (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
      (product.category && product.category.toLowerCase().includes(lowerQuery))
    ).slice(0, 8);
    
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
    setIsSearching(false);
  }, [products]);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/products');
        setProducts(data);
        setFilteredProducts(data);

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

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.category && product.category.toUpperCase().includes(selectedCategory.toUpperCase())
      );
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  // Scroll category into view when selected
  useEffect(() => {
    if (selectedCategory && categoryRef.current) {
      const activeElement = categoryRef.current.querySelector(`[data-category="${selectedCategory}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedCategory]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setFilteredProducts(products);
    setShowSearchResults(false);
  };

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

  // Get product count for each category
  const getCategoryCount = (categoryValue) => {
    if (!categoryValue) return products.length;
    return products.filter(p => 
      p.category && p.category.toUpperCase().includes(categoryValue.toUpperCase())
    ).length;
  };

  // Get current category info
  const getCurrentCategoryInfo = () => {
    return CATEGORIES.find(c => c.value === selectedCategory) || CATEGORIES[0];
  };

  return (
    <div className="home-page">
      {/* Search & Category Filter Section - First, below navbar */}
      <motion.div 
        className="search-category-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {/* Smart Search Bar */}
        <div className="search-container">
          <motion.div 
            className="search-bar-wrapper"
            whileFocus={{ scale: 1.02 }}
          >
            <span className="search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search medicines, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {isSearching && <div className="search-spinner"></div>}
            {searchQuery && (
              <button 
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                  searchInputRef.current?.focus();
                }}
              >
                ✕
              </button>
            )}
          </motion.div>
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (
              <motion.div 
                className="search-results-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="search-results-header">
                  <span>🔍 Search Results for "{searchQuery}"</span>
                  <span className="results-count">{searchResults.length} products</span>
                </div>
                <div className="search-results-list">
                  {searchResults.map((product) => (
                    <Link 
                      key={product.id} 
                      to={`/product/${product.id}`}
                      className="search-result-item"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                    >
                      <div className="result-image">
                        {product.image ? (
                          <img src={`http://127.0.0.1:8000${product.image}`} alt={product.generic_name || product.name} />
                        ) : (
                          <span>💊</span>
                        )}
                      </div>
                      <div className="result-info">
                        <span className="result-name">{product.generic_name || product.name}</span>
                        <span className="result-price">NPR {product.price?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <span className={`result-badge ${product.prescription_required ? 'badge-rx' : 'badge-otc'}`}>
                        {product.prescription_required ? 'Rx' : 'OTC'}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link 
                  to={`/medicines?search=${encodeURIComponent(searchQuery)}`}
                  className="view-all-results"
                  onClick={() => setShowSearchResults(false)}
                >
                  View all results →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Pills Navigation */}
        <div className="category-pills-container" ref={categoryRef}>
          <div className="category-pills-scroll">
            {CATEGORIES.map((category, index) => (
              <motion.button
                key={category.value}
                data-category={category.value}
                className={`category-pill ${selectedCategory === category.value ? 'active' : ''}`}
                style={{ '--pill-color': category.color }}
                onClick={() => {
                  setSelectedCategory(category.value === selectedCategory ? '' : category.value);
                  setShowSearchResults(false);
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="pill-icon">{category.icon}</span>
                <span className="pill-label">{category.label}</span>
                <span className="pill-count">{getCategoryCount(category.value)}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Selected Category Info Card */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div 
              className="category-spotlight"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: getCurrentCategoryInfo().color }}
            >
              <div className="spotlight-content">
                <span className="spotlight-icon">{getCurrentCategoryInfo().icon}</span>
                <div className="spotlight-info">
                  <h3>{getCurrentCategoryInfo().label}</h3>
                  <p>{getCurrentCategoryInfo().desc}</p>
                </div>
                <span className="spotlight-count">{filteredProducts.length} products</span>
                <button className="spotlight-clear" onClick={clearFilters}>✕ Clear</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hero Section - Second, after search/category */}
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
        {/* Filtered Products Grid */}
        {(searchQuery || selectedCategory) && (
          <motion.div 
            className="filtered-products-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="section-title">
              {searchQuery ? `🔍 Search Results` : `📦 ${getCurrentCategoryInfo().label}`}
            </h2>
            <p className="section-subtitle">
              {searchQuery 
                ? `Found ${filteredProducts.length} products matching "${searchQuery}"`
                : `Showing ${filteredProducts.length} products in ${getCurrentCategoryInfo().label}`
              }
            </p>
            
            {loading ? (
              <div className="loader-container">
                <motion.div
                  className="eh-loader"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                className="filtered-products-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredProducts.slice(0, 12).map((product) => (
                  <motion.div
                    key={product.id}
                    className="filtered-product-card"
                    variants={itemVariants}
                    layout
                  >
                    <Link to={`/product/${product.id}`} className="product-link">
                      <div className="product-image-container">
                        {product.image ? (
                          <img
                            src={`http://127.0.0.1:8000${product.image}`}
                            alt={product.generic_name || product.name}
                          />
                        ) : (
                          <div className="product-placeholder">
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
                        <p className="product-price">NPR {product.price?.toLocaleString() || 'N/A'}</p>
                        <Button variant="primary" size="sm" className="product-btn-block">
                          Add to Cart
                        </Button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="no-products-found">
                <div className="no-products-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or category filter</p>
                <Button variant="primary" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
            
            {filteredProducts.length > 12 && (
              <div className="load-more-container">
                <Link to={`/medicines${selectedCategory ? `?category=${selectedCategory}` : ''}${searchQuery ? `?search=${searchQuery}` : ''}`}>
                  <Button variant="glass" size="lg">
                    View All {filteredProducts.length} Products →
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}

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
        {!searchQuery && !selectedCategory && (
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
        )}

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

