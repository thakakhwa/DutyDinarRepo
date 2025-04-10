// api/wishlistApi.js

import axios from 'axios';

const API_URL = 'http://localhost/DutyDinarRepo/backend/api';

// Get all wishlist items for the current user
export const getWishlistItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/wishlist.php`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    throw error;
  }
};

// Add item to wishlist
export const addToWishlist = async (type, itemId) => {
  try {
    const response = await axios.post(`${API_URL}/wishlist.php`, {
      type, // 'product' or 'event'
      itemId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    throw error;
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (wishlistId) => {
  try {
    const response = await axios.delete(`${API_URL}/wishlist.php?id=${wishlistId}`);
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
    if (response.success && response.data) {
      return response.data.find(item => 
        item.type === type && item.itemId === itemId
      );
    }
    return null;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    throw error;
  }
};