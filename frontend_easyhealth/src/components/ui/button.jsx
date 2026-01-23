// MEDINEST Modern Button Component
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  loading = false,
}) => {
  const variants = {
    primary: 'mui-btn mui-btn-primary',
    secondary: 'mui-btn mui-btn-secondary',
    success: 'mui-btn mui-btn-success',
    danger: 'mui-btn mui-btn-danger',
    glass: 'mui-btn mui-btn-glass',
    ghost: 'mui-btn mui-btn-ghost',
  };

  const sizes = {
    sm: 'mui-btn-sm',
    md: '',
    lg: 'mui-btn-lg',
  };

  return (
    <motion.button
      type={type}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    >
      {loading && (
        <motion.span
          className="mui-spin"
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            marginRight: '8px'
          }}
        />
      )}
      {children}
    </motion.button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'success', 'danger', 'glass']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  loading: PropTypes.bool,
};

export default Button;

