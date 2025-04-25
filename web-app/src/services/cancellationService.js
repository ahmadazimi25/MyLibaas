import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const cancellationService = {
  // Get cancellation policy for an item
  getItemPolicy: async (itemId) => {
    try {
      const response = await axios.get(`${API_URL}/cancellation-policies/item/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all available cancellation policies
  getAllPolicies: async () => {
    try {
      const response = await axios.get(`${API_URL}/cancellation-policies`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update item's cancellation policy (for item owners)
  updateItemPolicy: async (itemId, policyId) => {
    try {
      const response = await axios.put(`${API_URL}/items/${itemId}/cancellation-policy`, {
        policyId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Calculate potential refund amount
  calculateRefund: async (bookingId) => {
    try {
      const response = await axios.get(`${API_URL}/cancellation-policies/calculate-refund/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit a cancellation request
  submitCancellation: async (bookingId, reason) => {
    try {
      const response = await axios.post(`${API_URL}/bookings/${bookingId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get cancellation history for user (as renter)
  getUserCancellations: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/cancellations/user`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get cancellation requests for user's items (as owner)
  getItemCancellations: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/cancellations/items`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Respond to a cancellation request (for item owners)
  respondToCancellation: async (cancellationId, response, message = '') => {
    try {
      const apiResponse = await axios.put(`${API_URL}/cancellations/${cancellationId}/respond`, {
        response,
        message
      });
      return apiResponse.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
