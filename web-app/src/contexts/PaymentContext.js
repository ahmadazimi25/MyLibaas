import React, { createContext, useContext, useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'your_publishable_key');

const PaymentContext = createContext(null);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPaymentIntent = useCallback(async ({
    amount,
    currency = 'usd',
    bookingId,
    metadata = {}
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockClientSecret = 'mock_client_secret_' + Math.random().toString(36).substr(2);
      
      return {
        success: true,
        clientSecret: mockClientSecret,
        amount,
        currency,
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const processRefund = useCallback(async ({
    bookingId,
    amount,
    reason
  }) => {
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

  const getPaymentMethods = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPaymentMethods = [
        {
          id: 'pm_1',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025
          },
          isDefault: true
        },
        {
          id: 'pm_2',
          type: 'card',
          card: {
            brand: 'mastercard',
            last4: '8888',
            expMonth: 8,
            expYear: 2024
          },
          isDefault: false
        }
      ];

      return { success: true, paymentMethods: mockPaymentMethods };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const addPaymentMethod = useCallback(async (paymentMethodId) => {
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

  const removePaymentMethod = useCallback(async (paymentMethodId) => {
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

  const setDefaultPaymentMethod = useCallback(async (paymentMethodId) => {
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

  const getTransactionHistory = useCallback(async ({
    userId,
    type, // 'all', 'incoming', 'outgoing'
    page = 1,
    limit = 10
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTransactions = [
        {
          id: 'txn_1',
          type: 'payment',
          amount: 150,
          currency: 'usd',
          status: 'succeeded',
          bookingId: 'booking_1',
          description: 'Rental payment for Traditional Wedding Dress',
          createdAt: new Date('2025-04-15'),
          metadata: {
            itemId: 'item_1',
            renterId: 'user_1',
            lenderId: 'user_2'
          }
        },
        {
          id: 'txn_2',
          type: 'refund',
          amount: 50,
          currency: 'usd',
          status: 'succeeded',
          bookingId: 'booking_2',
          description: 'Partial refund for damaged item',
          createdAt: new Date('2025-04-10'),
          metadata: {
            itemId: 'item_2',
            renterId: 'user_1',
            lenderId: 'user_3'
          }
        }
      ];

      return {
        success: true,
        data: {
          transactions: mockTransactions,
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

  const value = {
    loading,
    error,
    createPaymentIntent,
    processRefund,
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    getTransactionHistory
  };

  return (
    <Elements stripe={stripePromise}>
      <PaymentContext.Provider value={value}>
        {children}
      </PaymentContext.Provider>
    </Elements>
  );
};
