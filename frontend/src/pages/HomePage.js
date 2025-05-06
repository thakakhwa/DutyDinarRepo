import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories } from '../api/get_categories';
import { getProducts } from '../api/get_products';
import FeaturedProducts from '../components/products/FeaturedProducts';
import EventPreview from '../components/events/EventPreview';
import AuthModal from '../components/auth/AuthModal';
import axios from 'axios';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [initialUserType, setInitialUserType] = useState('buyer');
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalProducts: 0,
    totalSellers: 0,
    totalBuyers: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      setIsLoggedIn(true);
      setUserType(localStorage.getItem('userType'));
    }

    // Fetch quick stats
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost/DutyDinarRepo/backend/api/get_home_stats.php');
        if (response.data.success) {
          setStats({
            totalEvents: response.data.totalEvents || 0,
            totalProducts: response.data.totalProducts || 0,
            totalSellers: response.data.totalSellers || 0,
            totalBuyers: response.data.totalBuyers || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.categories);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProducts();
      if (response.success) {
        setProducts(response.products);
      }
    };
    fetchProducts();
  }, []);

  const handleStartBuying = () => {
    setInitialUserType('buyer');
    setIsAuthModalOpen(true);
  };

  const handleBecomeSeller = () => {
    setInitialUserType('seller');
    setIsAuthModalOpen(true);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditional Hero Section */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white"></div>
            <div className="absolute top-1/2 -left-48 w-96 h-96 rounded-full bg-white"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl font-bold mb-4">
                  Connect with Top Manufacturers & Distributors
                </h1>
                <p className="text-lg mb-6">
                  Duty Dinar brings businesses and suppliers together in one powerful B2B platform
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={handleStartBuying}
                    className="z-10 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold"
                  >
                    Start Buying
                  </button>
                  <button 
                    onClick={handleBecomeSeller}
                    className="z-10 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Become a Seller
                  </button>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white rounded-lg p-8 text-gray-800">
                  <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{stats.totalSellers}</div>
                      <div className="text-gray-600">Verified Suppliers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{stats.totalProducts}</div>
                      <div className="text-gray-600">Products Listed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{stats.totalBuyers}</div>
                      <div className="text-gray-600">Business Buyers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{stats.totalEvents}</div>
                      <div className="text-gray-600">Events Listed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section (Always Visible) */}
      <div className="max-w-7xl mx-auto mt-16 px-4">
        <h2 className="text-2xl font-semibold mb-8">Browse Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map(({ id, name }) => (
            <div 
              key={id} 
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg hover:shadow-xl cursor-pointer"
              onClick={() => handleCategoryClick(id)}
            >
              <Package className="text-green-600 mb-2" size={32} />
              <span className="text-sm text-center">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        setIsLoggedIn={setIsLoggedIn}
        setUserType={setUserType}
        initialUserType={initialUserType}
      />

      <FeaturedProducts />
      <EventPreview />
    </div>
  );
};

export default HomePage;
