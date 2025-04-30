import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { fetchOrders } from '../../api/adminOrders';
import * as XLSX from 'xlsx';

const OrdersPage = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const statusColors = {
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedOrders = await fetchOrders(selectedStatus);
        setOrders(fetchedOrders);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [selectedStatus]);

  const exportToExcel = () => {
    const worksheetData = orders.map(order => ({
      'Order ID': `#ORD-${order.order_id}`,
      'Customer': order.customer || 'N/A',
      'Date': new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      'Amount': parseFloat(order.total_amount).toFixed(2),
      'Status': order.status.charAt(0).toUpperCase() + order.status.slice(1),
      'Items Count': order.items ? order.items.length : 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, 'orders_export.xlsx');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <button
          onClick={exportToExcel}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {/* <Download size={20} className="mr-2" /> */}
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
              {/* <Filter size={18} className="mr-2" /> */}
              Filter
              {/* <ChevronDown size={16} className="ml-2" /> */}
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading orders...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">Error: {error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No orders found.</div>
          ) : (
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
                  // const StatusIcon = statusIcons[order.status];
                  // Format date and amount
                  const date = new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                  const amount = parseFloat(order.total_amount).toFixed(2);
                  const itemsCount = order.items ? order.items.length : 0;
                  return (
                    <tr key={order.order_id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {/* <ShoppingBag size={18} className="mr-2 text-gray-500" /> */}
                          {`#ORD-${order.order_id}`}
                        </div>
                      </td>
                      <td className="py-4 px-4">{order.customer || 'N/A'}</td>
                      <td className="py-4 px-4">{date}</td>
                      <td className="py-4 px-4">${amount}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${statusColors[order.status]}`}>
                            {/* <StatusIcon size={14} className="mr-1" /> */}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{itemsCount} items</td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="View Order">
                            {/* <Eye size={18} className="text-gray-600" /> */}
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="More Options">
                            {/* <MoreVertical size={18} className="text-gray-600" /> */}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing 1 to {orders.length} of {orders.length} orders
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
