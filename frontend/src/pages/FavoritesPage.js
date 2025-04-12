import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Trash } from 'lucide-react';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("FavoritesPage mounted");
    const fetchFavorites = async () => {
      try {
        // Check if user is logged in
        const userId = localStorage.getItem('userId');
        console.log("User ID from localStorage:", userId);
        
        if (!userId) {
          console.log("No user ID found, redirecting to login");
          navigate('/login');
          return;
        }
        
        console.log("Fetching favorites for user ID:", userId);
        
        // Use explicit API URL path - accessing wishlist table but naming it "favorites" in the UI
        const url = `http://localhost/DutyDinarRepo/backend/api/favorites.php?buyer_id=${userId}`;
        console.log("Fetching from URL:", url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("Favorites response:", data);
        
        if (data.success) {
          setFavorites(data.favorites || []);
        } else {
          console.error(data.message || 'Failed to fetch favorites');
          setError(data.message || 'Failed to fetch favorites');
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError('Error fetching favorites. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const removeFavorite = async (favoriteId) => {
    try {
      console.log("Removing favorite with ID:", favoriteId);
      
      // Use explicit API URL path
      const response = await fetch(`http://localhost/DutyDinarRepo/backend/api/favorites_remove.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: favoriteId
        }),
      });
      
      const data = await response.json();
      console.log("Remove favorite response:", data);
      
      if (data.success) {
        setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      } else {
        console.error(data.message || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back
        </button>

        <h1 className="text-2xl font-semibold mb-6 flex items-center">
          <Heart size={24} className="text-green-600 mr-2" />
          My Favorites
        </h1>

        {(!favorites || favorites.length === 0) ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">You don't have any favorites yet.</p>
            <Link to="/categories" className="text-green-600 hover:underline mt-2 inline-block">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50"
                  title="Remove from favorites"
                >
                  <Trash size={16} className="text-red-600" />
                </button>
                
                <Link to={item.product_id ? `/product/${item.product_id}` : `/event/${item.event_id}`}>
                  <img
                    src={item.image_url || '/placeholder-product.jpg'}
                    alt={item.name || 'Product'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.name || 'Unnamed Product'}</h3>
                    <p className="text-green-600 font-semibold">${item.price?.toFixed(2) || '00.00'}</p>
                    <p className="text-sm text-gray-600 mt-1 truncate">{item.description || 'No description available'}</p>
                    <div className="mt-4 text-xs text-gray-500">
                      Added on {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;