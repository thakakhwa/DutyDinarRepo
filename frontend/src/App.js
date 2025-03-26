import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import EventsPage from './pages/EventsPage';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminRoutes from './routes/AdminRoutes';
import Footer from './components/layout/footer';
import AboutUs from './pages/AboutUs';
import AuthModal from './components/auth/AuthModal';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('token') !== null;
  });
  const [userType, setUserType] = useState(() => {
    return localStorage.getItem('userType') || 'buyer';
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartItems] = useState(3); // Assuming this is managed elsewhere
  const isAdmin = userType === 'admin';

  // Session check on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('http://localhost/backend/api/check_session.php', {
          withCredentials: true
        });
        
        if (response.data.status === 'success') {
          handleLoginSuccess(response.data.data.user_type);
        }
      } catch (error) {
        handleLogout();
      }
    };

    if (isLoggedIn) checkSession();
  }, []);

  const handleLoginSuccess = (userType) => {
    setIsLoggedIn(true);
    setUserType(userType);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost/backend/api/logout.php', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.clear();
    setIsLoggedIn(false);
    setUserType('buyer');
  };

  const AuthProtectedRoute = ({ children, requiredRole }) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return <Navigate to="/" />;
    }
    
    if (requiredRole && userType !== requiredRole) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {!isAdmin && (
          <Navbar 
            isLoggedIn={isLoggedIn} 
            userType={userType} 
            cartItems={cartItems}
            onLogout={handleLogout}
            onAuthRequest={() => setShowAuthModal(true)}
          />
        )}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          setIsLoggedIn={setIsLoggedIn}
          setUserType={setUserType}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/about" element={<AboutUs />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <AuthProtectedRoute>
                {userType === 'seller' ? <SellerDashboard /> : <BuyerDashboard />}
              </AuthProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AuthProtectedRoute requiredRole="admin">
                <AdminRoutes onLogout={handleLogout} />
              </AuthProtectedRoute>
            }
          />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;