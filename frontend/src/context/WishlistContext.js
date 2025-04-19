import React, { createContext, useContext, useEffect, useState } from 'react';
import { getWishlistItems, addToWishlist, removeFromWishlist } from '../api/wishlist';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await getWishlistItems();
      if (response.success) {
        setWishlist(response.favorites);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const addFavorite = async (type, itemId) => {
    try {
      const response = await addToWishlist(type, itemId);
      if (response.success && response.data) {
        setWishlist(prev => [...prev, { ...response.data, type, id: response.data.id }]);
        return true;
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
    return false;
  };

  const removeFavorite = async (wishlistId) => {
    try {
      const response = await removeFromWishlist(wishlistId);
      if (response.success) {
        setWishlist(prev => prev.filter(item => item.id !== wishlistId));
        return true;
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
    return false;
  };

  const isFavorite = (type, itemId) => {
    return wishlist.some(item => {
      if (item.type !== type) return false;
      if (type === 'product') return item.id === itemId;
      if (type === 'event') return item.event_id === itemId;
      return false;
    });
  };

  const getWishlistId = (type, itemId) => {
    const item = wishlist.find(item => {
      if (item.type !== type) return false;
      if (type === 'product') return item.id === itemId;
      if (type === 'event') return item.event_id === itemId;
      return false;
    });
    return item ? item.id : null;
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, addFavorite, removeFavorite, isFavorite, getWishlistId }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
