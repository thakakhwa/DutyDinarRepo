import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../api/get_cart';
import { getFullImageUrl } from '../utils/imageUtils';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart();
        if (response.success) {
          setCartItems(response.data || []);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        alert('Failed to load cart');
      }
    };

    fetchCart();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) =>
      total + ((Number(item.product_price ?? item.event_price) || 0) * item.quantity), 0
    ).toFixed(2);
  };

  const removeItem = async (itemId, productId) => {
    try {
      const response = await fetch('http://localhost/DutyDinarRepo/backend/api/delete_cart.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await response.json();
      if (data.success) {
        setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
        alert('Product removed from cart successfully.');
      } else {
        alert(data.message || 'Failed to remove product from cart.');
      }
    } catch (error) {
      alert('Error removing product from cart.');
    }
  };

  const updateQuantity = async (itemId, productId, newQuantity, minOrderQuantity) => {
    if (newQuantity < minOrderQuantity) {
      alert(`Quantity must be at least the minimum order quantity (${minOrderQuantity}).`);
      return;
    }
    try {
      const response = await fetch('http://localhost/DutyDinarRepo/backend/api/update_cart.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
      });
      const data = await response.json();
      if (data.success) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.product_id === productId ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        alert(data.message || 'Failed to update cart.');
      }
    } catch (error) {
      alert('Error updating cart.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-green-700 hover:text-emerald-700 mb-6"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back to Shopping
        </button>

        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Shopping Cart</h1>

        {loading ? (
          <div className="text-center py-8 text-gray-700">Loading your cart...</div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <h2 className="text-xl font-medium mb-4 text-gray-800">Your cart is empty</h2>
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-card p-4 flex items-center">
                    <img
                      src={getFullImageUrl(item.product_image_url) || getFullImageUrl(item.event_image_url) || ''}
                      alt={item.product_name || item.event_name || 'Item'}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                    />

                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-800">{item.product_name || item.event_name || 'Unnamed Item'}</h3>
                    <p className="text-gray-700 text-sm">${!isNaN(Number(item.product_price ?? item.event_price)) ? Number(item.product_price ?? item.event_price).toFixed(2) : 'N/A'}</p>
                    <span className="inline-block text-xs font-semibold text-white bg-green-600 rounded-full px-2 py-0.5 ml-2">
                      {item.product_id ? 'Product' : item.event_id ? 'Event' : 'Unknown'}
                    </span>

                    <div className="flex items-center mt-2">
              <button
                onClick={() => updateQuantity(item.id, item.product_id, parseInt(item.quantity, 10) - 1, item.min_order_quantity)}
                className="bg-green-200 text-green-700 px-2 py-1 rounded-l-md"
              >
                -
              </button>
              <span className="bg-green-100 px-4 py-1 text-green-800">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.product_id, parseInt(item.quantity, 10) + 1, item.min_order_quantity)}
                className="bg-green-200 text-green-700 px-2 py-1 rounded-r-md"
              >
                +
              </button>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-800">
                      ${!isNaN(Number(item.product_price ?? item.event_price)) ? (Number(item.product_price ?? item.event_price) * item.quantity).toFixed(2) : 'N/A'}
                    </p>
                    <button
                      onClick={() => removeItem(item.id, item.product_id)}
                      className="mt-2 text-green-700 hover:text-emerald-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-card p-6 h-fit">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-700">${calculateTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Shipping:</span>
                  <span className="text-gray-700">Free</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between font-semibold text-gray-800">
                  <span>Total:</span>
                  <span className="text-green-600">${calculateTotal()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const hasInvalidQty = cartItems.some(
                    (item) => item.quantity < (item.min_order_quantity || 0)
                  );
                  if (hasInvalidQty) {
                    alert('You cannot proceed to checkout with items below minimum order quantity.');
                    return;
                  }
                  navigate('/checkout');
                }}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 mb-3"
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
