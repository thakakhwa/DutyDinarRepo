// this file shows random products in a sidebar or widget
// it loads 3 random products each time page loads

// import things we need
import React, { useEffect, useState } from 'react';
import { getProducts } from '../api/get_products'; // function to get products from database
import { getFullImageUrl } from '../utils/imageUtils'; // function to make complete image urls
import { useNavigate } from 'react-router-dom'; // helps change pages when clicking products

// RecommendedProducts component - shows 3 random products
// input: none
// output: a div with 3 product previews
const RecommendedProducts = () => {
  // this saves our list of products
  // useState([]) means we start with empty array
  const [products, setProducts] = useState([]);
  const navigate = useNavigate(); // this lets us go to product page when clicked

  // useEffect runs when component first loads
  // the empty array [] at end means it only runs once
  useEffect(() => {
    // this function gets products from server
    const fetchRandomProducts = async () => {
      // call api to get all products
      const response = await getProducts();
      if (response.success) {
        // if we got products successfully, shuffle them randomly
        // this makes us show different products each time
        const shuffled = response.products.sort(() => 0.5 - Math.random());
        // take first 3 products from shuffled list
        setProducts(shuffled.slice(0, 3));
      }
    };
    // run the function we just created
    fetchRandomProducts();
  }, []);

  // show the products in a list
  return (
    <div className="space-y-4">
      {/* map goes through each product and makes html for it */}
      {products.map((product) => (
        // key={product.id} helps react know which item is which
        <div key={product.id} className="flex items-center space-x-3">
          {/* small round product image */}
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={getFullImageUrl(product.image_url)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* product name and category */}
          <div>
            <h4 className="font-medium">{product.name}</h4>
            <div className="text-sm text-gray-600">Category: {product.category}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// export so other files can use this component
export default RecommendedProducts;
