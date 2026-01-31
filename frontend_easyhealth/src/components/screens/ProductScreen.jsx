import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import './pages.css';

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
      <div className="eh-center loader-container">
        <div className="eh-loader"></div>
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
    <div className="eh-container product-page">
      <Button variant="ghost" className="back-btn" onClick={() => navigate(-1)}>
        ← Go Back
      </Button>

      <div className="product-layout">
        {/* Product Image */}
        <div className="product-image-container">
          <Card>
            <div className="eh-card__media" style={{ aspectRatio: '1/1' }}>
              <img src={`http://127.0.0.1:8000${product.image}`} alt={product.generic_name} />
            </div>
          </Card>
        </div>

        {/* Product Details */}
        <div>
          <Card className="product-detail-card">
            <CardContent className="product-detail-content">
              <h1 className="product-detail-title">
                {product.name}
              </h1>
              
              <div className="product-detail-meta">
                <p className="eh-card__meta">
                  <strong>Generic Name:</strong> {product.generic_name}
                </p>
                <p className="eh-card__meta">
                  <strong>Category:</strong> {product.category}
                </p>
                {product.prescription_required && (
                  <p className="prescription-badge">
                    <AlertTriangle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Prescription Required
                  </p>
                )}
              </div>

              <p className="product-detail-price">
                NPR {product.price || 'N/A'}
              </p>

              <p className="product-detail-description">
                {product.description || 'No description available.'}
              </p>

              <div className="product-detail-actions">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProductScreen;
