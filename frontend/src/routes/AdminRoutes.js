import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
  const [isAuthenticated, setIsAuthenticated] = useState(null); // NULL for loading state
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:5000/check-session", {
          method: "GET",
          credentials: "include", // Allows cookies to be sent
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.status && data.data.userType === "admin") {
          setIsAuthenticated(true);
          setUserType(data.data.userType);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  // Show loading while session is being checked
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">Checking authentication...</div>;
  }

  // Redirect if not authenticated or not an admin
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
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
