import React, { createContext, useContext, useState, useCallback } from 'react';

const DamageContext = createContext(null);

export const useDamage = () => {
  const context = useContext(DamageContext);
  if (!context) {
    throw new Error('useDamage must be used within a DamageProvider');
  }
  return context;
};

export const DamageProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitDamageReport = useCallback(async ({
    bookingId,
    itemId,
    description,
    damageType,
    images,
    estimatedCost,
    insuranceClaim
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        reportId: 'dmg_' + Math.random().toString(36).substr(2, 9)
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDamageReport = useCallback(async (reportId) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        report: {
          id: reportId,
          bookingId: 'booking_123',
          itemId: 'item_123',
          description: 'Torn seam on left side',
          damageType: 'structural',
          images: ['image1.jpg', 'image2.jpg'],
          estimatedCost: 50,
          insuranceClaim: true,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDamageReport = useCallback(async ({
    reportId,
    status,
    resolution,
    actualCost,
    insuranceClaimStatus
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

  const getDamageReports = useCallback(async ({
    userId,
    itemId,
    status,
    page = 1,
    limit = 10
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockReports = [
        {
          id: 'dmg_1',
          bookingId: 'booking_123',
          itemId: 'item_123',
          description: 'Torn seam on left side',
          damageType: 'structural',
          images: ['image1.jpg', 'image2.jpg'],
          estimatedCost: 50,
          insuranceClaim: true,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return {
        success: true,
        reports: mockReports,
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

  const submitInsuranceClaim = useCallback(async ({
    reportId,
    claimDetails,
    documents
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        claimId: 'clm_' + Math.random().toString(36).substr(2, 9)
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
    submitDamageReport,
    getDamageReport,
    updateDamageReport,
    getDamageReports,
    submitInsuranceClaim
  };

  return (
    <DamageContext.Provider value={value}>
      {children}
    </DamageContext.Provider>
  );
};
