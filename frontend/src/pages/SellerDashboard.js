import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateOrderStatus } from "../api/updateOrderStatus";
import MessagePopup from "../components/MessagePopup";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

const SellerDashboard = () => {
  const navigate = useNavigate();

  const [totalSales, setTotalSales] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [productsListed, setProductsListed] = useState(0);
  const [productViews, setProductViews] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [showMessagesPopup, setShowMessagesPopup] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/get_seller_dashboard_data.php`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const totalSalesNum = Number(data.totalSales);
          setTotalSales(isNaN(totalSalesNum) ? 0 : totalSalesNum);
          setActiveOrders(data.activeOrders || 0);
          setProductViews(data.productViews || 0);
          const recentOrdersWithNumbers = (data.recentOrders || []).map(
            (order) => ({
              ...order,
              total_amount: Number(order.total_amount),
            })
          );
          setRecentOrders(recentOrdersWithNumbers);
          setUpcomingEvents(data.upcomingEvents || []);
        }
      })
      .catch((error) => {
        console.error("Error fetching seller dashboard data:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch count of products listed by the seller
    fetch(`${API_BASE_URL}/get_seller_products_count.php`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.product_count === "number") {
          setProductsListed(data.product_count);
        } else {
          setProductsListed(0);
        }
      })
      .catch((error) => {
        console.error("Error fetching products listed count:", error);
        setProductsListed(0);
      });
  }, []);

  const handleAddEventClick = () => {
    navigate("/add-events");
  };
  const handleAddProductClick = () => {
    navigate("/add-products");
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const response = await updateOrderStatus(orderId, newStatus);
    if (response.success) {
      setRecentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } else {
      alert("Failed to update order status: " + response.message);
    }
  };

  const renderOrderItems = (items) => {
    return items.map((item, index) => (
      <div key={index} className="mb-1">
        {item.product_name || item.event_name || "N/A"} (Qty: {item.quantity})
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
            <div className="text-3xl font-bold text-green-600">
              ${totalSales.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Last 30 days</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Products Listed</h3>
            <div className="text-3xl font-bold text-green-600">
              {productsListed}
            </div>
            <div className="text-sm text-gray-600">Total products listed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Product Views</h3>
            <div className="text-3xl font-bold text-green-600">
              {productViews}
            </div>
            <div className="text-sm text-gray-600">Last 7 days</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="pb-4">Order ID</th>
                      <th className="pb-4">Customer</th>
                      <th className="pb-4">Items</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-4 text-center text-gray-500"
                        >
                          No recent orders
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.order_id} className="border-t align-top">
                          <td className="py-4">
                            #ORD-{order.order_id.toString().padStart(4, "0")}
                          </td>
                          <td className="py-4">
                            {order.customer_name || "N/A"}
                          </td>
                          <td className="py-4">
                            {renderOrderItems(order.items)}
                          </td>
                          <td className="py-4">
                            ${order.total_amount.toFixed(2)}
                          </td>
                          <td className="py-4">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  order.order_id,
                                  e.target.value
                                )
                              }
                              className={`px-2 py-1 rounded text-xs ${
                                order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.status === "shipped"
                                      ? "bg-purple-100 text-purple-800"
                                      : order.status === "delivered"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  className="w-full border border-green-600 text-green-600 py-2 rounded-lg"
                  onClick={handleAddProductClick}
                >
                  Add New Product
                </button>
                <button
                  className="w-full border border-green-600 text-green-600 py-2 rounded-lg"
                  onClick={handleAddEventClick}
                >
                  Add New Events
                </button>
                <button
                  className="w-full border border-green-600 text-green-600 py-2 rounded-lg"
                  onClick={() => setShowMessagesPopup(true)}
                >
                  View Messages
                </button>
                <Link
                  to="/inventory"
                  className="w-full block mt-2"
                >
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                  Manage Inventory
                </button>
                </Link>
              </div>
            </div>
            {showMessagesPopup && (
              <MessagePopup onClose={() => setShowMessagesPopup(false)} />
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-gray-500">No upcoming events</div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border-b pb-4 last:border-b-0"
                    >
                      <h4 className="font-medium">{event.name}</h4>
                      <div className="text-sm text-gray-600">
                        {new Date(event.event_date).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
