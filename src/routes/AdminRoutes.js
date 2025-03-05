import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UsersPage from '../pages/admin/Users';
import ProductsPage from '../pages/admin/Products';
import EventsPage from '../pages/admin/Events';

const AdminRoutes = () => {
  // Add authentication check here
  const isAuthenticated = true; // Replace with actual auth check

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/events" element={<EventsPage />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;