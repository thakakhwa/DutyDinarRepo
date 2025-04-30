import axios from 'axios';

const API_BASE_URL = 'http://localhost/DutyDinarRepo/backend/api';

export const fetchAdminAnalytics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_admin_analytics.php`, { withCredentials: true });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch admin analytics');
    }
  } catch (error) {
    throw error;
  }
};
