import { API_BASE_URL } from './apiConfig';

export const addProduct = async (productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/add_products.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_categories.php`, {
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};
