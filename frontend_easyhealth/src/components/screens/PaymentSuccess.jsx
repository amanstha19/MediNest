import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <div 
      className="hero-2027"
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="glass"
        style={{ 
          padding: '64px 48px', 
          textAlign: 'center',
          maxWidth: '500px'
        }}
      >
        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', delay: 0.2 }}
          style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 0 60px rgba(67, 233, 123, 0.4)'
          }}
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path d="M20 6L9 17l-5-5" />
          </motion.svg>
        </motion.div>

        {/* Success Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ 
            fontSize: '2rem', 
            fontWeight: 800, 
            marginBottom: '16px',
            color: 'var(--eh-text-primary)'
          }}
        >
          Payment Successful!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ 
            fontSize: '1.1rem', 
            color: 'var(--eh-text-secondary)',
            marginBottom: '16px',
            lineHeight: 1.6
          }}
        >
          Thank you for your order. Your payment has been processed successfully.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ 
            color: 'var(--eh-text-muted)',
            fontSize: '0.95rem'
          }}
        >
          Redirecting to home page in 5 seconds...
        </motion.p>

        {/* Animated Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ 
            marginTop: '32px',
            padding: '0 48px'
          }}
        >
          <div style={{ 
            height: '4px', 
            background: 'var(--glass-border)', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              style={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: '2px'
              }}
            />
          </div>
        </motion.div>

        {/* Continue Shopping Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: '32px' }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/', { replace: true })}
            style={{
              padding: '14px 32px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
            }}
          >
            Continue Shopping Now
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;

