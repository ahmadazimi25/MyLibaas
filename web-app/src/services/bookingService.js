import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const bookingService = {
  // Create a new booking
  createBooking: async (itemId, bookingData) => {
    try {
      const response = await axios.post(`${API_URL}/bookings/item/${itemId}`, bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all bookings for an item
  getItemBookings: async (itemId) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/item/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's bookings (as renter)
  getUserBookings: async (status = 'all', page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/user`, {
        params: { status, page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get bookings for user's items (as owner)
  getUserItemBookings: async (status = 'all', page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/user/items`, {
        params: { status, page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update booking status (accept/reject/cancel)
  updateBookingStatus: async (bookingId, status, reason = '') => {
    try {
      const response = await axios.put(`${API_URL}/bookings/${bookingId}/status`, {
        status,
        reason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check item availability for given dates
  checkAvailability: async (itemId, startDate, endDate) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/item/${itemId}/availability`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
