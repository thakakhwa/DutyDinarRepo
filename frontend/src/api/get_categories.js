import axios from "axios";

const API_BASE_URL = "http://localhost/Duty_Dinnar/backend/api"; // Adjust this URL

export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_categories.php`);
    return {
      success: response.data.success,
      message: response.data.message,
      categories: response.data.data?.categories || [],
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch categories",
      categories: [],
    };
  }
};
