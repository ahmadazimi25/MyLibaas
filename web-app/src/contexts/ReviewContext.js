import React, { createContext, useContext, useState, useCallback } from 'react';

const ReviewContext = createContext(null);

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReview = useCallback(async ({
    targetType, // 'item' or 'user'
    targetId,
    reviewerId,
    rating,
    comment,
    bookingId,
    images = []
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const review = {
        id: Math.random().toString(36).substr(2, 9),
        targetType,
        targetId,
        reviewerId,
        rating,
        comment,
        bookingId,
        images,
        createdAt: new Date(),
        helpful: 0,
        reported: false
      };

      return { success: true, review };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getReviews = useCallback(async ({ targetType, targetId, page = 1, limit = 10 }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockReviews = [
        {
          id: '1',
          targetType,
          targetId,
          reviewerId: 'user1',
          reviewer: {
            name: 'John Doe',
            avatar: 'https://i.pravatar.cc/150?u=user1',
            rating: 4.5
          },
          rating: 5,
          comment: 'Great experience! The dress was in perfect condition.',
          images: ['https://picsum.photos/400/600?random=1'],
          createdAt: new Date('2025-04-20'),
          helpful: 3,
          reported: false
        },
        // Add more mock reviews
      ];

      return {
        success: true,
        data: {
          reviews: mockReviews,
          total: 25,
          page,
          totalPages: 3
        }
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserRating = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        data: {
          rating: 4.5,
          totalReviews: 15,
          breakdown: {
            5: 8,
            4: 5,
            3: 1,
            2: 1,
            1: 0
          }
        }
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const markHelpful = useCallback(async (reviewId) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const reportReview = useCallback(async (reviewId, reason) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    loading,
    error,
    createReview,
    getReviews,
    getUserRating,
    markHelpful,
    reportReview
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};
