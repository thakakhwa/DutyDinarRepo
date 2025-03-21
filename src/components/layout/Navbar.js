import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Calendar, User, LogOut, Bell, ChevronDown, Search } from 'lucide-react';
import AuthModal from '../auth/AuthModal';

const Navbar = ({ isLoggedIn, userType, cartItems, setIsLoggedIn, setUserType }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType('buyer');
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="Duty Dinar Logo" 
                className="h-16 w-auto"
              />
            </Link>
          </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-green-600">Home</Link>
              <Link to="/categories" className="text-gray-600 hover:text-green-600">Categories</Link>
              <Link to="/events" className="text-gray-600 hover:text-green-600">Events</Link>
              {isLoggedIn && (
                <Link to="/dashboard" className="text-gray-600 hover:text-green-600">
                  {userType === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
                />
              </div>

              {isLoggedIn ? (
                <>
                  <Bell className="text-gray-600 cursor-pointer" size={24} />
                  {userType !== 'admin' && (
                    <div className="relative">
                      <ShoppingCart className="text-gray-600 cursor-pointer" size={24} />
                      {cartItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItems}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 text-gray-600"
                    >
                      <User size={24} />
                      <ChevronDown size={16} />
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          {userType === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                        </Link>
                        <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</Link>
                        <Link to="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Settings</Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
                        >
                          <LogOut size={16} className="mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={() =>{console.log("Checking if the auth modal opens");  setIsAuthModalOpen(true) }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
  
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          setIsLoggedIn={setIsLoggedIn}
          setUserType={setUserType}
        />
      </>
    );
  };
  
  export default Navbar;