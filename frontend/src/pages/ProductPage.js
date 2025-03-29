import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductPage = () => {
  const navigate = useNavigate();

    useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, []);

  // Sample product data
  const product = {
    id: 1,
    name: 'Premium Quality Cotton T-Shirt',
    description: 'This premium quality cotton t-shirt is perfect for everyday wear. Made from 100% organic cotton, it offers exceptional comfort and durability. Available in various sizes and colors.',
    price: 25.0,
    discountedPrice: 20.0,
    rating: 4.5,
    reviews: 245,
    moq: 100,
    images: [
      'https://via.placeholder.com/400x400',
      'https://via.placeholder.com/400x400',
      'https://via.placeholder.com/400x400',
    ],
    specifications: {
      material: '100% Organic Cotton',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Black', 'Gray', 'Blue'],
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back to Products
        </button>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-semibold mb-4">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <Star className="text-yellow-400" size={16} fill="currentColor" />
                <span className="text-sm text-gray-600 ml-1">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
              <button className="ml-4 text-gray-600 hover:text-red-500">
                <Heart size={20} />
              </button>
            </div>

            <div className="text-lg font-semibold text-green-600 mb-4">
              ${product.discountedPrice} <span className="text-sm text-gray-400 line-through">${product.price}</span>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <strong>MOQ:</strong> {product.moq} pieces
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <strong>Material:</strong> {product.specifications.material}
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <strong>Sizes:</strong> {product.specifications.sizes.join(', ')}
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <strong>Colors:</strong> {product.specifications.colors.join(', ')}
            </div>

            <div className="text-sm text-gray-600 mb-6">
              {product.description}
            </div>

            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Contact Supplier
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((review) => (
              <div key={review} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-2">
                  <Star className="text-yellow-400" size={16} fill="currentColor" />
                  <span className="text-sm text-gray-600 ml-1">4.5</span>
                </div>
                <p className="text-sm text-gray-600">
                  "This is a great product! The quality is excellent and it fits perfectly. Highly recommend!"
                </p>
                <div className="text-xs text-gray-400 mt-2">By John Doe on October 10, 2023</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;