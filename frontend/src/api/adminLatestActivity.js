import axios from 'axios';

const API_BASE_URL = 'http://localhost/DutyDinarRepo/backend/api';

export const fetchLatestActivity = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_latest_activity.php`, { withCredentials: true });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch latest activity');
    }
  } catch (error) {
    throw error;
  }
};
