import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const messageService = {
  // Get all conversations for the current user
  getConversations: async (page = 1, limit = 20) => {
    try {
      const response = await axios.get(`${API_URL}/messages/conversations`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId, page = 1, limit = 50) => {
    try {
      const response = await axios.get(`${API_URL}/messages/conversation/${conversationId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send a new message
  sendMessage: async (conversationId, content) => {
    try {
      const response = await axios.post(`${API_URL}/messages/conversation/${conversationId}`, {
        content
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Start a new conversation
  startConversation: async (userId, initialMessage) => {
    try {
      const response = await axios.post(`${API_URL}/messages/conversations`, {
        recipientId: userId,
        initialMessage
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark conversation as read
  markAsRead: async (conversationId) => {
    try {
      const response = await axios.put(`${API_URL}/messages/conversation/${conversationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/unread/count`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await axios.delete(`${API_URL}/messages/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Report a conversation
  reportConversation: async (conversationId, reason) => {
    try {
      const response = await axios.post(`${API_URL}/messages/conversation/${conversationId}/report`, {
        reason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
