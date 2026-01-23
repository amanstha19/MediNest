import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import Button from './ui/button';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems } = useContext(CartContext);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      icon: '🚑',
      label: 'Emergency',
      link: '/ambulance',
      color: 'var(--danger)',
      description: '24/7 Ambulance Service'
    },
    {
      icon: '🛒',
      label: 'Cart',
      link: '/cart',
      color: 'var(--primary)',
      description: `${cartItems.length} items`,
      badge: cartItems.length > 0 ? cartItems.length : null
    },
    {
      icon: '💬',
      label: 'Support',
      link: '#',
      color: 'var(--success)',
      description: 'Chat with Doctor',
      action: () => alert('Chat support coming soon!')
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 space-y-3"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { delay: index * 0.1 }
                }}
                exit={{
                  opacity: 0,
                  y: 20,
                  scale: 0.8,
                  transition: { delay: (menuItems.length - index - 1) * 0.05 }
                }}
                className="flex items-center gap-3"
              >
                {item.link !== '#' ? (
                  <Link to={item.link} className="flex items-center gap-3">
                    <motion.div
                      className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg"
                      style={{ backgroundColor: item.color }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.icon}
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                    <motion.div
                      className="mui-card p-3 max-w-xs"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <div className="font-semibold text-sm">{item.label}</div>
                      <div className="text-xs text-secondary">{item.description}</div>
                    </motion.div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 cursor-pointer" onClick={item.action}>
                    <motion.div
                      className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg"
                      style={{ backgroundColor: item.color }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.icon}
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                    <motion.div
                      className="mui-card p-3 max-w-xs"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <div className="font-semibold text-sm">{item.label}</div>
                      <div className="text-xs text-secondary">{item.description}</div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl font-bold relative overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? '✕' : '+'}
        </motion.span>

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
