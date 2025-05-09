import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Handles API errors that require authentication
 * 
 * @param {Object} error - The error response from an API call
 * @param {Function} navigate - The React Router navigate function
 * @returns {boolean} - True if this was an auth error and was handled, false otherwise
 */
export const handleAuthError = (error, navigate) => {
  // Check if the error has response data
  if (error?.response?.data?.auth_required) {
    // Store the current URL to redirect back after login
    const currentPath = window.location.pathname;
    localStorage.setItem('redirectAfterLogin', currentPath);
    
    // Navigate to login page
    navigate('/login', { 
      state: { 
        message: 'Please log in to continue.', 
        redirectPath: currentPath
      }
    });
    
    return true;
  }
  
  return false;
};

/**
 * React hook that provides a function to handle auth errors
 * 
 * @returns {Function} - Function to handle auth errors
 */
export const useAuthErrorHandler = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const handleApiAuthError = (error) => {
    if (!user) {
      return handleAuthError(error, navigate);
    }
    return false;
  };
  
  return handleApiAuthError;
}; 