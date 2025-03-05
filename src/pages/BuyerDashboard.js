import React from 'react';
import { ShoppingBag, Heart, Clock, Package } from 'lucide-react';

const BuyerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Active Orders!</h3>
              <ShoppingBag className="text-green-600" size={24} />g
            </div>
            <div className="text-3xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">In progress</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Wishlist</h3>
              <Heart className="text-green-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-green-600">24</div>
            <div className="text-sm text-gray-600">Saved items</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Pending</h3>
              <Clock className="text-green-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-600">Awaiting delivery</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Completed</h3>
              <Package className="text-green-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-green-600">156</div>
            <div className="text-sm text-gray-600">Total orders</div>
          </div>
        </div>

        {/* Recent Orders and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((order) => (
                    <div key={order} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div>
                          <h3 className="font-medium">Product Name {order}</h3>
                          <div className="text-sm text-gray-600">Quantity: 100</div>
                          <div className="text-sm text-gray-600">Order #: {order.toString().padStart(4, '0')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">${(Math.random() * 1000).toFixed(2)}</div>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Delivered
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
                <button className="w-full bg-green-600 text-white py-2 rounded-lg">
                  Browse Categories
                </button>
                <button className="w-full border border-green-600 text-green-600 py-2 rounded-lg">
                  View Wishlist
                </button>
                <button className="w-full border border-green-600 text-green-600 py-2 rounded-lg">
                  Track Orders
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recommended Suppliers</h3>
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


