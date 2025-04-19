const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

// Fetch user profile data
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_usercredentials.php`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.'
    };
  }
};

// Update user profile data
export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update_profile.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.'
    };
  }
};
