import React, { useEffect, useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { addToWishlist, removeFromWishlist, getWishlistItems } from '../../api/wishlist';

const FavoriteButton = ({ productId }) => {
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const response = await getWishlistItems();
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
  }, [productId]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (favorite) {
        if (wishlistId) {
          const success = await removeFromWishlist(wishlistId);
          if (success.success) {
            setFavorite(false);
            setWishlistId(null);
          }
        }
      } else {
        const success = await addToWishlist('product', productId);
        if (success.success && success.data) {
          setFavorite(true);
          setWishlistId(success.data.id || success.data.wishlist_id);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
