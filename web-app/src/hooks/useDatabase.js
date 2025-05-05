import { useState, useCallback } from 'react';
import DatabaseService from '../services/DatabaseService';

export const useDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Users
  const createUser = useCallback(async (userId, userData) => {
    setLoading(true);
    setError(null);
    try {
      await DatabaseService.createUser(userId, userData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUser = useCallback(async (username) => {
    setLoading(true);
    setError(null);
    try {
      const user = await DatabaseService.getUser(username);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Listings
  const createListing = useCallback(async (listingData) => {
    setLoading(true);
    setError(null);
    try {
      const listingId = await DatabaseService.createListing(listingData);
      return listingId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getListing = useCallback(async (listingId) => {
    setLoading(true);
    setError(null);
    try {
      const listing = await DatabaseService.getListing(listingId);
      return listing;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchListings = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const listings = await DatabaseService.searchListings(filters);
      return listings;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Rentals
  const createRental = useCallback(async (rentalData) => {
    setLoading(true);
    setError(null);
    try {
      const rentalId = await DatabaseService.createRental(rentalData);
      return rentalId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRentalStatus = useCallback(async (rentalId, status) => {
    setLoading(true);
    setError(null);
    try {
      await DatabaseService.updateRentalStatus(rentalId, status);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reviews
  const createReview = useCallback(async (reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const reviewId = await DatabaseService.createReview(reviewData);
      return reviewId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Messages
  const createConversation = useCallback(async (participants) => {
    setLoading(true);
    setError(null);
    try {
      const conversationId = await DatabaseService.createConversation(participants);
      return conversationId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId, messageData) => {
    setLoading(true);
    setError(null);
    try {
      await DatabaseService.sendMessage(conversationId, messageData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getConversations = useCallback(async (username) => {
    setLoading(true);
    setError(null);
    try {
      const conversations = await DatabaseService.getConversations(username);
      return conversations;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Transactions
  const createTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    setError(null);
    try {
      const transactionId = await DatabaseService.createTransaction(transactionData);
      return transactionId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransactionStatus = useCallback(async (transactionId, status) => {
    setLoading(true);
    setError(null);
    try {
      await DatabaseService.updateTransactionStatus(transactionId, status);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // User Methods
    createUser,
    getUser,
    
    // Listing Methods
    createListing,
    getListing,
    searchListings,
    
    // Rental Methods
    createRental,
    updateRentalStatus,
    
    // Review Methods
    createReview,
    
    // Message Methods
    createConversation,
    sendMessage,
    getConversations,
    
    // Transaction Methods
    createTransaction,
    updateTransactionStatus
  };
};

export default useDatabase;
