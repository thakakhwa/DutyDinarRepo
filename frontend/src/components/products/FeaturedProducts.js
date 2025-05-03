import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getProducts } from '../../api/get_products';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import { getFullImageUrl } from '../../utils/imageUtils';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProducts();
      console.log("FeaturedProducts fetched products:", response.products);
      if (response.success) {
        setProducts(response.products);
      } else {
        console.error('Error fetching products:', response.message);
      }
    };

    fetchProducts();
  }, []);

  const handleSeeProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleContactSupplier = (e, productId) => {
    e.stopPropagation(); // Prevent navigation when clicking contact button
    navigate(`/product/${productId}`);
  };

  return (
    <div className="max-w-7xl mx-auto mt-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Featured Products</h2>
        <a href="/categories" className="text-green-600 hover:underline">View All</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer relative"
            onClick={() => handleSeeProduct(product.id)}
          >
            <div
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${getFullImageUrl(product.image_url)})` }}
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <div className="text-sm text-gray-600 mb-1">Company: {product.companyName || "N/A"}</div>
              <div className="flex items-center mb-2">
                <Star className="text-yellow-400" size={16} fill="currentColor" />
                <span className="text-sm text-gray-600 ml-1">4.5 (245 reviews)</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">{product.description}</div>
              <div className="text-sm text-gray-600 mb-2">Category: {product.category}</div>
              <div className="text-sm text-gray-600 mb-2">MOQ: {product.minOrderQuantity} pieces</div>
              <div className="flex justify-between items-center">
                <div className="text-green-600 font-semibold">${product.price}</div>
                <div className="flex items-center">
                  <button 
                    className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                    onClick={(e) => handleContactSupplier(e, product.id)}
                  >
                    Contact Supplier
                  </button>
                  <FavoriteButton productId={product.id} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
