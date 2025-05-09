import React, { useState, useEffect } from "react";
import { getCategories } from "../api/get_categories";
import { getProducts } from "../api/get_products";
import { Star, Package } from "lucide-react"; 
import { useNavigate, useLocation } from "react-router-dom";
import { getCategoryIcon } from "../data/categories";
import FavoriteButton from "../components/products/FavoriteButton";
import ProductReviews from "../components/products/ProductReviews";
import { getFullImageUrl } from "../utils/imageUtils";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState("recommended");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 9999999 });
  const [minOrderQuantity, setMinOrderQuantity] = useState(-1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.success) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Parse category from URL query parameter
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
    }
  }, [location.search]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryParam = selectedCategory ? selectedCategory.toString() : '';
        const priceRangeArray = [priceRange.min, priceRange.max];

        const productList = await getProducts(
          categoryParam,
          sortBy,
          priceRangeArray,
          minOrderQuantity
        );
        if (productList.success) {
          setProducts(productList.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortBy, priceRange, minOrderQuantity, selectedCategory]);

  const handleSeeProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    // Ensure the value is at least 0
    const newValue = Math.max(0, parseInt(value) || 0);
    
    // Make sure min doesn't exceed max and max isn't less than min
    if (name === 'min' && newValue > priceRange.max) {
      setPriceRange((prev) => ({ ...prev, min: prev.max }));
    } else if (name === 'max' && newValue < priceRange.min) {
      setPriceRange((prev) => ({ ...prev, max: prev.min }));
    } else {
      setPriceRange((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const handleMinOrderChange = (e) => {
    const value = e.target.value;
    // If the field is empty, set to -1 (which means no filter)
    if (value === '') {
      setMinOrderQuantity(-1);
    } else {
      // Otherwise use the parsed integer value, ensuring it's not negative
      setMinOrderQuantity(Math.max(0, parseInt(value) || 0));
    }
  };

  const selectedCategoryName = selectedCategory 
    ? categories.find(c => c.id === selectedCategory)?.name 
    : null;

  const filteredProducts = products.filter(product => {
    const productCategory = product.category ? product.category.trim().toLowerCase() : "";
    const selectedCategoryNameLower = selectedCategoryName ? selectedCategoryName.trim().toLowerCase() : "";

    const categoryMatches = !selectedCategoryNameLower || productCategory === selectedCategoryNameLower;
    
    const priceMatches = product.price >= priceRange.min && product.price <= priceRange.max;
    const moqMatches = minOrderQuantity < 0 || product.minOrderQuantity >= minOrderQuantity;
    
    return categoryMatches && priceMatches && moqMatches;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left px-2 py-1 rounded ${
                    !selectedCategory
                      ? "bg-green-50 text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`block w-full text-left px-2 py-1 rounded ${
                      selectedCategory === category.id
                        ? "bg-green-50 text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <hr className="my-4" />

              <h3 className="font-semibold mb-4">Price Range (JOD)</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Min Price:</label>
                  <input
                    type="number"
                    min="0"
                    name="min"
                    value={priceRange.min}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Minimum price"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Max Price:</label>
                  <input
                    type="number"
                    min="0"
                    name="max"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Maximum price"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Current range:</span>
                  <span>{priceRange.min} - {priceRange.max} JOD</span>
                </div>
              </div>

              <hr className="my-4" />

              <h3 className="font-semibold mb-4">Minimum Order Quantity</h3>
              <input
                type="number"
                value={minOrderQuantity < 0 ? '' : minOrderQuantity}
                onChange={handleMinOrderChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter MOQ"
                min="0"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {selectedCategoryName
                  ? `${selectedCategoryName} Products`
                  : "All Products"}
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
              {loading ? (
                <div className="col-span-full text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading products...</p>
                </div>
              ) : sortedProducts.length > 0 ? (
                sortedProducts.map((product) => {
                  const CategoryIcon = getCategoryIcon(product.category)?.icon || Package;
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden relative"
                    >
                      {(() => {
                        const imageUrl = product.image_url && !product.image_url.startsWith('http') ? `${process.env.REACT_APP_BACKEND_BASE_URL || ''}/${product.image_url}` : product.image_url;
                        return (
                          <div
                            className="h-48 bg-gray-200 bg-cover bg-center"
                            style={{ backgroundImage: `url(${getFullImageUrl(product.image_url)})` }}
                          />
                        );
                      })()}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">
                          {product.name}
                        </h3>
                        <div className="text-sm text-gray-600 mb-2">
                          Company: {product.companyName || "N/A"}
                        </div>
                        <div className="flex items-center mb-2">
                          <Star
                            className="text-yellow-400"
                            size={16}
                            fill="currentColor"
                          />
                          <span className="text-sm text-gray-600 ml-1">
                            <ProductReviews productId={product.id} />
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2 flex items-center">
                          <CategoryIcon size={16} className="mr-1" />
                          Category: {product.category || "N/A"}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Stock: {product.stock} units
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          MOQ: {product.minOrderQuantity} pieces
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-green-600 font-semibold">
                            {product.price} JOD
                          </div>
                          <button
                            onClick={() => handleSeeProduct(product.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                          >
                            See Product
                          </button>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <FavoriteButton productId={product.id} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-10 text-gray-600">
                  No products available matching your criteria
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
