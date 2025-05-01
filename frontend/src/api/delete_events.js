import { API_BASE_URL } from './apiConfig';

export const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete_events.php?id=${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};
