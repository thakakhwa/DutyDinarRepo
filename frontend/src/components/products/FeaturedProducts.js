import React from 'react';
import { Star } from 'lucide-react';

const FeaturedProducts = () => {
  return (
    <div className="max-w-7xl mx-auto mt-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Featured Products</h2>
        <a href="/categories" className="text-green-600 hover:underline">View All</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((product) => (
          <div key={product} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200" />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">Product Name</h3>
              <div className="flex items-center mb-2">
                <Star className="text-yellow-400" size={16} fill="currentColor" />
                <span className="text-sm text-gray-600 ml-1">4.5 (245 reviews)</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">MOQ: 100 pieces</div>
              <div className="flex justify-between items-center">
                <div className="text-green-600 font-semibold">$2.00 - $1.50</div>
                <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                  Contact Supplier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;