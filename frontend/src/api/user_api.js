// API functions for user operations

export const getUserData = async (userId = null) => {
  try {
    let url = 'http://localhost/DutyDinarRepo/backend/api/get_user_for_profile.php';
    
    // If userId is provided, add it as a query parameter
    if (userId) {
      url += `?user_id=${userId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Include cookies for session management
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { success: false, message: 'Failed to fetch user data' };
  }
};

export const checkSession = async () => {
  try {
    const response = await fetch('http://localhost/DutyDinarRepo/backend/api/get_session.php', {
      method: 'GET',
      credentials: 'include', // Include cookies for session management
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking session:', error);
    return { success: false, message: 'Failed to check session' };
  }
};

export const deleteUser = async () => {
  try {
    const response = await fetch('http://localhost/DutyDinarRepo/backend/api/delete_user.php', {
      method: 'DELETE',
      credentials: 'include', // Include cookies for session management
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user account' };
  }
};