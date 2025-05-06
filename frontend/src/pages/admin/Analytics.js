import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  ShoppingBag, ArrowRight, Download
} from 'lucide-react';
import { fetchAdminAnalytics } from '../../api/adminAnalytics';

const AnalyticsPage = () => {
  const [selectedChart, setSelectedChart] = useState('revenue');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const StatCard = ({ title, value, icon: Icon, growth, prefix = '', suffix = '' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-semibold mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </h3>
        </div>
        <div className="p-3 bg-green-100 rounded-lg">
          <Icon className="text-green-600" size={20} />
        </div>
      </div>
      {growth !== undefined && growth !== null && (
        <div className="flex items-center mt-4">
          {growth > 0 ? (
            <TrendingUp className="text-green-500 mr-1" size={16} />
          ) : (
            <TrendingDown className="text-red-500 mr-1" size={16} />
          )}
          <span className={`text-sm ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(growth)}% from last period
          </span>
        </div>
      )}
    </div>
  );

  const RevenueChart = () => {
    if (!analyticsData) return null;

    let dataValues = [], dataKeys = [], maxData = 0;
    
    switch (selectedChart) {
      case 'orders':
        if (analyticsData.monthlyOrders) {
          dataValues = Object.values(analyticsData.monthlyOrders);
          dataKeys = Object.keys(analyticsData.monthlyOrders);
        }
        break;
      case 'users':
        if (analyticsData.monthlyUsers) {
          dataValues = Object.values(analyticsData.monthlyUsers);
          dataKeys = Object.keys(analyticsData.monthlyUsers);
        }
        break;
      case 'revenue':
      default:
        if (analyticsData.monthlyRevenue) {
          dataValues = Object.values(analyticsData.monthlyRevenue);
          dataKeys = Object.keys(analyticsData.monthlyRevenue);
        }
        break;
    }
    
    if (dataValues.length > 0) {
      maxData = Math.max(...dataValues);
    }

    return dataValues.length > 0 ? (
      <div className="h-64 mt-4">
        <div className="w-full h-full bg-gray-50 rounded-lg flex items-end p-4">
          {dataValues.map((value, index) => (
            <div key={index} className="h-full flex-1 flex flex-col justify-end items-center">
              <div 
                className="w-4/5 bg-green-500 rounded-t-sm" 
                style={{ height: `${(value / maxData) * 100}%` }}
              />
              <span className="text-xs mt-2">{dataKeys[index]}</span>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="h-64 mt-4 flex justify-center items-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available for {selectedChart}</p>
      </div>
    );
  };

  const exportData = () => {
    if (!analyticsData) return;

    // Prepare data for export
    const XLSX = require('xlsx');

    // Overview sheet data
    const overviewData = [
      ['Metric', 'Value'],
      ['Total Revenue', analyticsData.totalRevenue],
      ['Total Orders', analyticsData.totalOrders],
      ['Total Users', analyticsData.totalUsers],
    ];

    // Monthly Revenue sheet data
    const monthlyRevenueData = [
      ['Month', 'Revenue'],
      ...Object.entries(analyticsData.monthlyRevenue)
    ];
    
    // Monthly Orders sheet data
    const monthlyOrdersData = [
      ['Month', 'Orders'],
      ...Object.entries(analyticsData.monthlyOrders || {})
    ];
    
    // Monthly Users sheet data
    const monthlyUsersData = [
      ['Month', 'Users'],
      ...Object.entries(analyticsData.monthlyUsers || {})
    ];

    // Top Products sheet data
    const topProductsData = [
      ['Product Name', 'Sales', 'Amount'],
      ...analyticsData.topProducts.map(p => [p.name, p.sales, p.amount])
    ];

    // Top Events sheet data
    const topEventsData = [
      ['Event Name', 'Bookings', 'Amount'],
      ...(analyticsData.topEvents || []).map(e => [e.name, e.sales, e.amount])
    ];

    // Create workbook and sheets
    const workbook = XLSX.utils.book_new();

    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

    const monthlyRevenueSheet = XLSX.utils.aoa_to_sheet(monthlyRevenueData);
    XLSX.utils.book_append_sheet(workbook, monthlyRevenueSheet, 'Monthly Revenue');
    
    const monthlyOrdersSheet = XLSX.utils.aoa_to_sheet(monthlyOrdersData);
    XLSX.utils.book_append_sheet(workbook, monthlyOrdersSheet, 'Monthly Orders');
    
    const monthlyUsersSheet = XLSX.utils.aoa_to_sheet(monthlyUsersData);
    XLSX.utils.book_append_sheet(workbook, monthlyUsersSheet, 'Monthly Users');

    const topProductsSheet = XLSX.utils.aoa_to_sheet(topProductsData);
    XLSX.utils.book_append_sheet(workbook, topProductsSheet, 'Top Products');

    const topEventsSheet = XLSX.utils.aoa_to_sheet(topEventsData);
    XLSX.utils.book_append_sheet(workbook, topEventsSheet, 'Top Events');

    // Write file
    XLSX.writeFile(workbook, 'analytics_report.xlsx');
  };

  const TopProducts = () => {
    if (!analyticsData || !analyticsData.topProducts) return null;
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Top Products</h2>
          <button className="text-sm text-green-600 hover:text-green-700 flex items-center">
            View All <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="space-y-4">
          {analyticsData.topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                  <span>{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.sales} sales</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${product.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TopEvents = () => {
    if (!analyticsData || !analyticsData.topEvents) return null;
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Top Events</h2>
          <button className="text-sm text-green-600 hover:text-green-700 flex items-center">
            View All <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="space-y-4">
          {analyticsData.topEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                  <span>{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-medium">{event.name}</h3>
                  <p className="text-sm text-gray-500">{event.sales} sales</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${event.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex space-x-4">
          <button 
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={exportData}
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading analytics data...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">Error: {error}</div>
      ) : analyticsData ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Revenue"
              value={analyticsData.totalRevenue}
              icon={DollarSign}
              growth={null}
              prefix="$"
            />
            <StatCard 
              title="Total Orders"
              value={analyticsData.totalOrders}
              icon={ShoppingBag}
              growth={null}
            />
            <StatCard 
              title="Total Users"
              value={analyticsData.totalUsers}
              icon={Users}
              growth={null}
            />
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Data Analytics</h2>
              <div className="flex space-x-2">
                {['revenue', 'orders', 'users'].map((chart) => (
                  <button
                    key={chart}
                    onClick={() => setSelectedChart(chart)}
                    className={`px-3 py-1 rounded-lg text-sm capitalize
                      ${selectedChart === chart 
                        ? 'bg-green-100 text-green-600' 
                        : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {chart}
                  </button>
                ))}
              </div>
            </div>
            <RevenueChart />
          </div>

          {/* Top Products and Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <TopProducts />

            {/* Top Events */}
            <TopEvents />
          </div>
        </>
      ) : (
        <div className="text-center py-10 text-gray-500">No analytics data available.</div>
      )}
    </div>
  );
};

export default AnalyticsPage;
