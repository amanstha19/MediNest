import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { API_URL } from '../api/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authTokens = sessionStorage.getItem('authTokens');
    if (authTokens && authTokens !== 'undefined') {
      try {
        const parsedTokens = JSON.parse(authTokens);
        if (parsedTokens && parsedTokens.access) {
          setUser({
            username: parsedTokens.username,
            email: parsedTokens.email,
          });
          
          // Set token to axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedTokens.access}`;
        }
      } catch (e) {
        // Invalid JSON in storage, clear it
        sessionStorage.removeItem('authTokens');
      }
    }
  }, []);


  const signup = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register/`, {
        email: userData.email,
        password: userData.password,
        username: userData.username,
        first_name: userData.firstName,
        last_name: userData.lastName,
        city: userData.city,
        phone: userData.phone,
      });
      setUser(response.data.user);
      sessionStorage.setItem('authTokens', JSON.stringify(response.data));

      // Set token to axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/token/`, credentials);
      sessionStorage.setItem('authTokens', JSON.stringify(response.data));
      
      // Set token to axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      setUser({
        username: response.data.username,
        email: response.data.email,
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('authTokens');
    // Remove the Authorization header from axios
    delete axios.defaults.headers.common['Authorization'];
    // Dispatch logout event to trigger cart clearing
    window.dispatchEvent(new Event('logout'));
  };

  return (
    <AuthContext.Provider value={{ user, error, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
