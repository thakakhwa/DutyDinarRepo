import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Grid, List } from 'lucide-react';

const ProductsPage = () => {
  const [viewType, setViewType] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const products = [
    {
      id: 1,
      name: 'Product Name 1',
      category: 'Electronics',
      price: 299.99,
      stock: 45,
      seller: 'Seller Name',
      status: 'active',
      image: '/placeholder.jpg'
    },
    // Add more products
  ];

  const categories = [
    'All', 'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Automotive'
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus size={20} className="mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  ${selectedCategory === category.toLowerCase()
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 ${viewType === 'grid' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 ${viewType === 'list' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {viewType === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                <div className="aspect-w-4 aspect-h-3 bg-gray-100">
                  {/* Product Image */}
                  <div className="w-full h-full bg-gray-200"></div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button className="p-2 bg-white rounded-lg hover:bg-gray-100">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 bg-white rounded-lg hover:bg-gray-100">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="font-medium text-green-600">${product.price}</span>
                    <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Product</th>
                  <th className="text-left py-4 px-4">Category</th>
                  <th className="text-left py-4 px-4">Price</th>
                  <th className="text-left py-4 px-4">Stock</th>
                  <th className="text-left py-4 px-4">Seller</th>
                  <th className="text-left py-4 px-4">Status</th>
                  <th className="text-left py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded"></div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{product.category}</td>
                    <td className="py-4 px-4 font-medium">${product.price}</td>
                    <td className="py-4 px-4 text-gray-600">{product.stock}</td>
                    <td className="py-4 px-4 text-gray-600">{product.seller}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing 1 to 12 of 100 products
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

export default ProductsPage;