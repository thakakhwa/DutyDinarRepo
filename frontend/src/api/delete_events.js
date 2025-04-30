import { API_BASE_URL } from './apiConfig';

export const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(API_BASE_URL + '/delete_events.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: eventId }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};
