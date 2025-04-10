import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState({});

  // Fetch cart items and check wishlist status on component mount
  useEffect(() => {
    const fetchCartAndWishlist = async () => {
      try {
        // Fetch cart items
        const cartResponse = await axios.get('../api/wishlist.php');
        let items = [];
        
        if (cartResponse.data.success) {
          items = cartResponse.data.data || [];
          setCartItems(items);
        } else {
          // Fallback to sample data if API fails
          items = [
            {
              id: 1,
              product_id: 3,
              name: 'Laptop Pro',
              price: 1299.99,
              quantity: 1,
              image_url: 'https://via.placeholder.com/100x100',
            },
            {
              id: 2,
              product_id: 2,
              name: 'Wireless Earbuds',
              price: 149.99,
              quantity: 2,
              image_url: 'https://via.placeholder.com/100x100',
            }
          ];
          setCartItems(items);
        }

        // Fetch wishlist items to check what's already in wishlist
        const wishlistResponse = await axios.get('../api/wishlist.php');
        if (wishlistResponse.data.success) {
          const wishlistItems = wishlistResponse.data.data || [];
          
          // Create a map of cart items to wishlist IDs
          const wishlistMap = {};
          items.forEach(cartItem => {
            const type = cartItem.event_id ? 'event' : 'product';
            const itemId = type === 'product' ? cartItem.product_id : cartItem.event_id;
            
            // Find if this cart item exists in wishlist
            const wishlistItem = wishlistItems.find(wItem => 
              wItem.type === type && wItem.itemId === itemId
            );
            
            if (wishlistItem) {
              wishlistMap[cartItem.id] = wishlistItem.id;
            } else {
              wishlistMap[cartItem.id] = null;
            }
          });
          
          setWishlistStatus(wishlistMap);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing cart:', error);
        setLoading(false);
        
        // Fallback to sample data if API fails
        const sampleCartItems = [
          {
            id: 1,
            product_id: 3,
            name: 'Laptop Pro',
            price: 1299.99,
            quantity: 1,
            image_url: 'https://via.placeholder.com/100x100',
          },
          {
            id: 2,
            product_id: 2,
            name: 'Wireless Earbuds',
            price: 149.99,
            quantity: 2,
            image_url: 'https://via.placeholder.com/100x100',
          }
        ];
        
        setCartItems(sampleCartItems);
      }
    };

    fetchCartAndWishlist();
  }, []);

  // Calculate cart total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    try {
      await axios.delete(`../api/wishlist.php?id=${itemId}`);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from cart:', error);
      // Optimistically remove from UI anyway
      setCartItems(cartItems.filter(item => item.id !== itemId));
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await axios.put('../api/wishlist.php', {
        id: itemId,
        quantity: newQuantity
      });
      
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      // Optimistically update UI anyway
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  // Toggle wishlist functionality
  const toggleWishlist = async (item) => {
    try {
      const type = item.event_id ? 'event' : 'product';
      const itemId = type === 'product' ? item.product_id : item.event_id;
      
      if (wishlistStatus[item.id]) {
        // Item is in wishlist, remove it
        await axios.delete(`../api/wishlist.php?id=${wishlistStatus[item.id]}`);
        
        // Update UI optimistically
        setWishlistStatus({
          ...wishlistStatus,
          [item.id]: null
        });
      } else {
        // Item is not in wishlist, add it
        const response = await axios.post('../api/wishlist.php', {
          type,
          itemId
        });
        
        if (response.data.success) {
          // Store the wishlist ID returned from the server
          const wishlistId = response.data.data?.id;
          setWishlistStatus({
            ...wishlistStatus,
            [item.id]: wishlistId
          });
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Show feedback to user
      alert('Could not update wishlist. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back to Shopping
        </button>

        <h1 className="text-2xl font-semibold mb-6">Shopping Cart</h1>

        {loading ? (
          <div className="text-center py-8">Loading your cart...</div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex items-center">
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/100x100'} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-md mr-4" 
                  />
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600 text-sm">${item.price}</p>
                    
                    <div className="flex items-center mt-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-gray-200 text-gray-600 px-2 py-1 rounded-l-md"
                      >
                        -
                      </button>
                      <span className="bg-gray-100 px-4 py-1">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-gray-200 text-gray-600 px-2 py-1 rounded-r-md"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <div className="flex mt-2">
                      <button 
                        onClick={() => toggleWishlist(item)}
                        className={`text-gray-600 hover:text-red-500 mr-2 ${
                          wishlistStatus[item.id] ? 'text-red-500' : ''
                        }`}
                        aria-label={wishlistStatus[item.id] ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart size={20} fill={wishlistStatus[item.id] ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-600 hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">${calculateTotal()}</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-3"
              >
                Proceed to Checkout
              </button>
              
              <button 
                onClick={() => navigate('/products')}
                className="w-full border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;