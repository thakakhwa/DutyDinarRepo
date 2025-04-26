import React, { useEffect, useState } from "react";
import { ShoppingBag, Heart, Clock, Package } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

const BuyerDashboard = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async (status = null) => {
      let url = `${API_BASE_URL}/get_orders.php`;
      if (status) {
        url += `?status=${status}`;
      }
      try {
        const response = await fetch(url, { credentials: "include" });
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          if (data.success) {
            return data.orders;
          }
          console.error('API error:', data.message);
          return [];
        } catch (jsonError) {
          console.error('Failed to parse JSON:', text);
          return [];
        }
      } catch (error) {
        console.error('Fetch error:', error);
        return [];
      }
    };

    const fetchWishlist = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_favorites.php`, { credentials: "include" });
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          if (data.success) {
            return data.favorites;
          }
          console.error('API error:', data.message);
          return [];
        } catch (jsonError) {
          console.error('Failed to parse JSON:', text);
          return [];
        }
      } catch (error) {
        console.error('Fetch error:', error);
        return [];
      }
    };

    const loadData = async () => {
      setLoading(true);
      const [active, pending, completed, recent, wish] = await Promise.all([
        fetchOrders(), // all orders for active (we will filter)
        fetchOrders("pending"),
        fetchOrders("delivered"),
        fetchOrders(), // recent orders same as all orders sorted by date
        fetchWishlist(),
      ]);

      // Active orders: all except delivered and cancelled
      const activeFiltered = active.filter(
        (order) => order.status !== "delivered" && order.status !== "cancelled"
      );

      setActiveOrders(activeFiltered);
      setPendingOrders(pending);
      setCompletedOrders(completed);
      setRecentOrders(recent.slice(0, 4)); // show 4 recent orders
      setWishlist(wish);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Active Orders</h3>
              <ShoppingBag className="text-green-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-green-600">{activeOrders.length}</div>
            <div className="text-sm text-gray-600">In progress</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Wishlist</h3>
              <Heart className="text-green-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-green-600">{wishlist.length}</div>
            <div className="text-sm text-gray-600">Saved items</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Pending</h3>
              <Clock className="text-green-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-green-600">{pendingOrders.length}</div>
            <div className="text-sm text-gray-600">Awaiting delivery</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Completed</h3>
              <Package className="text-green-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-green-600">{completedOrders.length}</div>
            <div className="text-sm text-gray-600">Total orders</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {recentOrders.length === 0 && <div>No recent orders found.</div>}
                  {recentOrders.map((order) => (
                    <div
                      key={order.order_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          {order.items[0]?.product_image_url && (
                            <img
                              src={order.items[0].product_image_url}
                              alt={order.items[0].product_name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {order.items[0]?.event_image_url && (
                            <img
                              src={order.items[0].event_image_url}
                              alt={order.items[0].event_name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {order.items[0]?.product_name || order.items[0]?.event_name || "Item"}
                          </h3>
                          <div className="text-sm text-gray-600">
                            Quantity: {order.items[0]?.quantity}
                          </div>
                          <div className="text-sm text-gray-600">
                            Order #: {order.order_id.toString().padStart(4, "0")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          ${isNaN(Number(order.total_amount)) ? "0.00" : Number(order.total_amount).toFixed(2)}
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/categories"
                  className="flex items-center justify-center w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Categories
                </Link>
                <button className="w-full border border-green-600 text-green-600 py-2 rounded-lg">
                  View Wishlist
                </button>
                <button className="w-full border border-green-600 text-green-600 py-2 rounded-lg">
                  Track Orders
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Recommended Suppliers
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((supplier) => (
                  <div key={supplier} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <h4 className="font-medium">Supplier Name {supplier}</h4>
                      <div className="text-sm text-gray-600">Electronics</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
