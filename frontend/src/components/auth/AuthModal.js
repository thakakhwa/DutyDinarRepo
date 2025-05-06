import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from "../../api/auth";
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const AuthModal = ({
  isOpen,
  onClose,
  initialUserType = 'buyer'
}) => {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const { handleLogin } = useContext(AuthContext);
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

  // New state for forget password modal and flow
  const [isForgetPasswordOpen, setIsForgetPasswordOpen] = useState(false);
  const [forgetPasswordEmail, setForgetPasswordEmail] = useState("");
  const [forgetPasswordError, setForgetPasswordError] = useState("");
  const [forgetPasswordSuccess, setForgetPasswordSuccess] = useState("");
  
  // Add new states for the reset password flow
  const [resetStep, setResetStep] = useState(1); // 1: Email entry, 2: Verification code, 3: New password
  const [verificationCode, setVerificationCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // For testing - store the code received in the API response
  const [testingCode, setTestingCode] = useState("");

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
        response = await handleLogin(formData.email, formData.password);
      } else {
        // Password validation on signup
        const { validatePassword } = await import("../../utils/passwordValidation");
        const { valid, errors } = validatePassword(formData.password);
        if (!valid) {
          setError("Password is invalid: " + errors.join(" "));
          setIsAnimating(false);
          return;
        }

        response = await signupUser(formData);
        if (response.status === "success") {
          response = await handleLogin(formData.email, formData.password);
        }
      }

      if (response.success) {
        onClose();

        // Redirect without full page refresh
        if (response.userType === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(response.message || "Something went wrong. Please try again.");
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

  // Handlers for forget password modal
  const openForgetPasswordModal = () => {
    setForgetPasswordEmail("");
    setForgetPasswordError("");
    setForgetPasswordSuccess("");
    setResetStep(1); // Reset to the first step
    setIsForgetPasswordOpen(true);
  };

  const closeForgetPasswordModal = () => {
    setIsForgetPasswordOpen(false);
  };

  const handleForgetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgetPasswordError("");
    setForgetPasswordSuccess("");

    if (!forgetPasswordEmail) {
      setForgetPasswordError("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch("http://localhost/DutyDinarRepo/backend/api/forgot_password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgetPasswordEmail }),
      });
      const data = await response.json();
      console.log("Forgot Password API response:", data);
      
      if (data.success) {
        setForgetPasswordSuccess(data.message);
        
        // Check if the email exists in the system from the data
        if (data.data && data.data.exists === true) {
          // If the email exists, move to the verification code step
          setResetStep(2);
          
          // For testing purposes, store the verification code if provided in the response
          if (data.data.code) {
            setTestingCode(data.data.code);
          }
        } else {
          // If the email doesn't exist, just show the success message but don't move to next step
          setForgetPasswordSuccess("If this email is registered, you will receive a verification code.");
        }
      } else {
        setForgetPasswordError(data.message || "Failed to send reset instructions.");
      }
    } catch (error) {
      console.error("Forgot Password API error:", error);
      setForgetPasswordError("An error occurred. Please try again.");
    }
  };

  // Handle verification code submission
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setForgetPasswordError("");
    
    if (!verificationCode) {
      setForgetPasswordError("Please enter the verification code.");
      return;
    }

    try {
      const response = await fetch("http://localhost/DutyDinarRepo/backend/api/verify_reset_code.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: forgetPasswordEmail,
          code: verificationCode
        }),
      });
      
      const data = await response.json();
      console.log("Verify Code API response:", data);
      
      if (data.success) {
        // Move to the reset password step
        setResetStep(3);
        setResetToken(data.data.reset_token);
        setUserId(data.data.user_id);
      } else {
        setForgetPasswordError(data.message || "Invalid verification code.");
      }
    } catch (error) {
      console.error("Verify Code API error:", error);
      setForgetPasswordError("An error occurred. Please try again.");
    }
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgetPasswordError("");
    
    if (!newPassword) {
      setForgetPasswordError("Please enter a new password.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setForgetPasswordError("Passwords do not match.");
      return;
    }
    
    try {
      const response = await fetch("http://localhost/DutyDinarRepo/backend/api/reset_password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          user_id: userId,
          reset_token: resetToken,
          new_password: newPassword,
          confirm_password: confirmPassword
        }),
      });
      
      const data = await response.json();
      console.log("Reset Password API response:", data);
      
      if (data.success) {
        // Close the reset password modal and show success in the main modal
        setIsForgetPasswordOpen(false);
        setError(""); // Clear any existing error
        setIsLogin(true); // Ensure we're on the login screen
        // Add a temporary success message
        setTimeout(() => {
          alert("Password has been reset successfully. Please login with your new password.");
        }, 500);
      } else {
        setForgetPasswordError(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset Password API error:", error);
      setForgetPasswordError("An error occurred. Please try again.");
    }
  };

  if (!isOpen && !isForgetPasswordOpen) return null;

  return (
    <>
      {/* Main Auth Modal */}
      {isOpen && !isForgetPasswordOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
        >
          <div className="w-full max-w-full sm:max-w-md max-h-[90vh] overflow-y-auto relative">
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

                  {/* Forget Password Link */}
                  {isLogin && (
                    <div className="text-right text-sm mt-1">
                      <button
                        type="button"
                        onClick={openForgetPasswordModal}
                        className="text-green-600 hover:text-green-700 font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

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
      )}

      {/* Forget Password Modal */}
      {isForgetPasswordOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forget-password-modal-title"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
        >
          <div className="w-full max-w-full sm:max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeForgetPasswordModal}
              className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 z-50"
              aria-label="Close forget password modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="bg-white rounded-lg shadow-xl p-6">
              <h1 id="forget-password-modal-title" className="text-2xl font-bold text-gray-900 text-center mb-4">
                {resetStep === 1 ? 'Forgot Password' : 
                 resetStep === 2 ? 'Verification Code' : 'Reset Password'}
              </h1>
              
              {resetStep === 1 && (
                <p className="text-gray-600 text-center mb-6">
                  Enter your email address to receive password reset instructions.
                </p>
              )}
              
              {resetStep === 2 && (
                <p className="text-gray-600 text-center mb-6">
                  Enter the 6-digit verification code sent to your email.
                </p>
              )}
              
              {resetStep === 3 && (
                <p className="text-gray-600 text-center mb-6">
                  Create a new password for your account.
                </p>
              )}

              {forgetPasswordError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {forgetPasswordError}
                </div>
              )}

              {forgetPasswordSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  {forgetPasswordSuccess}
                </div>
              )}
              
              {/* Testing info - show the verification code for testing */}
              {testingCode && resetStep === 2 && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <p><strong>For testing:</strong> The verification code is: {testingCode}</p>
                </div>
              )}

              {/* Step 1: Email Entry Form */}
              {resetStep === 1 && (
                <form onSubmit={handleForgetPasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="forgetPasswordEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        id="forgetPasswordEmail"
                        name="forgetPasswordEmail"
                        type="email"
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={forgetPasswordEmail}
                        onChange={(e) => setForgetPasswordEmail(e.target.value)}
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}
              
              {/* Step 2: Verification Code Form */}
              {resetStep === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">Verification Code</label>
                    <input
                      id="verificationCode"
                      name="verificationCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-xl tracking-widest"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                      autoComplete="one-time-code"
                    />
                    <p className="text-sm text-gray-500 text-center">We sent a 6-digit code to {forgetPasswordEmail}</p>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                  >
                    Verify Code
                  </button>
                  
                  <div className="text-center mt-2">
                    <button 
                      type="button" 
                      onClick={handleForgetPasswordSubmit}
                      className="text-green-600 hover:text-green-700 text-sm"
                    >
                      Didn't receive a code? Send again
                    </button>
                  </div>
                </form>
              )}
              
              {/* Step 3: New Password Form */}
              {resetStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        required
                        autoComplete="new-password"
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
                    <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                  >
                    Reset Password
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthModal;
