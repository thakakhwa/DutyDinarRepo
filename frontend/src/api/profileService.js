import axios from "axios";


const API_BASE_URL = ""; 

export const getUserProfile = async () => {
  try {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      return {
        success: false,
        message: "User not authenticated - please login again"
      };
    }

    const response = await axios.get("get_user_profile.php", {
      params: { userId }
    });
    
    return response.data;
    
  } catch (error) {
    console.error("Profile fetch error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch profile"
    };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      return {
        success: false,
        message: "User not authenticated - please login again"
      };
    }

    const response = await axios.post("update_user_profile.php", {
      ...profileData,
      userId
    });
    
    return response.data;
    
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update profile"
    };
  }
};