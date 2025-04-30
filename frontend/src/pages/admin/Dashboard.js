import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ChevronDown, Filter, Download, Calendar,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { fetchAdminAnalytics } from '../../api/adminAnalytics';
import { fetchLatestActivity } from '../../api/adminLatestActivity';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [latestActivity, setLatestActivity] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [errorAnalytics, setErrorAnalytics] = useState(null);
  const [errorActivity, setErrorActivity] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoadingAnalytics(true);
      setErrorAnalytics(null);
      try {
        const data = await fetchAdminAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        setErrorAnalytics(err.message || 'Failed to load analytics data');
      } finally {
        setLoadingAnalytics(false);
      }
    };

    const loadLatestActivity = async () => {
      setLoadingActivity(true);
      setErrorActivity(null);
      try {
        const data = await fetchLatestActivity();
        setLatestActivity(data);
      } catch (err) {
        setErrorActivity(err.message || 'Failed to load latest activity');
      } finally {
        setLoadingActivity(false);
      }
    };

    loadAnalytics();
    loadLatestActivity();
  }, []);

  const StatCard = ({ title, value, growth, prefix = '' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-semibold mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>
        <div className="p-3 bg-green-100 rounded-lg">
          <DollarSign className="text-green-600" size={20} />
        </div>
      </div>
      {growth !== undefined && growth !== null && (
        <div className="flex items-center mt-4">
          {growth > 0 ? (
            <ArrowUp className="text-green-500 mr-1" size={16} />
          ) : (
            <ArrowDown className="text-red-500 mr-1" size={16} />
          )}
          <span className={`text-sm ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(growth)}% from last period
          </span>
        </div>
      )}
    </div>
  );

  const exportData = () => {
    if (!analyticsData) return;

    // Prepare data for export
    // Overview sheet data
    const overviewData = [
      ['Metric', 'Value'],
      ['Total Revenue', analyticsData.totalRevenue],
      ['Total Orders', analyticsData.totalOrders],
      ['Total Users', analyticsData.totalUsers],
    ];

    // Create workbook and sheet
    const workbook = XLSX.utils.book_new();
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

    // Write file
    XLSX.writeFile(workbook, 'dashboard_overview_report.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button 
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={exportData}
            >
              <Download size={16} className="mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        {loadingAnalytics ? (
          <div className="text-center py-10 text-gray-500">Loading overview data...</div>
        ) : errorAnalytics ? (
          <div className="text-center py-10 text-red-500">Error: {errorAnalytics}</div>
        ) : analyticsData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Total Revenue"
                value={analyticsData.totalRevenue}
                growth={null}
                prefix="$"
              />
              <StatCard 
                title="Total Orders"
                value={analyticsData.totalOrders}
                growth={null}
              />
              <StatCard 
                title="Total Users"
                value={analyticsData.totalUsers}
                growth={null}
              />
            </div>

            {/* Latest Activity */}
            {loadingActivity ? (
              <div className="text-center py-10 text-gray-500">Loading latest activity...</div>
            ) : errorActivity ? (
              <div className="text-center py-10 text-red-500">Error: {errorActivity}</div>
            ) : latestActivity ? (
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Latest Activity</h2>
                  <button className="text-sm text-green-600 hover:text-green-700">View All</button>
                </div>
                <div className="space-y-4">
                  {latestActivity.recentProducts.map((product) => (
                    <div key={product.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="text-green-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium">New Product Listed</h3>
                        <p className="text-sm text-gray-500">Seller {product.seller_name} added new product "{product.name}"</p>
                        <span className="text-xs text-gray-400">{new Date(product.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {latestActivity.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DollarSign className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium">New Order Placed</h3>
                        <p className="text-sm text-gray-500">Buyer {order.buyer_name} placed an order of ${parseFloat(order.total_amount).toFixed(2)}</p>
                        <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">No overview data available.</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
