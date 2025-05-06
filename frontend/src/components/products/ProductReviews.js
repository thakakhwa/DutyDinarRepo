import React, { useEffect, useState } from 'react';

const ProductReviews = ({ productId }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost/DutyDinarRepo/backend/api/get_reviews.php?product_id=${productId}`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          const reviews = data.reviews;
          if (reviews.length > 0) {
            const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
            setAverageRating(avg.toFixed(1));
            setReviewCount(reviews.length);
          } else {
            setAverageRating(0);
            setReviewCount(0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      }
    };
    fetchReviews();
  }, [productId]);

  return (
    <span className="text-sm text-gray-600 ml-1">
      {averageRating} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
    </span>
  );
};

export default ProductReviews;
