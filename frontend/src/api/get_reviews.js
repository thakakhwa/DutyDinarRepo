import axios from 'axios';

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

const getReviews = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_reviews.php`, {
      params: { product_id: productId },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { success: false, reviews: [] };
  }
};

export default getReviews;
