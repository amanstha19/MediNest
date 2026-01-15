import { createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Always use light theme - user-friendly colors
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode: false, theme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
};
