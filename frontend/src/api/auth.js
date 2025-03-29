const API_URL = "http://localhost:5000"; // Update this based on your backend

// Login function
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Ensures session cookies are sent
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: "Error connecting to server." };
  }
};

// Check session function
export const checkSession = async () => {
  try {
    const response = await fetch(`${API_URL}/check-session.php`, {
      method: "GET",
      credentials: "include", // Ensures cookies are included
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: "Error checking session." };
  }
};
