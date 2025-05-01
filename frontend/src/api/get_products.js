import axios from 'axios';

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

// Get all products
export const getProducts = async (category = '', sortBy = '', priceRange = [0, 9999999], minOrderQuantity = 0, options = {}) => {
  try {
    const params = {
      category,
      sortBy,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minOrderQuantity,
      ...options,
    };
    const response = await axios.get(`${API_BASE_URL}/get_products.php`, {
      params,
    });

    return {
      success: response.data.success,
      message: response.data.message,
      products: response.data.data?.products || [],
    };
  } catch (error) {
    // Improved error logging to help diagnose JSON parse errors
    if (error.response) {
      const contentType = error.response.headers['content-type'];
      if (contentType && contentType.indexOf('application/json') === -1) {
        console.error('Expected JSON but received:', error.response.data);
      }
    } else {
      console.error('Error fetching products:', error.message);
    }
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
    if (error.response) {
      const contentType = error.response.headers['content-type'];
      if (contentType && contentType.indexOf('application/json') === -1) {
        console.error('Expected JSON but received:', error.response.data);
      }
    } else {
      console.error('Error fetching product:', error.message);
    }
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch product",
      product: null,
    };
  }
};
