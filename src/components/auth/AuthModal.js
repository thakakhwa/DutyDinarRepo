import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const ADMIN_CREDENTIALS = {
  email: 'admin@dutydinar.com',
  password: 'admin123'
};

const AuthModal = ({ isOpen, onClose, setIsLoggedIn, setUserType }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    userType: 'buyer'
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnimating(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (formData.email === ADMIN_CREDENTIALS.email && 
          formData.password === ADMIN_CREDENTIALS.password) {
        setIsLoggedIn(true);
        setUserType('admin');
        onClose();
        navigate('/admin');
        return;
      }

      if (!isLogin) {
        // Handle registration logic
        setIsLoggedIn(true);
        setUserType(formData.userType);
        onClose();
        navigate('/dashboard');
      } else {
        // Handle regular login
        setIsLoggedIn(true);
        setUserType(formData.email.includes('seller') ? 'seller' : 'buyer');
        onClose();
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsAnimating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const toggleForm = () => {
    setIsAnimating(true);
    setError('');
    setTimeout(() => {
      setIsLogin(!isLogin);
      setFormData({
        email: '',
        password: '',
        name: '',
        companyName: '',
        userType: 'buyer'
      });
      setIsAnimating(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className={`bg-white rounded-lg shadow-xl relative overflow-hidden transition-all duration-300 transform ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
          <div className="p-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">DD</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome Back!' : 'Join Duty Dinnar'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isLogin ? 'Sign in to your account' : 'Create an account to get started'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="userType" className="block text-sm font-medium text-gray-700">Account Type</label>
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>

                  {formData.userType === 'seller' && (
                    <div className="space-y-2 transition-all duration-300">
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          placeholder="Your Company"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          required={formData.userType === 'seller'}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={`w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center ${isAnimating ? 'animate-pulse' : ''}`}
                disabled={isAnimating}
              >
                {isAnimating ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={toggleForm}
                  className="text-green-600 hover:text-green-700 font-medium"
                  disabled={isAnimating}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
              {isLogin && (
                <p className="text-xs text-gray-500 mt-4">
                  Admin login: admin@dutydinar.com / admin123
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;


