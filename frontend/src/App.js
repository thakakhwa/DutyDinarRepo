import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminRoutes from './routes/AdminRoutes';
import ProductPage from './pages/ProductPage';
import AboutUs from './pages/AboutUs';
import Footer from './components/layout/footer';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import TOS from './pages/TOS';
import privacypolicy from "./components/popups/privacypolicy";


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [cartItems, setCartItems] = useState(3);

  useEffect(() => {
    // Load authentication status from localStorage
    const savedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedUserType = localStorage.getItem('userType');

    if (savedIsLoggedIn && savedUserType) {
      setIsLoggedIn(true);
      setUserType(savedUserType);
    } else {
      setIsLoggedIn(false);
      setUserType(null);
    }
  }, []);

  // Private Route to protect authenticated user routes
  const PrivateRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Admin Route to restrict admin pages
  const AdminRoute = ({ children }) => {
    if (!isLoggedIn || userType !== 'admin') {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          isLoggedIn={isLoggedIn}
          userType={userType}
          cartItems={cartItems}
          setIsLoggedIn={setIsLoggedIn}
          setUserType={setUserType}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/event/:eventId" element={<EventDetailsPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />}/>
          <Route path="/faq" element={<FAQ />}/>
          <Route path="/tos" element={<TOS />}/>

          {/* Protected User Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                {userType === 'seller' ? <SellerDashboard /> : <BuyerDashboard />}
              </PrivateRoute>
            } 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <AdminRoute>
                <AdminRoutes />
              </AdminRoute>
            } 
          />

          {/* Redirect unknown routes to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
