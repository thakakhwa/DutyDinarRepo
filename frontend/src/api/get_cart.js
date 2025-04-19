import axios from "axios";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

export const getCart = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_cart.php`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch cart",
      };
    }
  } catch (error) {
    console.error("Cart fetch error:", error);
    return {
      success: false,
      message: error.message || "Network error",
    };
  }
};
