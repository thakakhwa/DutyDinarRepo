import React from 'react';
import { Package, Calendar } from 'lucide-react';

const SellerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
            <div className="text-3xl font-bold text-green-600">$24,500</div>
            <div className="text-sm text-gray-600">Last 30 days</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Active Orders</h3>
            <div className="text-3xl font-bold text-green-600">18</div>
            <div className="text-sm text-gray-600">Pending fulfillment</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Product Views</h3>
            <div className="text-3xl font-bold text-green-600">2,845</div>
            <div className="text-sm text-gray-600">Last 7 days</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
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
                      <th className="pb-4">Amount</th>
                      <th className="pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((order) => (
                      <tr key={order} className="border-t">
                        <td className="py-4">#ORD-{order.toString().padStart(4, '0')}</td>
                        <td className="py-4">Business Name {order}</td>
                        <td className="py-4">${(Math.random() * 1000).toFixed(2)}</td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-green-600 text-white py-2 rounded-lg">
                  Add New Product
                </button>
                <button className="w-full border border-green-600 text-green-600 py-2 rounded-lg">
                  View Messages
                </button>
                <button className="w-full border border-green-600 text-green-600 py-2 rounded-lg">
                  Manage Inventory
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {[1, 2].map((event) => (
                  <div key={event} className="border-b pb-4 last:border-b-0">
                    <h4 className="font-medium">Trade Show {event}</h4>
                    <div className="text-sm text-gray-600">March 15, 2024</div>
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

export default SellerDashboard;