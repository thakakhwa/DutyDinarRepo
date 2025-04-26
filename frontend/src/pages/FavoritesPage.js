import React, { useEffect, useState } from 'react';
import { getFavorites } from '../api/get_favorites';
import FavoriteButton from '../components/products/FavoriteButton';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../utils/imageUtils';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      const response = await getFavorites();
      if (response.success) {
        setFavorites(response.favorites);
        setError(null);
      } else {
        setError(response.message || 'Failed to load favorites');
      }
      setLoading(false);
    };
    fetchFavorites();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-600">Loading favorites...</div>;
  if (error) return <div className="text-red-600 text-center mt-6">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen px-4">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center space-x-3 text-green-700">
        <span>My Favorites</span>
      </h1>
      {favorites.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">You have no favorite products yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map((product) => {
            const CategoryIcon = () => null; // Placeholder, as categories page uses icons
            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden relative"
              >
                <div
                  className="h-48 bg-gray-200 bg-cover bg-center"
                  style={{ backgroundImage: `url(${getFullImageUrl(product.image_url)})` }}
                />
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    Company: {product.companyName || "N/A"}
                  </div>
                  <div className="flex items-center mb-2">
                    <CategoryIcon size={16} className="mr-1" />
                    Category: {product.category || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Stock: {product.stock} units
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    MOQ: {product.minOrderQuantity} pieces
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-green-600 font-semibold">${product.price}</div>
                    <button
                      onClick={() => window.location.href = `/product/${product.id}`}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                    >
                      See Product
                    </button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <FavoriteButton productId={product.id} wishlistId={product.wishlist_id} onFavoriteChange={() => {
                      const fetchFavorites = async () => {
                        const response = await getFavorites();
                        if (response.success) {
                          setFavorites(response.favorites);
                          setError(null);
                        } else {
                          setError(response.message || 'Failed to load favorites');
                        }
                      };
                      fetchFavorites();
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
