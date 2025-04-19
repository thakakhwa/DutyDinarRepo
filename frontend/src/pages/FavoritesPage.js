import React, { useEffect, useState } from 'react';
import { getFavorites } from '../api/get_favorites';
import FavoriteButton from '../components/products/FavoriteButton';
import { Link } from 'react-router-dom';

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
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center space-x-3 text-red-600">
        <span>My Favorites</span>
      </h1>
      {favorites.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">You have no favorite products yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {favorites.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
              <Link to={`/product/${product.id}`} className="block overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 truncate">{product.name}</h2>
                  <FavoriteButton productId={product.id} wishlistId={product.wishlist_id} />
                </div>
                <p className="text-gray-600 mt-2 flex-grow">{product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-green-700 font-bold text-lg">${Number(product.price).toFixed(2)}</span>
                  <Link
                    to={`/product/${product.id}`}
                    className="text-sm text-red-600 hover:text-red-800 font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
