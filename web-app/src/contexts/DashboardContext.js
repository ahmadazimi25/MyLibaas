import React, { createContext, useContext, useState, useCallback } from 'react';

const DashboardContext = createContext(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [userListings, setUserListings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [statistics, setStatistics] = useState({
    totalEarnings: 0,
    activeListings: 0,
    completedBookings: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserListings = useCallback(async (userId) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockListings = [
        {
          id: '1',
          title: 'Traditional Wedding Dress',
          description: 'Beautiful traditional wedding dress',
          price: 150,
          images: [{ url: 'https://picsum.photos/800/1200?random=1', isPrimary: true }],
          status: 'active',
          totalBookings: 5,
          totalEarnings: 750,
          rating: 4.8,
          createdAt: new Date('2025-01-15'),
        },
        // Add more mock listings
      ];

      setUserListings(mockListings);
      return mockListings;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserBookings = useCallback(async (userId) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBookings = [
        {
          id: '1',
          itemId: '123',
          item: {
            title: 'Traditional Wedding Dress',
            images: [{ url: 'https://picsum.photos/800/1200?random=1', isPrimary: true }],
          },
          status: 'confirmed',
          dates: {
            start: new Date('2025-05-01'),
            end: new Date('2025-05-03'),
          },
          totalPrice: 450,
          createdAt: new Date('2025-04-15'),
        },
        // Add more mock bookings
      ];

      setUserBookings(mockBookings);
      return mockBookings;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReceivedBookings = useCallback(async (userId) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBookings = [
        {
          id: '1',
          renterId: '456',
          renter: {
            name: 'Jane Smith',
            rating: 4.5,
          },
          item: {
            id: '123',
            title: 'Traditional Wedding Dress',
            images: [{ url: 'https://picsum.photos/800/1200?random=1', isPrimary: true }],
          },
          status: 'pending',
          dates: {
            start: new Date('2025-05-01'),
            end: new Date('2025-05-03'),
          },
          totalPrice: 450,
          createdAt: new Date('2025-04-15'),
        },
        // Add more mock bookings
      ];

      setReceivedBookings(mockBookings);
      return mockBookings;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardStatistics = useCallback(async (userId) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats = {
        totalEarnings: 2500,
        activeListings: 5,
        completedBookings: 15,
        averageRating: 4.7,
      };

      setStatistics(mockStats);
      return mockStats;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateListingStatus = useCallback(async (listingId, status) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserListings(prev =>
        prev.map(listing =>
          listing.id === listingId
            ? { ...listing, status }
            : listing
        )
      );

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    userListings,
    userBookings,
    receivedBookings,
    statistics,
    loading,
    error,
    fetchUserListings,
    fetchUserBookings,
    fetchReceivedBookings,
    fetchDashboardStatistics,
    updateListingStatus,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
