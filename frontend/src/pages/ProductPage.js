import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getProductById } from "../api/get_products";
import axios from "axios";
import FavoriteButton from "../components/products/FavoriteButton";

const ProductPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductById(productId);
        if (response.success) {
          setProduct({
            ...response.product,
            price: Number(response.product.price),
            stock: Number(response.product.stock),
            minOrderQuantity: Number(response.product.minOrderQuantity),
          });
        } else {
          alert(response.message || "Product not found");
          navigate(-1);
        }
      } catch (error) {
        alert("Failed to fetch product");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleAddToCart = async () => {
    try {
      const response = await axios.post("../api/cart.php", {
        product_id: productId,
        quantity: product.minOrderQuantity || 1,
      });

      if (response.data.success) {
        alert("Product added to cart!");
      } else {
        alert("Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Error adding to cart. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Product not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 relative">
            <h1 className="text-2xl font-semibold mb-1 flex items-center justify-between">
              {product.name}
            </h1>
            <div className="text-sm text-gray-600 mb-4">Company: {product.companyName || "N/A"}</div>
            <div className="text-lg font-semibold text-green-600 mb-4">
              ${product.price?.toFixed(2) || "00.00"}
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <strong>MOQ:</strong>{" "}
              {product.minOrderQuantity || "Not specified"}
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <strong>Stock:</strong> {product.stock} units available
            </div>

            <div className="text-sm text-gray-600 mb-6">
              {product.description || "No description available"}
            </div>

            <div className="flex gap-4 items-center">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Add to Cart
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="flex-1 border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50"
              >
                View Cart
              </button>
              <FavoriteButton productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
