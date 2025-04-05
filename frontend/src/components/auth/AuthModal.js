import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from "../../api/auth_modal";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

const AuthModal = ({ 
  isOpen, 
  onClose, 
  setIsLoggedIn, 
  setUserType, 
  initialUserType = 'buyer' 
}) => {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    companyName: "",
    userType: initialUserType,
  });

  useEffect(() => {
    if (isOpen && emailRef.current) {
      emailRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      userType: initialUserType
    }));
  }, [initialUserType]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnimating(true);
    setError("");

    try {
      let response;
      if (isLogin) {
        response = await loginUser(formData.email, formData.password);
      } else {
        response = await signupUser(formData);
        if (response.status === "success") {
          response = await loginUser(formData.email, formData.password);
        }
      }

      if (response.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", response.data.userType);

        // Force full page refresh with redirect
        if (response.data.userType === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsAnimating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const toggleForm = () => {
    setIsAnimating(true);
    setError("");
    setTimeout(() => {
      setIsLogin(!isLogin);
      setFormData({
        email: "",
        password: "",
        name: "",
        companyName: "",
        userType: initialUserType,
      });
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
                    <label htmlFor="userType" className="block text-sm font-medium text-gray-700">Account Type</label>
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      required
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>
                
                  {formData.userType === 'seller' && (
                    <div className="space-y-2 animate-fadeIn">
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
                ) : isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={toggleForm} className="text-green-600 hover:text-green-700 font-semibold">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={toggleForm} className="text-green-600 hover:text-green-700 font-semibold">
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;