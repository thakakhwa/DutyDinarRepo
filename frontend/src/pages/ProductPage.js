import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart } from 'lucide-react';
import { getProductById } from '../api/get_products';

const ProductPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    const fetchProduct = async () => {
      try {
        const response = await getProductById(productId);
        if (response.success) {
          setProduct({
            ...response.product,
            // Convert numeric fields explicitly
            price: Number(response.product.price),
            stock: Number(response.product.stock),
            minOrderQuantity: Number(response.product.minOrderQuantity)
          });
          
          // Check if this product is in favorites
          checkIfFavorite(productId);
        } else {
          alert(response.message || "Product not found");
          navigate(-1);
        }
      } catch (error) {
        alert("Failed to fetch product");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const checkIfFavorite = async (productId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
      console.log("Checking favorite status for product ID:", productId);
      
      // Use explicit API URL
      const response = await fetch(`http://localhost/DutyDinarRepo/backend/api/favorites_check.php?buyer_id=${userId}&product_id=${productId}`);
      const data = await response.json();
      
      console.log("Favorite check response:", data);
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const addToFavorites = async () => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      navigate('/login');
      return;
    }
    
    try {
      console.log("Adding to favorites - userId:", userId, "productId:", productId);
      
      // Use explicit API URL
      const response = await fetch(`http://localhost/DutyDinarRepo/backend/api/favorites_add.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_id: userId,
          product_id: productId,
          event_id: null
        }),
      });
      
      const data = await response.json();
      console.log("Add to favorites response:", data);
      
      if (data.success) {
        setIsFavorite(true);
        alert('Added to favorites!');
      } else {
        alert(data.message || 'Failed to add to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Failed to add to favorites');
    }
  };

  const removeFromFavorites = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
      console.log("Removing from favorites - userId:", userId, "productId:", productId);
      
      // Use explicit API URL
      const response = await fetch(`http://localhost/DutyDinarRepo/backend/api/favorites_remove.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_id: userId,
          product_id: productId
        }),
      });
      
      const data = await response.json();
      console.log("Remove from favorites response:", data);
      
      if (data.success) {
        setIsFavorite(false);
        alert('Removed from favorites');
      } else {
        alert(data.message || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Failed to remove from favorites');
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites();
    } else {
      addToFavorites();
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-semibold mb-4">{product.name}</h1>
            
            <div className="text-lg font-semibold text-green-600 mb-4">
              ${product.price?.toFixed(2) || '00.00'}
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <strong>MOQ:</strong> {product.minOrderQuantity || 'Not specified'}
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <strong>Stock:</strong> {product.stock} units available
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <strong>Category:</strong> {product.category || 'Uncategorized'}
            </div>

            <div className="text-sm text-gray-600 mb-6">
              {product.description || 'No description available'}
            </div>

            <div className="flex gap-4 mb-6">
              <button 
                onClick={toggleFavorite}
                className={`flex items-center border ${isFavorite ? 'border-red-600 text-red-600 hover:bg-red-50' : 'border-green-600 text-green-600 hover:bg-green-50'} px-4 py-2 rounded-lg`}
              >
                <Heart size={20} className={`mr-2 ${isFavorite ? 'fill-red-600' : ''}`} />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Contact Supplier
              </button>
              <button 
                onClick={() => navigate('/cart')}
                className="flex-1 border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;