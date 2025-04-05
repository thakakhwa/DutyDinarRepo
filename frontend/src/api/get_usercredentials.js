import axios from 'axios';

// Set your actual backend URL here - adjust if needed
const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

export const getUserCredentials = async () => {
  try {
    // Prevent caching with timestamp
    const timestamp = new Date().getTime();
    const response = await axios.get(
      `${API_BASE_URL}/get_usercredentails.php`,
      {
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );

    // Check for PHP errors in response
    if (response.data && typeof response.data === 'string' && response.data.includes('<?php')) {
      console.error('PHP script not processed correctly');
      return {
        success: false,
        message: 'Server configuration error. PHP script not processed correctly.',
        data: null
      };
    }

    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      return {
        success: false,
        message: 'Invalid server response format',
        data: null
      };
    }

    return {
      success: response.data.success === true,
      data: response.data.data,
      message: response.data.message || 'Operation completed'
    };

  } catch (error) {
    console.error('API Error:', error);
    
    // Temporary workaround for development - return mock data if connection fails
    // Remove this in production!
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock data for development');
      return {
        success: true,
        message: 'Using mock data (development only)',
        data: {
          name: 'Demo User',
          email: 'demo@example.com',
          userType: 'user',
          companyName: 'Demo Company'
        }
      };
    }
    
    let message = 'Connection error. Please check:';
    message += '\n1. XAMPP is running';
    message += '\n2. PHP file exists at htdocs/backend/api/';
    message += '\n3. No browser extensions blocking requests';
    
    if (error.response) {
      message = error.response.data?.message || `Server error (${error.response.status})`;
    }
    
    return {
      success: false,
      message: message,
      data: null
    };
  }
};