import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';
import { Pill, Search, ListFilter } from 'lucide-react';
import { API_URL, BASE_URL } from '../../api/config';
import './pages.css';

const MedicinesPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Helper for image URLs
  const getImageUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories/`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async (isLoadMore = false, currentOffset = 0) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      let url = `${API_URL}/products/search/?offset=${currentOffset}&limit=${limit}&`;
      if (searchQuery) url += `search=${searchQuery}&`;
      if (selectedCategory) url += `category=${selectedCategory}&`;

      const response = await fetch(url);
      const data = await response.json();

      if (isLoadMore) {
        setProducts(prev => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }

      setHasMore(data.has_more);
      setTotalCount(data.total_count);
      setOffset(currentOffset + data.products.length);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load and when search/category changes
  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchProducts(false, 0);
  }, [searchQuery, selectedCategory]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(true, offset);
    }
  };

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
          <Pill size={48} />
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
          <label className="search-filter-label">
            <Search size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Search Medicines
          </label>
          <input
            type="text"
            placeholder="Search by name, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass"
          />
        </div>
        <div className="search-filter-group">
          <label className="search-filter-label">
            <ListFilter size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-glass"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
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
        <>
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
                      src={getImageUrl(product.image)}
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
                      <Pill size={32} />
                    </div>
                  )}
                  <div className="product-badges">
                    <span className={`badge ${product.category === 'RX' ? 'badge-rx' : 'badge-otc'}`}>
                      {product.category || 'OTC'}
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

          {/* Load More Button */}
          {hasMore && (
            <motion.div
              className="load-more-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '2rem',
                marginBottom: '2rem'
              }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={loadMore}
                disabled={loadingMore}
                className="load-more-btn"
              >
                {loadingMore ? (
                  <>
                    <motion.div
                      className="eh-loader"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderWidth: '2px',
                        display: 'inline-block',
                        marginRight: '8px',
                        verticalAlign: 'middle'
                      }}
                    />
                    Loading...
                  </>
                ) : (
                  `Load More (${products.length} of ${totalCount})`
                )}
              </Button>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <div className="empty-state-icon">
              <Search size={48} />
            </div>
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
