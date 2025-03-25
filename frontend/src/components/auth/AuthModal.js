import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from "axios";

const API_BASE = 'http://localhost/backend/api';
const API_ENDPOINTS = {
  LOGIN: `${API_BASE}/login.php`,
  SIGNUP: `${API_BASE}/signup.php`,
  CHECK_SESSION: `${API_BASE}/check_session.php`,
  LOGOUT: `${API_BASE}/logout.php`
};

const AuthModal = ({ 
  isOpen, 
  onClose, 
  setIsLoggedIn, 
  setUserType, 
  initialUserType = '' 
}) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialUserType !== 'seller');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    userType: initialUserType || ''
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CHECK_SESSION, {
          withCredentials: true
        });
        
        if (response.data.status === 'success') {
          setIsLoggedIn(true);
          setUserType(response.data.data.user_type);
        }
      } catch (error) {
        // No active session
      }
    };

    if (isOpen) checkSession();
  }, [isOpen, setIsLoggedIn, setUserType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnimating(true);
    setError('');

    try {
      let response;
      const payload = {
        email: formData.email,
        password: formData.password
      };

      if (isLogin) {
        response = await axios.post(API_ENDPOINTS.LOGIN, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        if (!formData.name || !formData.userType) {
          throw new Error('Please fill all required fields');
        }

        payload.name = formData.name;
        payload.user_type = formData.userType;
        if (formData.userType === 'seller') {
          payload.company_name = formData.companyName;
        }

        response = await axios.post(API_ENDPOINTS.SIGNUP, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (response.data.status === 'success') {
        setIsLoggedIn(true);
        setUserType(response.data.data.user_type);
        onClose();
        navigate(response.data.data.redirect_to || '/dashboard');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = getReadableError(error);
      setError(errorMessage);
      console.error('Auth error:', error);
    } finally {
      setIsAnimating(false);
    }
  };

  const getReadableError = (error) => {
    const message = error.response?.data?.message || error.message;
    const errorMap = {
      'invalid_credentials': 'Invalid email or password',
      'email_exists': 'Email already registered',
      'password_too_weak': 'Password must be at least 8 characters',
      'missing_fields': 'Please fill all required fields'
    };
    return errorMap[message.toLowerCase()] || message;
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
      setFormData(prev => ({
        ...prev,
        name: '',
        companyName: '',
        password: '',
        email: '',
      }));
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
                {isLogin ? 'Welcome To DutyDinar!' : 'Join DutyDinar!'}
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
                        placeholder="Full Name"
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
                      required
                    >
                      <option value="" disabled>-</option>
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
                    placeholder="name@email.com"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;