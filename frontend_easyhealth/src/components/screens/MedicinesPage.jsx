import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';
import './pages.css';

const MedicinesPage = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

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
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = 'http://127.0.0.1:8000/api/products/search/?';
        if (searchQuery) url += `search=${searchQuery}&`;
        if (selectedCategory) url += `category=${selectedCategory}&`;

        const response = await fetch(url);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory]);

  return (
    <div className="eh-container medicines-page">
      {/* Hero Header */}
      <motion.div 
        className="medicines-header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="medicines-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          💊
        </motion.div>
        <motion.h1
          className="medicines-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Medicines & Pharmacy Products
        </motion.h1>
        <motion.p
          className="medicines-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Browse our wide selection of medicines, supplements, and health products delivered to your doorstep.
        </motion.p>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div 
        className="search-filter-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="search-filter-group">
          <label className="search-filter-label">🔍 Search Medicines</label>
          <input
            type="text"
            placeholder="Search by name, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass"
          />
        </div>
        <div className="search-filter-group">
          <label className="search-filter-label">📋 Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-glass"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="loader-container">
          <motion.div
            className="eh-loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      ) : products.length > 0 ? (
        <motion.div
          className="advanced-product-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              className="advanced-product-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
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
                    {product.stock <= 0 && (
                      <span className="badge badge-out-of-stock">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
                <div className="product-content">
                  <h3 className="product-name">
                    {product.generic_name || product.name}
                  </h3>
                  <p className="product-price">
                    {product.price?.toLocaleString() || 'N/A'}
                  </p>
                  <Button variant="primary" size="sm" className="product-btn-block">
                    Add to Cart
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <div className="empty-state-icon">🔍</div>
            <p className="empty-state-title">No products found</p>
            <p style={{ color: 'var(--eh-text-muted)' }}>
              Try adjusting your search or filter criteria
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default MedicinesPage;

