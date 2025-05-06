import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { deleteProduct } from '../api/delete_products';
import { deleteEvent } from '../api/delete_events';
import { getProducts } from '../api/get_products';
import { getEvents } from '../api/get_events';

const InventoryPage = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      if (!user?.userId) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }
      const response = await getProducts('', '', [0, 9999999], 0, { myProducts: true, seller_id: user.userId });
      if (response.success) {
        setProducts(response.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching seller products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      if (!user?.userId) {
        setEvents([]);
        setLoadingEvents(false);
        return;
      }
      const response = await getEvents({ myEvents: true, seller_id: user.userId });
      if (response.success) {
        setEvents(response.events || []);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching seller events:', error);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (!user || user.userType !== 'seller') {
      setProducts([]);
      setEvents([]);
      setLoadingProducts(false);
      setLoadingEvents(false);
      return;
    }
    fetchProducts();
    fetchEvents();
  }, [user]);

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Are you sure you want to remove this product?');
    if (!confirmed) return;
    const result = await deleteProduct(productId);
    if (result.success) {
      fetchProducts();
    } else {
      alert('Failed to delete product: ' + result.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = window.confirm('Are you sure you want to remove this event?');
    if (!confirmed) return;
    const result = await deleteEvent(eventId);
    if (result.success) {
      fetchEvents();
    } else {
      alert('Failed to delete event: ' + result.message);
    }
  };

  if (!user || user.userType !== 'seller') {
    return <div className="p-6">You must be logged in as a seller to view this page.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      <section>
        <h1 className="text-2xl font-bold mb-6">Products Inventory</h1>
        {loadingProducts ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found in your inventory.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Product Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Stock</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                  <td className="border border-gray-300 px-4 py-2">${!isNaN(Number(product.price)) ? Number(product.price).toFixed(2) : 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{product.stock}</td>
                  <td className="border border-gray-300 px-4 py-2">{product.category || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h1 className="text-2xl font-bold mb-6">Events Inventory</h1>
        {loadingEvents ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events found in your inventory.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Event Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{event.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{new Date(event.event_date).toLocaleDateString()}</td>
                  <td className="border border-gray-300 px-4 py-2">{event.location || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default InventoryPage;
