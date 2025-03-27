import React, { useState, useEffect } from 'react';
import { getCategories } from '../api/get_categories'; // Import from api
import { getProducts } from '../api/get_products';  // Import from api
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minOrderQuantity, setMinOrderQuantity] = useState(0);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.categories);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const productList = await getProducts(selectedCategory, sortBy, priceRange, minOrderQuantity);
      setProducts(productList.products);
    };
    fetchProducts();
  }, [selectedCategory, sortBy, priceRange, minOrderQuantity]);

  const handleSeeProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`block w-full text-left px-2 py-1 rounded ${
                    selectedCategory === 'All' ? 'bg-green-50 text-green-600' : 'text-gray-600'
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`block w-full text-left px-2 py-1 rounded ${
                      selectedCategory === category.name ? 'bg-green-50 text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {category.name}
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
              {products.length > 0 ? (
                products.map((product) => {
                  const priceRange = product.price_range || { min: 0, max: 0 }; // Default to 0 if price_range is missing or undefined
                  return (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 bg-gray-200" style={{ backgroundImage: `url(${product.image_url})`, backgroundSize: 'cover' }} />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <div className="flex items-center mb-2">
                          <Star className="text-yellow-400" size={16} fill="currentColor" />
                          <span className="text-sm text-gray-600 ml-1">{product.rating} ({product.reviews} reviews)</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Category: {product.category}</div>
                        <div className="text-sm text-gray-600 mb-2">Stock: {product.stock} units</div>
                        <div className="text-sm text-gray-600 mb-2">MOQ: {product.minOrderQuantity} pieces</div>
                        <div className="flex justify-between items-center">
                          <div className="text-green-600 font-semibold">${product.price}</div>
                          <button
                            onClick={() => handleSeeProduct(product.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                          >
                            See Product
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-gray-600">No products available</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
