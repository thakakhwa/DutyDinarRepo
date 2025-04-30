import axios from 'axios';

const API_BASE_URL = 'http://localhost/DutyDinarRepo/backend/api';

export const fetchOrders = async (status = 'all') => {
  try {
    const params = {};
    if (status && status !== 'all') {
      params.status = status;
    }
    const response = await axios.get(`${API_BASE_URL}/get_admin_orders.php`, { params, withCredentials: true });
    if (response.data.success) {
      return response.data.orders;
    } else {
      throw new Error(response.data.message || 'Failed to fetch orders');
    }
  } catch (error) {
    throw error;
  }
};
