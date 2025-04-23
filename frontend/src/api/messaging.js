import axios from 'axios';

const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

export const getConversations = async () => {
  try {
    const response = await axios.get(API_BASE_URL + '/get_conversations.php', { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getMessages = async (conversationId) => {
  try {
    const response = await axios.get(API_BASE_URL + '/get_messages.php?conversation_id=' + conversationId, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (conversationId, message) => {
  try {
    const response = await axios.post(
      API_BASE_URL + '/send_message.php',
      { conversation_id: conversationId, message },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// New API call to search users by name
export const searchUsers = async (query) => {
  try {
    const response = await axios.get(API_BASE_URL + '/search_users.php?query=' + encodeURIComponent(query), { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// New API call to create or open a conversation with a user
export const createOrOpenConversation = async (userId) => {
  try {
    const response = await axios.post(
      API_BASE_URL + '/create_or_open_conversation.php',
      { user_id: userId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating or opening conversation:', error);
    throw error;
  }
};
