// MEDINEST Card Component
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  hover = false,
  style = {},
  ...props
}) => {
  const CardWrapper = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { scale: 1.01 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <CardWrapper
      className={`card ${className}`}
      style={{ ...style }}
      {...motionProps}
      {...props}
    >
      {children}
    </CardWrapper>
  );
};

export const CardContent = ({ children, className = '', style = {} }) => (
  <div className={`card-content ${className}`} style={style}>
    {children}
  </div>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  style: PropTypes.object,
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Card;

