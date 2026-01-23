import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Login from './components/screens/Login';
import SignupScreen from './components/screens/SignupScreen';
import HomeScreen from './components/screens/HomeScreen';
import ProductScreen from './components/screens/ProductScreen';
import Ambulance from './components/screens/Ambulance';
import { AuthProvider } from './context/AuthProvider';
import Profile from './components/screens/profile';
import CartScreen from './components/screens/CartScreen';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/DarkModeContext';
import AdminPanel from './components/screens/AdminPanel';
import CheckoutScreen from './components/screens/CheckoutScreen';
import OrderSuccessScreen from './components/screens/OrderSuccessScreen';

import MedicinesPage from './components/screens/MedicinesPage';
import Payment from './components/screens/Payment';
import PaymentVerification from './components/screens/PaymentVerification';
import PaymentSuccess from './components/screens/PaymentSuccess';
import FloatingActionButton from './components/FloatingActionButton';

// MEDINEST Design System - Unified 2027 Light Theme
import './components/ui/modern-ui-2027.css';




const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin' || location.pathname.startsWith('/admin');

  const isAuthenticated = true; // Replace with actual authentication check

  return (
    <>
      {!isAdminPage && <Navbar />}
      {!isAdminPage && <Container>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/ambulance" element={<Ambulance />} />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/checkout" element={<CheckoutScreen />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessScreen />} />
         
          <Route path="/category/medicines" element={<MedicinesPage />} />

          {/* Payment Route with params */}
          <Route 
            path="/payment/:orderId/:totalPrice" 
            element={<Payment />} 
          />
          <Route path="/payment/verification" element={<PaymentVerification />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </Container>}
      {isAdminPage && <Routes>
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>}
      {!isAdminPage && <Footer />}
    </>
  );
};

function App() {
  useEffect(() => {

  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
