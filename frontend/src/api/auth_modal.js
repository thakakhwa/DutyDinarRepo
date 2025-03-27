import axios from "axios";

const API_BASE_URL = "http://localhost/Duty_Dinnar/backend/api";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login.php`, { email, password });

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

export const signupUser = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup.php`, formData);

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
