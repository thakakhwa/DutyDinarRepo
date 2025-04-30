import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronDown, Download, Filter, 
  TrendingUp, TrendingDown, DollarSign, Users, 
  ShoppingBag, ArrowRight
} from 'lucide-react';
import { fetchAdminAnalytics } from '../../api/adminAnalytics';

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('This Month');
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
    if (!analyticsData || !analyticsData.monthlyRevenue) return null;

    const monthlyRevenueValues = Object.values(analyticsData.monthlyRevenue);
    const maxRevenue = Math.max(...monthlyRevenueValues);

    return (
      <div className="h-64 mt-4">
        <div className="w-full h-full bg-gray-50 rounded-lg flex items-end p-4">
          {monthlyRevenueValues.map((value, index) => (
            <div key={index} className="h-full flex-1 flex flex-col justify-end items-center">
              <div 
                className="w-4/5 bg-green-500 rounded-t-sm" 
                style={{ height: `${(value / maxRevenue) * 100}%` }}
              />
              <span className="text-xs mt-2">{Object.keys(analyticsData.monthlyRevenue)[index]}</span>
            </div>
          ))}
        </div>
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

    // Top Products sheet data
    const topProductsData = [
      ['Product Name', 'Sales', 'Amount'],
      ...analyticsData.topProducts.map(p => [p.name, p.sales, p.amount])
    ];

    // Top Countries sheet data
    const topCountriesData = [
      ['Country', 'Sales', 'Amount'],
      ...analyticsData.topCountries.map(c => [c.name, c.sales, c.amount])
    ];

    // Create workbook and sheets
    const workbook = XLSX.utils.book_new();

    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

    const monthlyRevenueSheet = XLSX.utils.aoa_to_sheet(monthlyRevenueData);
    XLSX.utils.book_append_sheet(workbook, monthlyRevenueSheet, 'Monthly Revenue');

    const topProductsSheet = XLSX.utils.aoa_to_sheet(topProductsData);
    XLSX.utils.book_append_sheet(workbook, topProductsSheet, 'Top Products');

    const topCountriesSheet = XLSX.utils.aoa_to_sheet(topCountriesData);
    XLSX.utils.book_append_sheet(workbook, topCountriesSheet, 'Top Countries');

    // Write file
    XLSX.writeFile(workbook, 'analytics_report.xlsx');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border">
            <Calendar size={16} />
            <span>{dateRange}</span>
            <ChevronDown size={16} />
          </div>
          <button className="flex items-center px-3 py-2 bg-white rounded-lg border">
            <Filter size={16} className="mr-2" />
            Filters
          </button>
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
              <h2 className="text-lg font-semibold">Revenue Analytics</h2>
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

          {/* Top Products and Countries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
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

            {/* Top Countries */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Top Countries</h2>
                <button className="text-sm text-green-600 hover:text-green-700 flex items-center">
                  View All <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {analyticsData.topCountries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                        <span>{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{country.name}</h3>
                        <p className="text-sm text-gray-500">{country.sales} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${country.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-10 text-gray-500">No analytics data available.</div>
      )}
    </div>
  );
};

export default AnalyticsPage;
