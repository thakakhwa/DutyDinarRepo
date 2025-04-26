import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export const getBookedEvents = async () => {
  try {
    const response = await axios.get(API_BASE_URL + '/get_booked_events.php', { withCredentials: true });
    if (response.data.success) {
      return response.data.data.booked_events;
    } else {
      throw new Error(response.data.message || 'Failed to fetch booked events');
    }
  } catch (error) {
    console.error('Error fetching booked events:', error);
    throw error;
  }
};
