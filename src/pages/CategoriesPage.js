import React, { useState } from 'react';
import { Star } from 'lucide-react';

const CategoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minOrderQuantity, setMinOrderQuantity] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {['All', 'Raw Supplies', 'Stationery', 'Packaging', 'Garments', 'Medical', 'Electronics', 'Software', 'Marketing'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block w-full text-left px-2 py-1 rounded ${
                      selectedCategory === category ? 'bg-green-50 text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <hr className="my-4" />

              <h3 className="font-semibold mb-4">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              <hr className="my-4" />

              <h3 className="font-semibold mb-4">Minimum Order</h3>
              <input
                type="number"
                value={minOrderQuantity}
                onChange={(e) => setMinOrderQuantity(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter MOQ"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Products</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 9].map((product) => (
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
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;