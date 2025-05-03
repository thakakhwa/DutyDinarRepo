// src/api/profile.js

export const updateProfile = async (profileData) => {
    try {
      const response = await fetch('http://localhost/your-php-api/update_profile.php', {
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
  
  export const changePassword = async (passwordData) => {
    try {
      const response = await fetch('http://localhost/your-php-api/change_password.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData)
      });
      return await response.json();
    } catch (error) {
      return { 
        success: false, 
        message: 'Network error. Please check your connection.'
      };
    }
  };

export const deleteUser = async () => {
    try {
      const response = await fetch('http://localhost/DutyDinarRepo/backend/api/delete_user.php', {
        method: 'POST',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  };
