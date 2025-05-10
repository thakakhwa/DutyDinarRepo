import { API_BASE_URL } from './apiConfig';

export const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_events.php`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (data.success && data.data && Array.isArray(data.data.events)) {
      return { success: true, data: data.data.events };
    } else {
      return { success: false, message: data.message || 'Failed to fetch events' };
    }
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};

export const addEvent = async (eventData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/add_events.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(eventData),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};

export const updateEvent = async (eventData) => {
  try {
    console.log("Sending event update request with data:", eventData);
    
    // Try POST method first since some servers may not support PUT
    const response = await fetch(`${API_BASE_URL}/update_events.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(eventData),
    });
    
    console.log("Update event response status:", response.status);
    
    // Check if response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      
      try {
        // Try to parse the error as JSON
        const errorJson = JSON.parse(errorText);
        return errorJson; // If it's valid JSON, return it
      } catch (parseError) {
        // If it's not valid JSON, return a generic error
        return { 
          success: false, 
          message: `Server error (${response.status}): ${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}` 
        };
      }
    }
    
    // For successful responses, try to parse JSON
    try {
      const result = await response.json();
      console.log("Update event result:", result);
      return result;
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      return { 
        success: false, 
        message: 'Invalid response from server: ' + jsonError.message 
      };
    }
  } catch (error) {
    console.error("Error in updateEvent:", error);
    return { 
      success: false, 
      message: 'Network error: ' + error.message 
    };
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete_events.php?id=${eventId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};
