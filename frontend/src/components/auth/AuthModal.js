import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
  const emailRef = useRef(null);
  const [isLogin, setIsLogin] = useState(initialUserType !== 'seller');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState('');
  const [lastAttempt, setLastAttempt] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company_name: '', // Matches MySQL column name exactly
    user_type: initialUserType || '' // Matches MySQL column name
  });

  // Auto-focus email field on open
  useEffect(() => {
    if (isOpen && emailRef.current) {
      emailRef.current.focus();
    }
  }, [isOpen]);

  // Password strength calculator
  useEffect(() => {
    if (formData.password.length > 0) {
      let strength = 0;
      if (formData.password.length >= 8) strength += 1;
      if (/[A-Z]/.test(formData.password)) strength += 1;
      if (/[0-9]/.test(formData.password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const checkSession = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CHECK_SESSION, {
        withCredentials: true,
        timeout: 5000
      });
      
      if (response.data.status === 'success') {
        setIsLoggedIn(true);
        setUserType(response.data.data.user_type);
      }
    } catch (error) {
      console.error('Session check:', error.message);
    }
  };

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!isLogin && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!isLogin && !formData.name) {
      setError('Full name is required');
      return false;
    }
    if (!isLogin && !formData.user_type) {
      setError('Please select account type');
      return false;
    }
    if (formData.user_type === 'seller' && !formData.company_name) {
      setError('Company name is required for sellers');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Date.now() - lastAttempt < 2000) {
      setError('Please wait before trying again');
      return;
    }
    
    if (!validateForm()) return;
    
    setIsAnimating(true);
    setError('');
    setLastAttempt(Date.now());

    try {
      const payload = {
        email: formData.email,
        password: formData.password
      };

      if (!isLogin) {
        payload.name = formData.name;
        payload.user_type = formData.user_type;
        if (formData.user_type === 'seller') {
          payload.company_name = formData.company_name;
        }
      }

      const endpoint = isLogin ? API_ENDPOINTS.LOGIN : API_ENDPOINTS.SIGNUP;
      const response = await axios.post(endpoint, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.status === 'success') {
        setIsLoggedIn(true);
        setUserType(response.data.data.user_type);
        onClose();
        navigate(response.data.data.redirect_to || '/dashboard');
      } else {
        throw new Error(response.data.message || 'Authentication failed');
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
    if (error.response) {
      switch (error.response.data?.message) {
        case 'invalid_credentials': return 'Invalid email or password';
        case 'email_exists': return 'Email already registered';
        case 'password_too_weak': return 'Password needs 8+ chars with numbers/symbols';
        case 'missing_fields': return 'Please fill all required fields';
        default: return error.response.data?.message || 'Request failed';
      }
    }
    return error.message;
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
        password: '',
        ...(isLogin ? { 
          name: '',
          company_name: '',
          user_type: ''
        } : {})
      }));
      setIsAnimating(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
    >
      <div className="w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 z-50"
          aria-label="Close authentication modal"
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

            <h1 id="auth-modal-title" className="text-2xl font-bold text-gray-900 text-center mb-2">
              {isLogin ? 'Welcome To DutyDinar!' : 'Join DutyDinar!'}
            </h1>
            <p className="text-gray-600 text-center mb-6">
              {isLogin ? 'Sign in to your account' : 'Create an account to get started'}
            </p>

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
                    <label htmlFor="user_type" className="block text-sm font-medium text-gray-700">Account Type</label>
                    <select
                      id="user_type"
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      required
                    >
                      <option value="" disabled>- Select -</option>
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>
                
                  {formData.user_type === 'seller' && (
                    <div className="space-y-2 animate-fadeIn">
                      <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          id="company_name"
                          name="company_name"
                          type="text"
                          placeholder="Your Company"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={formData.company_name}
                          onChange={handleInputChange}
                          required
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
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="username"
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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!isLogin && formData.password && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          passwordStrength >= level 
                            ? level > 2 ? 'bg-green-500' : 'bg-yellow-500' 
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className={`w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors ${
                  isAnimating ? 'animate-pulse' : ''
                }`}
                disabled={isAnimating}
              >
                {isAnimating ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
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
                  type="button"
                  onClick={toggleForm}
                  className="text-green-600 hover:text-green-700 font-medium focus:outline-none"
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