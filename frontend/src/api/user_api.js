// src/api/user_api.js

export const getUserData = async (userId) => {
  try {
    // Make sure this URL matches your actual API endpoint
    const response = await fetch(`http://localhost/DutyDinarRepo/backend/api/get_user_for_profile.php?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include credentials if you're using sessions
      credentials: 'include'
    });

    const data = await response.json();
    
    // Add some debug logging to see the response
    console.log("API Response:", data);
    
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      success: false,
      message: "Failed to connect to the server. Please try again later."
    };
  }
};

export const deleteUser = async () => {
  try {
    const response = await fetch(`http://localhost/DutyDinarRepo/backend/api/delete_user.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: "Failed to connect to the server. Please try again later."
    };
  }
};