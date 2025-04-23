import axios from 'axios';

const addReview = async (productId, rating, comment) => {
  try {
    const response = await axios.post(
      'http://localhost/DutyDinarRepo/backend/api/add_review.php',
      {
        product_id: productId,
        rating,
        comment,
      },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    return { success: false, message: error.message };
  }
};

export default addReview;
