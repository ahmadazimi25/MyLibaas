import React, { createContext, useContext, useState, useCallback } from 'react';

const VerificationContext = createContext(null);

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};

export const VerificationProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitVerification = useCallback(async ({
    userId,
    documentType,
    documentImages,
    selfieImage,
    address
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call to verification service (e.g., Onfido)
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        verificationId: 'ver_' + Math.random().toString(36).substr(2, 9),
        status: 'pending'
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getVerificationStatus = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        status: 'verified', // pending, verified, rejected
        documentStatus: 'verified',
        selfieStatus: 'verified',
        addressStatus: 'verified',
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        rejectionReason: null
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const requestReverification = useCallback(async (userId) => {
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

  // Admin functions
  const reviewVerification = useCallback(async ({
    verificationId,
    action,
    rejectionReason
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

  const getPendingVerifications = useCallback(async ({ page = 1, limit = 10 }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockVerifications = [
        {
          id: 'ver_1',
          userId: 'user_1',
          user: {
            name: 'John Doe',
            email: 'john@example.com'
          },
          documentType: 'drivers_license',
          submittedAt: new Date(),
          status: 'pending'
        }
      ];

      return {
        success: true,
        verifications: mockVerifications,
        total: 25,
        page,
        totalPages: 3
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
    submitVerification,
    getVerificationStatus,
    requestReverification,
    reviewVerification,
    getPendingVerifications
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
};
