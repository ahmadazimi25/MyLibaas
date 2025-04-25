import React, { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBooking = {
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: new Date(),
        ...bookingData,
      };

      setBookings(prev => [...prev, newBooking]);
      return { success: true, booking: newBooking };
    } catch (err) {
      setError(err.message || 'Failed to create booking');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBooking = useCallback(async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock booking data
      const mockBooking = {
        id: bookingId,
        itemId: '123',
        renterId: '456',
        lenderId: '789',
        status: 'confirmed',
        dates: {
          start: new Date('2025-05-01'),
          end: new Date('2025-05-03'),
        },
        pricing: {
          dailyRate: 75,
          totalDays: 3,
          subtotal: 225,
          cleaningFee: 25,
          shippingFee: 15,
          securityDeposit: 200,
          total: 465,
        },
        shipping: {
          method: 'shipping',
          address: {
            street: '123 Main St',
            city: 'Toronto',
            province: 'Ontario',
            postalCode: 'M5V 2T6',
          },
        },
        item: {
          title: 'Sample Traditional Dress',
          images: [{ url: 'https://picsum.photos/800/1200', isPrimary: true }],
        },
        messages: [
          {
            id: '1',
            senderId: '789',
            content: 'Your booking is confirmed!',
            timestamp: new Date('2025-04-24T15:30:00'),
          },
        ],
        createdAt: new Date('2025-04-24T15:00:00'),
        updatedAt: new Date('2025-04-24T15:30:00'),
      };

      setCurrentBooking(mockBooking);
      return mockBooking;
    } catch (err) {
      setError(err.message || 'Failed to fetch booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookingStatus = useCallback(async (bookingId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus, updatedAt: new Date() }
            : booking
        )
      );

      if (currentBooking?.id === bookingId) {
        setCurrentBooking(prev => ({
          ...prev,
          status: newStatus,
          updatedAt: new Date(),
        }));
      }

      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to update booking status');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentBooking]);

  const sendMessage = useCallback(async (bookingId, message) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        content: message,
        timestamp: new Date(),
        senderId: 'current-user-id', // TODO: Get from auth context
      };

      if (currentBooking?.id === bookingId) {
        setCurrentBooking(prev => ({
          ...prev,
          messages: [...(prev.messages || []), newMessage],
        }));
      }

      return { success: true, message: newMessage };
    } catch (err) {
      setError(err.message || 'Failed to send message');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentBooking]);

  const fetchUserBookings = useCallback(async (userId, role = 'renter') => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock bookings data
      const mockBookings = [
        {
          id: '1',
          itemId: '123',
          renterId: userId,
          lenderId: '789',
          status: 'confirmed',
          dates: {
            start: new Date('2025-05-01'),
            end: new Date('2025-05-03'),
          },
          item: {
            title: 'Sample Traditional Dress',
            images: [{ url: 'https://picsum.photos/800/1200', isPrimary: true }],
          },
          createdAt: new Date('2025-04-24T15:00:00'),
        },
        // Add more mock bookings as needed
      ];

      setBookings(mockBookings);
      return mockBookings;
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    currentBooking,
    bookings,
    loading,
    error,
    createBooking,
    fetchBooking,
    updateBookingStatus,
    sendMessage,
    fetchUserBookings,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
