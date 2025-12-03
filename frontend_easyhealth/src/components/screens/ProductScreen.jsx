import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';

function ProductScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/product/${id}`);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      prescriptionRequired: product.prescription_required,
    });
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="eh-center" style={{ padding: '60px 20px' }}>
        <div className="eh-loader" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eh-container">
        <div className="eh-alert eh-alert--error">{error}</div>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)' }}>
      <Button variant="ghost" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--eh-spacing-xl)' }}>
        ← Go Back
      </Button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-2xl)', alignItems: 'start' }}>
        {/* Product Image */}
        <div>
          <Card>
            <div className="eh-card__media" style={{ aspectRatio: '1/1' }}>
              <img src={`http://127.0.0.1:8000${product.image}`} alt={product.generic_name} />
            </div>
          </Card>
        </div>

        {/* Product Details */}
        <div>
          <Card>
            <CardContent>
              <h1 style={{ fontSize: '2rem', marginBottom: 'var(--eh-spacing-md)', color: 'var(--eh-text-primary)' }}>
                {product.name}
              </h1>
              
              <div style={{ marginBottom: 'var(--eh-spacing-lg)', paddingBottom: 'var(--eh-spacing-lg)', borderBottom: '1px solid var(--eh-border)' }}>
                <p className="eh-card__meta" style={{ marginBottom: 'var(--eh-spacing-sm)' }}>
                  <strong>Generic Name:</strong> {product.generic_name}
                </p>
                <p className="eh-card__meta" style={{ marginBottom: 'var(--eh-spacing-sm)' }}>
                  <strong>Category:</strong> {product.category}
                </p>
                {product.prescription_required && (
                  <p style={{ color: 'var(--eh-accent)', fontWeight: 600 }}>⚠️ Prescription Required</p>
                )}
              </div>

              <p className="eh-card__price" style={{ fontSize: '1.8rem', marginBottom: 'var(--eh-spacing-lg)' }}>
                NPR {product.price || 'N/A'}
              </p>

              <p style={{ color: 'var(--eh-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--eh-spacing-lg)' }}>
                {product.description || 'No description available.'}
              </p>

              <Button
                variant="success"
                size="lg"
                className="eh-btn--block"
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProductScreen;
