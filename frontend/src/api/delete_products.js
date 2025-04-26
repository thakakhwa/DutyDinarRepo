import { API_BASE_URL } from './apiConfig';

export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete_products.php`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: productId }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};
