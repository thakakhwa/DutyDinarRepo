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
<<<<<<< HEAD
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
=======
        success: true,
        data: response.data.data,
        userType: response.data.userType
      };
    } else {
      return {
        success: false,
        message: response.data.message
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.message
    };
  }
};

export const signupUser = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup.php`, formData);

    if (response.data.success) {
      // Auto-login after signup
      const loginResponse = await login(formData.email, formData.password);
      if (loginResponse) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', loginResponse.userType);
        return {
          success: true,
          message: 'Signup and login successful',
          data: loginResponse
        };
      }
    }
    return {
      success: false,
      message: response.data.message || 'Signup failed',
      data: null
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      message: error.response?.data?.message || 'Signup failed',
      data: null
    };
  }
};

export const checkAuth = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/get_session.php`,
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
>>>>>>> fixedbranchfsfs
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