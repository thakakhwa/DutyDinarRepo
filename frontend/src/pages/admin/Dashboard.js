import React, { useState } from 'react';
import { 
  Users, Package, Calendar, DollarSign, 
  ChevronDown, Search, Bell, User,
  ArrowUp, ArrowDown, BarChart2
} from 'lucide-react';

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const stats = {
    totalUsers: 2458,
    totalProducts: 1257,
    totalEvents: 45,
    revenue: 125800,
    userGrowth: 12.5,
    productGrowth: 8.3,
    eventGrowth: 15.2,
    revenueGrowth: 10.8
  };

  const StatCard = ({ title, value, icon: Icon, growth }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-semibold mt-2">
            {typeof value === 'number' && title.includes('Revenue') 
              ? `$${value.toLocaleString()}`
              : value.toLocaleString()}
          </h3>
        </div>
        <div className="p-3 bg-green-100 rounded-lg">
          <Icon className="text-green-600" size={20} />
        </div>
      </div>
      {growth && (
        <div className="flex items-center mt-4">
          {growth > 0 ? (
            <ArrowUp className="text-green-500 mr-1" size={16} />
          ) : (
            <ArrowDown className="text-red-500 mr-1" size={16} />
          )}
          <span className={`text-sm ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(growth)}% from last month
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <button className="p-2 relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <User size={20} className="text-gray-600" />
                <span>Admin</span>
                <ChevronDown size={16} className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            growth={stats.userGrowth}
          />
          <StatCard 
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            growth={stats.productGrowth}
          />
          <StatCard 
            title="Total Events"
            value={stats.totalEvents}
            icon={Calendar}
            growth={stats.eventGrowth}
          />
          <StatCard 
            title="Total Revenue"
            value={stats.revenue}
            icon={DollarSign}
            growth={stats.revenueGrowth}
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b px-4">
            <nav className="flex space-x-8">
              {['Overview', 'Users', 'Products', 'Events', 'Reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab.toLowerCase())}
                  className={`py-4 px-2 font-medium text-sm transition-colors relative
                    ${selectedTab === tab.toLowerCase()
                      ? 'text-green-600 border-b-2 border-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Latest Activity</h2>
              <button className="text-sm text-green-600 hover:text-green-700">View All</button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">New Product Listed</h3>
                    <p className="text-sm text-gray-500">Seller ABC added new product "Product Name"</p>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>New Users</span>
                    <span className="font-medium">45</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>New Products</span>
                    <span className="font-medium">28</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>New Events</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((report) => (
                  <div key={report} className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <BarChart2 className="text-red-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Monthly Report #{report}</h3>
                      <p className="text-xs text-gray-500">Generated on March {report}, 2024</p>
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

export default AdminDashboard;