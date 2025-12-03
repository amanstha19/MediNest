import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';

const ProductCard = ({ product }) => {
  return (
    <Card className="">
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="eh-card__media">
          {product.image ? (
            <img src={`http://127.0.0.1:8000${product.image}`} alt={product.generic_name} />
          ) : (
            <div className="eh-center eh-muted">No image</div>
          )}
        </div>
        <div className="eh-card__body">
          <h3 className="eh-card__title">{product.generic_name}</h3>
          <p className="eh-card__meta">Category: {product.category}</p>
          <p className="eh-card__price">Price: NPR {product.price || 'N/A'}</p>
        </div>
      </Link>
    </Card>
  );
};

// Add PropTypes validation
ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    generic_name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
  }).isRequired,
};

export default ProductCard;
