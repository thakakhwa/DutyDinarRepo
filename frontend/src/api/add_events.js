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

<<<<<<< HEAD
    // Make the POST request
    const response = await axios.post(
      `${API_BASE_URL}/add_events.php`,
      formData,
=======
    // Prepare payload
    let payload;
    if (formData instanceof FormData) {
      // Convert FormData to plain object
      payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });
    } else {
      payload = formData;
    }

    // Make the POST request
    const response = await axios.post(
      `${API_BASE_URL}/add_events.php`,
      JSON.stringify(payload),
>>>>>>> fixedbranchfsfs
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