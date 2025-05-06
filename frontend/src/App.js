// this is the main app file for the whole website, it controls all the pages
// import section - here we get all the tools we need
import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// react-router-dom - this helps us make different pages in our website
// input: none
// output: tools for making pages with urls

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
import InventoryPage from "./pages/InventoryPage";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import MessageButton from "./components/MessageButton";
import MessagePopup from "./components/MessagePopup";

// this is the main part that shows all the pages and routes
const AppRoutes = () => {
  // we get the user info from AuthContext so we know if someone is logged in
  const { user, loading } = useContext(AuthContext);

  // PrivateRoute - makes sure only logged in users can see some pages
  // input: children (the page content)
  // output: either the page or redirect to home if not logged in
  const PrivateRoute = ({ children }) => {
    if (loading) {
      // if still loading, show loading message
      return <div>Loading...</div>;
    }
    if (!user) {
      // if no user is logged in, go to homepage
      return <Navigate to="/" replace />;
    }
    // if user is logged in, show the page
    return children;
  };

  // AdminRoute - only admins can see these pages
  // input: children (the page content)
  // output: either the page or redirect if not admin
  const AdminRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (!user || user.userType !== "admin") {
      // if not admin, go to homepage
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // SellerRoute - only sellers can see these pages
  // input: children (the page content)
  // output: either the page or redirect if not seller
  const SellerRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (!user || user.userType !== "seller") {
      // if not seller, go to homepage
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // BuyerRoute - only buyers can see these pages
  // input: children (the page content)
  // output: either the page or redirect if not buyer
  const BuyerRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (!user || user.userType !== "buyer") {
      // if not buyer, go to homepage
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // this is for shopping cart, we remember how many items are in it
  const [cartItems, setCartItems] = React.useState(3);
  // this is for message popup, we remember if its open or closed
  const [isMessageOpen, setIsMessageOpen] = React.useState(false);

  // this function opens and closes the message popup
  // input: none
  // output: none (but it changes isMessageOpen)
  const toggleMessagePopup = () => {
    setIsMessageOpen(!isMessageOpen);
  };

  return (
    // Router makes the whole website work with different pages
    <Router>
      {/* WishlistProvider lets us save favorite items */}
      <WishlistProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Navbar is the menu at top of website */}
          <Navbar user={user} loading={loading} cartItems={cartItems} />
          <Routes>
            {/* Public Routes - everyone can see these, even without login */}
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

            {/* Protected User Dashboard - different for each user type */}
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
            {/* Protected Seller Inventory Page */}
            <Route
              path="/inventory"
              element={
                <SellerRoute>
                  <InventoryPage />
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
            {/* Redirect unknown routes to Home - if someone types wrong url */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* MessageButton is the chat button users can click */}
          <MessageButton onClick={toggleMessagePopup} />
          {/* MessagePopup is the chat window that appears when button clicked */}
          {isMessageOpen && <MessagePopup onClose={toggleMessagePopup} />}
          {/* Footer is the bottom part of website with links */}
          <Footer />
        </div>
      </WishlistProvider>
    </Router>
  );
};

// this is the main App component that wraps everything
// it provides authentication to all pages
const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

// we export App so other files can use it
export default App;
