import React, { useState, useEffect } from 'react';
import { getCategories } from '../api/get_categories';
import { getProducts } from '../api/get_products';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 99999 });
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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const filters = {
        categoryId: selectedCategory,  // Changed to categoryId
        sortBy,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        minOrderQuantity
      };
      
      const productList = await getProducts(filters);
      if (productList.success) {
        setProducts(productList.products);
      }
    };
    
    fetchProducts();
  }, [selectedCategory, sortBy, priceRange, minOrderQuantity]);

  const handleSeeProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => ({ ...prev, max: value }));
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
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left px-2 py-1 rounded ${
                    !selectedCategory ? 'bg-green-50 text-green-600' : 'text-gray-600'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`block w-full text-left px-2 py-1 rounded ${
                      selectedCategory === category.id ? 'bg-green-50 text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <hr className="my-4" />

              <h3 className="font-semibold mb-4">Price Range ($)</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="99999"
                  value={priceRange.max}
                  onChange={handlePriceChange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange.min}</span>
                  <span>${priceRange.max}</span>
                </div>
              </div>

              <hr className="my-4" />

              <h3 className="font-semibold mb-4">Minimum Order</h3>
              <input
                type="number"
                value={minOrderQuantity}
                onChange={(e) => setMinOrderQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter MOQ"
                min="0"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.name + ' Products'
                  : 'All Products'}
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products
                  .filter(product => 
                    (!selectedCategory || product.categoryId === selectedCategory) && // Category filter
                    product.price >= priceRange.min &&
                    product.price <= priceRange.max &&
                    product.minOrderQuantity >= minOrderQuantity
                  )
                  .sort((a, b) => {
                    switch(sortBy) {
                      case 'price_asc': return a.price - b.price;
                      case 'price_desc': return b.price - a.price;
                      case 'rating': return b.rating - a.rating;
                      default: return 0;
                    }
                  })
                  .map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div 
                        className="h-48 bg-gray-200 bg-cover bg-center"
                        style={{ backgroundImage: `url(${product.image_url})` }}
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <div className="flex items-center mb-2">
                          <Star className="text-yellow-400" size={16} fill="currentColor" />
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating} ({product.reviews} reviews)
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Category: {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                        </div>
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
                  ))
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