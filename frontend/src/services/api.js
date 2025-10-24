import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const chatAPI = {
  sendMessage: (data, config) => api.post('/chat/message', data, config),
  getConversation: (id) => api.get(`/chat/conversation/${id}`),
  getConversations: () => api.get('/chat/conversations'),
  deleteConversation: (id) => api.delete(`/chat/conversation/${id}`),
  getLimit: () => api.get('/chat/limit'),
};

export default api;