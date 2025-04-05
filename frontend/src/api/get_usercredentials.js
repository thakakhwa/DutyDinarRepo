import axios from "axios";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

export const getUserCredentials = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/get_usercredentials.php`,
      {
        withCredentials: true, // Essential for sending session cookies
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching user credentials:",
      error.response?.data || error.message
    );
    throw error;
  }
};
