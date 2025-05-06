import React from 'react';

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-600">No reviews yet.</p>;
  }

  return (
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
  );
};

export default ReviewList;
