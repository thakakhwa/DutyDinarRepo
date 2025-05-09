// api/wishlistApi.js

import axios from 'axios';
import { handleAuthError } from '../utils/authUtils';

const API_URL = 'http://localhost/DutyDinarRepo/backend/api';

// Get all wishlist items for the current user
export const getWishlistItems = async (navigate) => {
  try {
    const response = await axios.get(`${API_URL}/get_favorites.php`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.auth_required && navigate) {
      handleAuthError(error, navigate);
      return { success: false, auth_required: true };
    }
    console.error('Error fetching wishlist items:', error);
    throw error;
  }
};

// Add item to wishlist
export const addToWishlist = async (type, itemId, navigate) => {
  try {
    const payload = type === 'product' ? { product_id: itemId } : { event_id: itemId };
    const response = await axios.post(`${API_URL}/add_to_wishlist.php`, payload);
    return response.data;
  } catch (error) {
    if (error.response?.data?.auth_required && navigate) {
      handleAuthError(error, navigate);
      return { success: false, auth_required: true };
    }
    console.error('Error adding item to wishlist:', error);
    throw error;
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (wishlistId) => {
  try {
    const response = await axios.post(`${API_URL}/remove_from_wishlist.php`, { id: wishlistId });
    return response.data;
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    throw error;
  }
};

// Find an item in the wishlist by product or event ID
export const findInWishlist = async (type, itemId) => {
  try {
    const response = await getWishlistItems();
    if (response.success && response.favorites) {
      // Map wishlist_id to id for compatibility with FavoriteButton
      const mappedFavorites = response.favorites.map(item => ({
        ...item,
        id: item.wishlist_id,
      }));
      return mappedFavorites.find(item => 
        (type === 'product' && item.id === itemId) || (type === 'event' && item.event_id === itemId)
      );
    }
    return null;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    throw error;
  }
};
