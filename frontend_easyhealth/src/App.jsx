import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { testAPI } from './utils/api';
import Login from './components/screens/Login';
import SignupScreen from './components/screens/SignupScreen';
import HomeScreen from './components/screens/HomeScreen';
import ProductScreen from './components/screens/ProductScreen';
import Ambulance from './components/screens/Ambulance';
import { AuthProvider } from './context/AuthProvider';
import Profile from './components/screens/profile';
import CartScreen from './components/screens/CartScreen';
import { CartProvider } from './context/CartContext';
import AdminPanel from './components/screens/AdminPanel';
import CheckoutScreen from './components/screens/CheckoutScreen';
import OrderSuccessScreen from './components/screens/OrderSuccessScreen';
import LabTestBookingPage from './components/screens/LabTestBookingPage';
import HealthPackagesPage from './components/screens/HealthPackagesPage';
import MedicinesPage from './components/screens/MedicinesPage';
import LabTestsPage from './components/screens/LabTestsPage';
import Payment from './components/screens/Payment';
import PaymentVerification from './components/screens/PaymentVerification';
import PaymentSuccess from './components/screens/PaymentSuccess';
import BookingPayment from './components/screens/BookingPayment';
import BookingSuccessScreen from './components/screens/BookingSuccessScreen';
import BookingPaymentVerification from './components/screens/BookingPaymentVerification';
import './components/ui/modern-ui.css';




const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin' || location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/signin';

  const isAuthenticated = true; // Replace with actual authentication check

  return (
    <>
      {!isAdminPage && !isLoginPage && <Navbar />}
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
          <Route path="/book-test/:testId" element={<LabTestBookingPage />} />
          <Route path="/category/health-packages" element={<HealthPackagesPage />} />
          <Route path="/category/medicines" element={<MedicinesPage />} />
          <Route path="/category/lab-tests" element={<LabTestsPage />} />

          {/* Payment Route with params */}
          <Route 
            path="/payment/:orderId/:totalPrice" 
            element={<Payment />} 
          />
         <Route path="/booking-payment/:bookingId/:amount" element={<BookingPayment />} />
          <Route path="/payment/verification" element={<PaymentVerification />} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/booking-success/:bookingId" element={<BookingSuccessScreen />} />
        </Routes>
      </Container>}
      {isAdminPage && <Routes>
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>}
      {isLoginPage && <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/signin" element={<Login />} />
      </Routes>}
      {!isAdminPage && !isLoginPage && <Footer />}
    </>
  );
};

function App() {
  useEffect(() => {
    testAPI();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
