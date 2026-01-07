import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';
import { motion } from 'framer-motion';

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
    <div className="eh-container" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
      {/* Hero Header */}
      <motion.div 
        className="glass"
        style={{ 
          marginBottom: '48px',
          padding: '48px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          style={{ fontSize: '3.5rem', marginBottom: '16px' }}
        >
          💊
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '12px',
            color: 'var(--eh-text-primary)'
          }}
        >
          Medicines & Pharmacy Products
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ 
            fontSize: '1.1rem', 
            color: 'var(--eh-text-secondary)',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          Browse our wide selection of medicines, supplements, and health products delivered to your doorstep.
        </motion.p>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div 
        className="glass"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '24px', 
          marginBottom: '48px',
          padding: '32px'
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: 600, 
            color: 'var(--eh-text-primary)'
          }}>
            🔍 Search Medicines
          </label>
          <input
            type="text"
            placeholder="Search by name, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass"
            style={{ width: '100%', fontSize: '1rem', padding: '14px 20px' }}
          />
        </div>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: 600, 
            color: 'var(--eh-text-primary)'
          }}>
            📋 Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-glass"
            style={{ width: '100%', fontSize: '1rem', padding: '14px 20px' }}
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
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <motion.div
            className="eh-loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ 
              margin: '0 auto',
              width: '48px',
              height: '48px',
              border: '4px solid var(--glass-border)',
              borderTopColor: 'var(--eh-primary)',
              borderRadius: '50%'
            }}
          />
        </div>
      ) : products.length > 0 ? (
        <motion.div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '24px' 
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Link key={product.id} to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                <Card hover>
                  {product.image && (
                    <img
                      src={`http://127.0.0.1:8000${product.image}`}
                      alt={product.name}
                      style={{ 
                        width: '100%', 
                        height: '180px', 
                        objectFit: 'cover',
                        borderRadius: '16px 16px 0 0'
                      }}
                    />
                  )}
                  <CardContent style={{ padding: '20px' }}>
                    <h3 style={{ 
                      fontSize: '0.95rem', 
                      marginBottom: '8px', 
                      color: 'var(--eh-text-primary)', 
                      lineHeight: '1.4',
                      fontWeight: 600
                    }}>
                      {product.name.length > 35 ? product.name.substring(0, 35) + '...' : product.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          background: product.prescription_required 
                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
                            : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      >
                        {product.prescription_required ? 'Rx' : 'OTC'}
                      </span>
                      {product.stock <= 0 && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '16px'
                      }}
                    >
                      NPR {product.price?.toLocaleString() || 'N/A'}
                    </p>
                    <Button variant="primary" size="sm" style={{ width: '100%' }}>
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
            <p style={{ 
              fontSize: '1.3rem', 
              color: 'var(--eh-text-muted)', 
              marginBottom: '12px',
              fontWeight: 600
            }}>
              No products found
            </p>
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

