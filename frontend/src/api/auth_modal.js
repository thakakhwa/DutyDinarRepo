import axios from "axios";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login.php`, { email, password });

    if (response.data.success) {
      // Set session after login
      await setSession(response.data.data.id, email, response.data.data.userType);
    }

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data || null,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
      data: null,
    };
  }
};

// Function to set the session
const setSession = async (userId, email, userType) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/set_session.php`, {
      userId,
      email,
      userType,
    });

    return response.data.success;
  } catch (error) {
    console.error("Error setting session", error);
    return false;
  }
};

export const signupUser = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup.php`, formData);

    if (response.data.success) {
      // Auto-login after signup
      const loginResponse = await loginUser(formData.email, formData.password);
      if (loginResponse.success) {
        // Set session after login
        await setSession(loginResponse.data.id, formData.email, loginResponse.data.userType);
      }
    }

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data || null,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Signup failed",
      data: null,
    };
  }
};
