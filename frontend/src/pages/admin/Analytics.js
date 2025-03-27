import React, { useState } from 'react';
import { 
  Calendar, ChevronDown, Download, Filter, 
  TrendingUp, TrendingDown, DollarSign, Users, 
  ShoppingBag, ArrowRight, Settings as SettingsIcon
} from 'lucide-react';

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const [selectedChart, setSelectedChart] = useState('revenue');

  // Sample analytics data
  const analyticsData = {
    totalRevenue: 128500,
    revenueGrowth: 12.3,
    totalOrders: 1258,
    ordersGrowth: 8.7,
    totalUsers: 4587,
    usersGrowth: 15.2,
    monthlyRevenue: [12500, 13200, 14800, 15900, 16700, 17500],
    topProducts: [
      { name: 'Product A', sales: 156, amount: 15600 },
      { name: 'Product B', sales: 129, amount: 12900 },
      { name: 'Product C', sales: 98, amount: 9800 },
      { name: 'Product D', sales: 75, amount: 7500 },
      { name: 'Product E', sales: 63, amount: 6300 },
    ],
    topCountries: [
      { name: 'United Arab Emirates', sales: 387, amount: 38700 },
      { name: 'Saudi Arabia', sales: 245, amount: 24500 },
      { name: 'Kuwait', sales: 198, amount: 19800 },
      { name: 'Qatar', sales: 156, amount: 15600 },
      { name: 'Bahrain', sales: 87, amount: 8700 },
    ]
  };

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
      {growth && (
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

  // Sample chart data (would be replaced with a real chart library)
  const RevenueChart = () => (
    <div className="h-64 mt-4">
      <div className="w-full h-full bg-gray-50 rounded-lg flex items-end p-4">
        {analyticsData.monthlyRevenue.map((value, index) => (
          <div key={index} className="h-full flex-1 flex flex-col justify-end items-center">
            <div 
              className="w-4/5 bg-green-500 rounded-t-sm" 
              style={{ height: `${(value / Math.max(...analyticsData.monthlyRevenue)) * 100}%` }}
            />
            <span className="text-xs mt-2">Month {index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );

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
          <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Revenue"
          value={analyticsData.totalRevenue}
          icon={DollarSign}
          growth={analyticsData.revenueGrowth}
          prefix="$"
        />
        <StatCard 
          title="Total Orders"
          value={analyticsData.totalOrders}
          icon={ShoppingBag}
          growth={analyticsData.ordersGrowth}
        />
        <StatCard 
          title="Total Users"
          value={analyticsData.totalUsers}
          icon={Users}
          growth={analyticsData.usersGrowth}
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
    </div>
  );
};

export default AnalyticsPage;