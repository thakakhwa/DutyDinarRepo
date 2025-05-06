import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getProductById } from "../api/get_products";
import axios from "axios";
import FavoriteButton from "../components/products/FavoriteButton";
import { AuthContext } from "../context/AuthContext";
import addReview from "../api/add_review";
import getReviews from "../api/get_reviews";
import { getFullImageUrl } from "../utils/imageUtils";
import AuthModal from "../components/auth/AuthModal";
import ReviewList from "../components/products/ReviewList";
import ProductReviews from "../components/products/ProductReviews";

const ProductPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: "", comment: "" });
  const [addingReview, setAddingReview] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const imageUrl = getFullImageUrl(product?.image_url);

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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getReviews(productId);
        if (response.success) {
          setReviews(response.reviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setReviews([]);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      const response = await axios.post(
        "http://localhost/DutyDinarRepo/backend/api/add_cart.php",
        {
          product_id: productId,
          quantity: 1,
        },
        { withCredentials: true }
      );

      console.log("Add to cart response:", response.data);

      if (response.data.success) {
        alert("Product added to cart!");
        navigate('/cart');
      } else {
        alert("Failed to add to cart: " + (response.data.message || ""));
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Error adding to cart. Please try again.");
    }
  };

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    const rating = parseInt(reviewForm.rating);
    const comment = reviewForm.comment.trim();

    if (!rating || rating < 1 || rating > 5) {
      alert("Invalid rating. Please enter a number between 1 and 5.");
      return;
    }
    if (!comment) {
      alert("Review comment cannot be empty.");
      return;
    }

    setAddingReview(true);
    try {
      const response = await addReview(productId, rating, comment);
      if (response.success) {
        alert("Review added successfully!");
        setReviewForm({ rating: "", comment: "" });
        const refreshed = await getReviews(productId);
        if (refreshed.success) {
          setReviews(refreshed.reviews);
        }
      } else {
        alert("Failed to add review: " + (response.message || ""));
      }
    } catch (error) {
      console.error("Add review error:", error);
      alert("Error adding review. Please try again.");
    } finally {
      setAddingReview(false);
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
    <>
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
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 relative">
              <h1 className="text-2xl font-semibold mb-1 flex items-center justify-between">
                {product.name}
              </h1>
              <div className="text-sm text-gray-600 mb-4">
                Company: {product.companyName || "N/A"}
              </div>
              <div className="text-lg font-semibold text-green-600 mb-4">
                ${product.price?.toFixed(2) || "00.00"}
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <strong>MOQ:</strong> {product.minOrderQuantity || "Not specified"}
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <strong>Stock:</strong> {product.stock} units available
              </div>

              <div className="text-sm text-gray-600 mb-6">
                {product.description || "No description available"}
              </div>

              <div className="flex gap-4 items-center mb-6">
                {(user && user.userType === "buyer") && (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add to Cart
                  </button>
                )}
              <button
                onClick={() => {
                  if (user) {
                    setShowModal(true);
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Add a Review
              </button>
                {(user && user.userType === "buyer") && (
                  <button
                    onClick={() => navigate("/cart")}
                    className="flex-1 border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50"
                  >
                    View Cart
                  </button>
                )}
                <FavoriteButton productId={product.id} />
              </div>

              <div className="flex items-center mb-4">
                <span className="text-lg font-semibold mr-2">Average Rating:</span>
                <ProductReviews productId={productId} />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                {reviews.length === 0 ? (
                  <p className="text-gray-600">No reviews yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((review, index) => (
                      <li key={index} className="border border-gray-300 rounded p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{review.username}</span>
                          <span className="text-yellow-500">
                            {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(review.created_at).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add a Review</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleAddReview(e);
                setShowModal(false);
              }}
              className="flex flex-col gap-4"
            >
              <select
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewInputChange}
                className="p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select rating</option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <textarea
                name="comment"
                value={reviewForm.comment}
                onChange={handleReviewInputChange}
                placeholder="Write your review here"
                className="p-2 border border-gray-300 rounded resize-none"
                rows={4}
                required
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingReview}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {addingReview ? "Adding..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialUserType="buyer"
        />
      )}
    </>
  );
};

export default ProductPage;
