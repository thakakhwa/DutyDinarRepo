import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminRoutes from "./routes/AdminRoutes";
import ProductPage from "./pages/ProductPage";
import AboutUs from "./pages/AboutUs";
import Footer from "./components/layout/footer";
import AddEvents from "./pages/addEvents";
import FAQ from "./pages/FAQ";
import TOS from "./pages/TOS";
import Privacypolicy from "./pages/Privacy";
import ContactUs from "./pages/ContactUs";
import AccountProfile from "./pages/AccountProfile";
import AddProducts from "./pages/addProducts";
import Cart from "./pages/cart";
import FavoritesPage from "./pages/FavoritesPage";
import BookedEventsPage from "./pages/BookedEventsPage";
import Checkout from "./pages/Checkout";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import MessageButton from "./components/MessageButton";
import MessagePopup from "./components/MessagePopup";

const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  // Private Route to protect authenticated user routes
  const PrivateRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (!user) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Admin Route to restrict admin pages
  const AdminRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (!user || user.userType !== "admin") {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Seller Route to restrict seller pages
  const SellerRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (!user || user.userType !== "seller") {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Buyer Route to restrict buyer pages
  const BuyerRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (!user || user.userType !== "buyer") {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const [cartItems, setCartItems] = React.useState(3);
  const [isMessageOpen, setIsMessageOpen] = React.useState(false);

  const toggleMessagePopup = () => {
    setIsMessageOpen(!isMessageOpen);
  };

  return (
    <Router>
      <WishlistProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar user={user} loading={loading} cartItems={cartItems} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/event/:eventId" element={<EventDetailsPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/tos" element={<TOS />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/Privacy" element={<Privacypolicy />} />
            <Route
              path="/profile"
              element={
                <AccountProfile />
              }
            />

            {/* Protected Cart Route for Buyers */}
            <Route
              path="/cart"
              element={
                <BuyerRoute>
                  <Cart />
                </BuyerRoute>
              }
            />

            {/* Protected Favorites Route for Buyers */}
            <Route
              path="/favorites"
              element={
                <BuyerRoute>
                  <FavoritesPage />
                </BuyerRoute>
              }
            />

            {/* Protected Booked Events Route for Buyers */}
            <Route
              path="/booked-events"
              element={
                <BuyerRoute>
                  <BookedEventsPage />
                </BuyerRoute>
              }
            />

            {/* Protected User Dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  {user && user.userType === "admin" ? (
                    <Navigate to="/admin" replace />
                  ) : user && user.userType === "seller" ? (
                    <SellerDashboard />
                  ) : (
                    <BuyerDashboard />
                  )}
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <BuyerRoute>
                  <Checkout />
                </BuyerRoute>
              }
            />
            {/* Protected Seller Add Event Page */}
            <Route
              path="/add-events"
              element={
                <SellerRoute>
                  <AddEvents />
                </SellerRoute>
              }
            />
            {/* Protected Seller Add Products Page */}
            <Route
              path="/add-products"
              element={
                <SellerRoute>
                  <AddProducts />
                </SellerRoute>
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
          <MessageButton onClick={toggleMessagePopup} />
          {isMessageOpen && <MessagePopup onClose={toggleMessagePopup} />}
          <Footer />
        </div>
      </WishlistProvider>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
