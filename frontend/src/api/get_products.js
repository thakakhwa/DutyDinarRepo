import axios from 'axios';

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

// Get all products
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

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_products.php`, {
      params: { id }
    });

    return {
      success: response.data.success,
      message: response.data.message,
      product: response.data.data?.product || null,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch product",
      product: null,
    };
  }
};