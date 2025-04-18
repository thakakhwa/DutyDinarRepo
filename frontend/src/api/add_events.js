import axios from "axios";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

export const addEvent = async (formData) => {
  try {
    // Verify user is logged in and is a seller
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'seller') {
      throw new Error('Unauthorized: Please login as a seller');
    }

    // Make the POST request
    const response = await axios.post(
      `${API_BASE_URL}/add_events.php`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Add Event Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};