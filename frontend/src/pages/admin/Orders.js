import React, { useState } from 'react';
import { 
  Search, Filter, ChevronDown, ShoppingBag, 
  Truck, CheckCircle, XCircle, Clock, 
  Download, Eye, MoreHorizontal 
} from 'lucide-react';

const OrdersPage = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const orders = [
    {
      id: '#ORD-12345',
      customer: 'John Smith',
      date: '03 Mar, 2025',
      amount: 284.50,
      status: 'delivered',
      items: 3
    },
    {
      id: '#ORD-12346',
      customer: 'Sarah Johnson',
      date: '02 Mar, 2025',
      amount: 126.75,
      status: 'processing',
      items: 2
    },
    {
      id: '#ORD-12347',
      customer: 'Michael Brown',
      date: '01 Mar, 2025',
      amount: 532.99,
      status: 'shipped',
      items: 4
    },
    {
      id: '#ORD-12348',
      customer: 'Emily Davis',
      date: '28 Feb, 2025',
      amount: 89.99,
      status: 'cancelled',
      items: 1
    },
    {
      id: '#ORD-12349',
      customer: 'David Wilson',
      date: '27 Feb, 2025',
      amount: 345.00,
      status: 'delivered',
      items: 2
    },
    {
      id: '#ORD-12350',
      customer: 'Lisa Anderson',
      date: '26 Feb, 2025',
      amount: 178.50,
      status: 'processing',
      items: 3
    },
  ];

  const statusColors = {
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    processing: Clock,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download size={20} className="mr-2" />
          Export Orders
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Filters */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-4">
            {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize
                  ${selectedStatus === status 
                    ? 'bg-green-100 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <button className="flex items-center px-4 py-2 border rounded-lg text-gray-700">
              <Filter size={18} className="mr-2" />
              Filter
              <ChevronDown size={16} className="ml-2" />
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left font-medium text-gray-600">Order ID</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Customer</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Date</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Amount</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Status</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Items</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status];
                return (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <ShoppingBag size={18} className="mr-2 text-gray-500" />
                        {order.id}
                      </div>
                    </td>
                    <td className="py-4 px-4">{order.customer}</td>
                    <td className="py-4 px-4">{order.date}</td>
                    <td className="py-4 px-4">${order.amount.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${statusColors[order.status]}`}>
                          <StatusIcon size={14} className="mr-1" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">{order.items} items</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="View Order">
                          <Eye size={18} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="More Options">
                          <MoreHorizontal size={18} className="text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing 1 to 6 of 24 orders
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Previous</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">1</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">3</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;