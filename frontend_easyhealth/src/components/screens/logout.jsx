import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';  // For React Router v5
import { AuthContext } from './context/AuthProvider';  // Adjust path if necessary
import { useCart } from './context/CartContext';  // Import CartContext to clear cart data
import Button from 'react-bootstrap/Button';  // For styled button

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);  // Use logout function from AuthContext
  const { clearCart } = useCart();  // Access the CartContext to clear cart data
  const history = useHistory();  // React Router v5 for navigation

  const handleLogout = async () => {
    try {
      // Optional: Call an API to invalidate the token on the server
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authTokens')}`,
        },
      });

      // Logout the user
      logout();

      // Clear cart data
      clearCart();

      // Redirect to the home page (or login page)
      history.push('/');  // Navigate to home page
      // history.push('/login');  // Uncomment to redirect to login page instead
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button variant="danger" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;