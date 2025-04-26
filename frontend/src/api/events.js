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
    const response = await fetch(`${API_BASE_URL}/update_events.php`, {
      method: 'PUT',
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
