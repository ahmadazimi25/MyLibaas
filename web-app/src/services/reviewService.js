import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const reviewService = {
  // Get reviews for an item
  getItemReviews: async (itemId, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/reviews/item/${itemId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new review
  createReview: async (itemId, reviewData) => {
    try {
      const response = await axios.post(`${API_URL}/reviews/item/${itemId}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await axios.put(`${API_URL}/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await axios.delete(`${API_URL}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's reviews (reviews they've written)
  getUserReviews: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/reviews/user`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get review statistics for an item
  getItemReviewStats: async (itemId) => {
    try {
      const response = await axios.get(`${API_URL}/reviews/item/${itemId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
