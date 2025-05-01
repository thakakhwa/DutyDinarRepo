import axios from "axios";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api"; 

export const getEvents = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_events.php`, { params });
    return {
      success: response.data.success,
      message: response.data.message,
      events: response.data.data?.events || [],
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch events",
      events: [],
    };
  }
};
