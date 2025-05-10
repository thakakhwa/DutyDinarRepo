// this is the main app file for the whole website, it controls all the pages
// import section - here we get all the tools we need
import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
import EditProductPage from "./pages/EditProductPage";
import EditEventPage from "./pages/EditEventPage";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import MessageButton from "./components/MessageButton";
import MessagePopup from "./components/MessagePopup";

const pageVariants = {
  initial: {
    opacity: 0,
    x: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  out: {
    opacity: 0,
    x: 0,
    y: -20,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.1,
};

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

  const location = useLocation();

  return (
    <WishlistProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} loading={loading} cartItems={cartItems} />
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <HomePage />
                </motion.div>
              }
            />
            <Route
              path="/categories"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <CategoriesPage />
                </motion.div>
              }
            />
            <Route
              path="/events"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <EventsPage />
                </motion.div>
              }
            />
            <Route
              path="/product/:productId"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProductPage />
                </motion.div>
              }
            />
            <Route
              path="/event/:eventId"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <EventDetailsPage />
                </motion.div>
              }
            />
            <Route
              path="/about"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <AboutUs />
                </motion.div>
              }
            />
            <Route
              path="/tos"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <TOS />
                </motion.div>
              }
            />
            <Route
              path="/faq"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <FAQ />
                </motion.div>
              }
            />
            <Route
              path="/contact"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ContactUs />
                </motion.div>
              }
            />
            <Route
              path="/Privacy"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Privacypolicy />
                </motion.div>
              }
            />
            <Route
              path="/profile"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <AccountProfile />
                </motion.div>
              }
            />
            <Route
              path="/cart"
              element={
                <BuyerRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Cart />
                  </motion.div>
                </BuyerRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <BuyerRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <FavoritesPage />
                  </motion.div>
                </BuyerRoute>
              }
            />
            <Route
              path="/booked-events"
              element={
                <BuyerRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <BookedEventsPage />
                  </motion.div>
                </BuyerRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    {user && user.userType === "admin" ? (
                      <Navigate to="/admin" replace />
                    ) : user && user.userType === "seller" ? (
                      <SellerDashboard />
                    ) : (
                      <BuyerDashboard />
                    )}
                  </motion.div>
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <BuyerRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Checkout />
                  </motion.div>
                </BuyerRoute>
              }
            />
            <Route
              path="/add-events"
              element={
                <SellerRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AddEvents />
                  </motion.div>
                </SellerRoute>
              }
            />
            <Route
              path="/add-products"
              element={
                <SellerRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AddProducts />
                  </motion.div>
                </SellerRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <SellerRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <InventoryPage />
                  </motion.div>
                </SellerRoute>
              }
            />
            <Route
              path="/edit-product"
              element={
                <SellerRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <EditProductPage />
                  </motion.div>
                </SellerRoute>
              }
            />
            <Route
              path="/edit-event"
              element={
                <SellerRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <EditEventPage />
                  </motion.div>
                </SellerRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AdminRoutes />
                  </motion.div>
                </AdminRoute>
              }
            />
            <Route
              path="*"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Navigate to="/" replace />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
        <MessageButton onClick={toggleMessagePopup} />
        {isMessageOpen && <MessagePopup onClose={toggleMessagePopup} />}
        <Footer />
      </div>
    </WishlistProvider>
  );
};

// this is the main App component that wraps everything
// it provides authentication to all pages
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

// we export App so other files can use it
export default App;
