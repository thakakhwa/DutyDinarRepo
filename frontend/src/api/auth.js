import axios from "axios";

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";
axios.defaults.withCredentials = true;

export const login = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/login.php`, 
      { email, password },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      // Store user data and type
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userType', response.data.userType);
      return {
        ...response.data.data,
        userType: response.data.userType
      };
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const checkAuth = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/check_session.php`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Auth check error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await axios.post(
      `${API_BASE_URL}/logout.php`,
      {},
      { withCredentials: true }
    );
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};