import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import EventsPage from './pages/EventsPage';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminRoutes from './routes/AdminRoutes';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('buyer');
  const [cartItems, setCartItems] = useState(3);
  const isAdmin = userType === 'admin';

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/" />;
  };

  const AdminRoute = ({ children }) => {
    return isAdmin ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {!isAdmin && (
          <Navbar 
            isLoggedIn={isLoggedIn} 
            userType={userType} 
            cartItems={cartItems}
            setIsLoggedIn={setIsLoggedIn}
            setUserType={setUserType}
          />
        )}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/events" element={<EventsPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                {userType === 'seller' ? <SellerDashboard /> : <BuyerDashboard />}
              </PrivateRoute>
            } 
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminRoutes />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;