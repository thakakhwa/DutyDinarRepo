import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import UsersPage from "../pages/admin/Users";
import ProductsPage from "../pages/admin/Products";
import EventsPage from "../pages/admin/Events";
import OrdersPage from "../pages/admin/Orders";
import AnalyticsPage from "../pages/admin/Analytics";
import MessagesPage from "../pages/admin/Messages";
import SettingsPage from "../pages/admin/Settings";

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
