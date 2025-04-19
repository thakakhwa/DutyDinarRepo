import { API_BASE_URL } from './apiConfig';

export const getFavorites = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_favorites.php`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};
