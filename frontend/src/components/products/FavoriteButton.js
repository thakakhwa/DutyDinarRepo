import React, { useEffect, useState, useContext } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { addToWishlist, removeFromWishlist, getWishlistItems } from '../../api/wishlist';
import { useNavigate } from 'react-router-dom';
import { handleAuthError } from '../../utils/authUtils';
import { AuthContext } from '../../context/AuthContext';

const FavoriteButton = ({ productId, onFavoriteChange }) => {
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return; // Don't check favorites if not logged in
      
      try {
        const response = await getWishlistItems(navigate);
        if (response.success && response.favorites) {
          const item = response.favorites.find(fav => fav.product_id === productId || fav.id === productId);
          if (item) {
            setFavorite(true);
            setWishlistId(item.wishlist_id || item.id);
          } else {
            setFavorite(false);
            setWishlistId(null);
          }
        }
      } catch (error) {
        console.error('Error fetching wishlist items:', error);
      }
    };
    checkFavorite();
  }, [productId, user, navigate]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (loading) return;
    
    // If user is not logged in, redirect to login
    if (!user) {
      handleAuthError({ response: { data: { auth_required: true } } }, navigate);
      return;
    }
    
    setLoading(true);
    try {
      if (favorite) {
        if (wishlistId) {
          const success = await removeFromWishlist(wishlistId);
          if (success.success) {
            setFavorite(false);
            setWishlistId(null);
            if (onFavoriteChange) onFavoriteChange();
          }
        }
      } else {
        const success = await addToWishlist('product', productId, navigate);
        // Check if response indicates auth required
        if (success.auth_required) {
          return; // Already handled by addToWishlist
        }
        
        if (success.success && success.data) {
          setFavorite(true);
          setWishlistId(success.data.id || success.data.wishlist_id);
          if (onFavoriteChange) onFavoriteChange();
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Check for auth errors in catch block as well
      if (error.response?.data?.auth_required) {
        handleAuthError(error, navigate);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      className="focus:outline-none ml-3 cursor-pointer hover:text-red-600 transition-colors duration-200"
    >
      {favorite ? (
        <Heart className="text-red-600" size={24} />
      ) : (
        <HeartOff className="text-gray-400" size={24} />
      )}
    </button>
  );
};

export default FavoriteButton;
