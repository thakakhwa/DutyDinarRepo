import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Package, Calendar, 
  Settings, LogOut, Menu, X,
  BarChart2, ShoppingBag, MessageSquare 
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', icon: Home, path: '/admin/' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Events', icon: Calendar, path: '/admin/events' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors
          ${isActive 
            ? 'bg-green-100 text-green-600' 
            : 'text-gray-600 hover:bg-gray-100'
          }`}
      >
        <item.icon size={20} />
        <span className={`${!isSidebarOpen && 'hidden'}`}>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0 w-64' : 'w-20'}
          md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          {/* Logo */}


          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          {/* Profile */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              {isSidebarOpen && (
                <div>
                  <h3 className="font-medium">Admin User</h3>
                  <p className="text-sm text-gray-500">admin@dutydinar.com</p>
                </div>
              )}
            </div>
            <button 
              className="mt-4 flex items-center space-x-2 text-red-600 hover:text-red-700 w-full"
            >
              <LogOut size={20} />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;