import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const API_BASE = `${API_BASE_URL}/admin_users.php`;

export const fetchUsers = async (search = '', filter = 'all', page = 1) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (filter) params.append('filter', filter);
  params.append('page', page);

  const response = await axios.get(`${API_BASE}?${params.toString()}`);
  return response.data;
};

export const addUser = async (userData) => {
  const response = await axios.post(API_BASE, userData);
  return response.data;
};

export const editUser = async (userData) => {
  const response = await axios.put(API_BASE, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(API_BASE, { data: { id: userId } });
  return response.data;
};
