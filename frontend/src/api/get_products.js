import axios from 'axios';

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api"; // Adjust this URL

export const getProducts = async (category = '', sortBy = '', priceRange = [0, 10000], minOrderQuantity = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_products.php`, {
      params: {
        category,
        sortBy,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minOrderQuantity,
      },
    });

    return {
      success: response.data.success,
      message: response.data.message,
      products: response.data.data?.products || [],
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch products",
      products: [],
    };
  }
};
