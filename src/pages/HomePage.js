import React from 'react';
import { Package, Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import FeaturedProducts from '../components/products/FeaturedProducts';
import EventPreview from '../components/events/EventPreview';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16 relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white"></div>
          <div className="absolute top-1/2 -left-48 w-96 h-96 rounded-full bg-white"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl font-bold mb-4">
                Connect with Top Manufacturers & Distributors
              </h1>
              <p className="text-lg mb-6">
                Duty Dinar brings businesses and suppliers together in one powerful B2B platform
              </p>
              <div className="flex space-x-4">
                <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold">
                  Start Buying
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold">
                  Become a Seller
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white rounded-lg p-8 text-gray-800">
                <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">5000+</div>
                    <div className="text-gray-600">Verified Suppliers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">50k+</div>
                    <div className="text-gray-600">Products Listed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">100k+</div>
                    <div className="text-gray-600">Business Buyers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">30+</div>
                    <div className="text-gray-600">Countries</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto mt-16 px-4">
        <h2 className="text-2xl font-semibold mb-8">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map(({ name, icon: Icon, gradient }) => (
            <div key={name} className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
              <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <Icon className="text-green-600 mb-2" size={32} />
              <span className="text-sm text-center">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Events Preview */}
      <EventPreview />
    </div>
  );
};

export default HomePage;