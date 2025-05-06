import React, { useEffect, useState } from 'react';
import { getProducts } from '../api/get_products';
import { getFullImageUrl } from '../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

const RecommendedProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRandomProducts = async () => {
      const response = await getProducts();
      if (response.success) {
        // Shuffle products and take 3 random
        const shuffled = response.products.sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 3));
      }
    };
    fetchRandomProducts();
  }, []);

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={getFullImageUrl(product.image_url)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-medium">{product.name}</h4>
            <div className="text-sm text-gray-600">Category: {product.category}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedProducts;
