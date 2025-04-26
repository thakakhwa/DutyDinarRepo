import { API_BASE_URL } from './apiConfig';

export const updateProduct = async (productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update_products.php`, {
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
