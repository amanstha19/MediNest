import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

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
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      <div className="eh-hero" style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💊</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Medicines & Pharmacy Products</h1>
        <p>Browse our wide selection of medicines, supplements, and health products.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--eh-spacing-lg)', marginBottom: 'var(--eh-spacing-2xl)' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Search Medicines</label>
          <input
            type="text"
            placeholder="Search by name, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="eh-input"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--eh-text-primary)' }}>Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="eh-input"
            style={{ width: '100%' }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--eh-spacing-2xl)' }}>
          <div className="eh-loader"></div>
        </div>
      ) : products.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--eh-spacing-lg)' }}>
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
              <Card>
                {product.image && (
                  <img
                    src={`http://127.0.0.1:8000${product.image}`}
                    alt={product.name}
                    className="eh-card__media"
                  />
                )}
                <CardContent style={{ padding: 'var(--eh-spacing-md)' }}>
                  <h3 style={{ fontSize: '0.85rem', marginBottom: '6px', color: 'var(--eh-text-primary)', lineHeight: '1.3' }}>
                    {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: 'var(--eh-radius-sm)',
                        background: product.prescription_required ? 'var(--eh-accent)' : 'var(--eh-success)',
                        color: 'white',
                      }}
                    >
                      {product.prescription_required ? 'Rx' : 'OTC'}
                    </span>
                    {product.stock <= 0 && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: 'var(--eh-radius-sm)',
                          background: '#f59e0b',
                          color: 'white',
                        }}
                      >
                        Out
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--eh-success)',
                      marginBottom: 'var(--eh-spacing-sm)',
                    }}
                  >
                    NPR {product.price?.toLocaleString() || 'N/A'}
                  </p>
                  <Button variant="primary" size="sm" style={{ width: '100%', fontSize: '0.8rem' }}>
                    Add
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent style={{ textAlign: 'center', padding: 'var(--eh-spacing-2xl)' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--eh-text-muted)', marginBottom: '8px' }}>
              No products found
            </p>
            <p style={{ color: 'var(--eh-text-muted)' }}>
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicinesPage;
