import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get('./backend/api/cart.php');
        if (response.data.success) {
          setCartItems(response.data.data || []);
        }
        setLoading(false);
      } catch (error) {
        console.error('Cart fetch error:', error);
        setLoading(false);
        alert('Failed to load cart');
      }
    };

    fetchCart();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    ).toFixed(2);
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`../backend/api/cart.php'?id=${itemId}`);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Remove item error:', error);
      alert('Failed to remove item');
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await axios.put('./backend/api/cart.php', {
        id: itemId,
        quantity: newQuantity
      });
      
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Quantity update error:', error);
      alert('Failed to update quantity');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex items-center">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-md mr-4" 
                  />
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600 text-sm">${item.price.toFixed(2)}</p>
                    
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
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="mt-2 text-gray-600 hover:text-red-500"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;