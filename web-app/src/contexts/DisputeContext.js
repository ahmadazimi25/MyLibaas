import React, { createContext, useContext, useState, useCallback } from 'react';

const DisputeContext = createContext(null);

export const useDispute = () => {
  const context = useContext(DisputeContext);
  if (!context) {
    throw new Error('useDispute must be used within a DisputeProvider');
  }
  return context;
};

export const DisputeProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDispute = useCallback(async ({
    bookingId,
    type,
    description,
    evidence,
    desiredOutcome
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        disputeId: 'dsp_' + Math.random().toString(36).substr(2, 9)
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDispute = useCallback(async (disputeId) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        dispute: {
          id: disputeId,
          bookingId: 'booking_123',
          type: 'item_condition',
          description: 'Item received was not as described',
          evidence: ['image1.jpg', 'image2.jpg'],
          desiredOutcome: 'refund',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [
            {
              id: 'msg_1',
              sender: 'renter',
              content: 'The item I received was damaged',
              createdAt: new Date()
            }
          ]
        }
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDispute = useCallback(async ({
    disputeId,
    status,
    resolution,
    adminNotes
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

  const getDisputes = useCallback(async ({
    userId,
    status,
    page = 1,
    limit = 10
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockDisputes = [
        {
          id: 'dsp_1',
          bookingId: 'booking_123',
          type: 'item_condition',
          description: 'Item received was not as described',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return {
        success: true,
        disputes: mockDisputes,
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

  const addDisputeMessage = useCallback(async ({
    disputeId,
    content,
    attachments = []
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: {
          id: 'msg_' + Math.random().toString(36).substr(2, 9),
          content,
          attachments,
          createdAt: new Date()
        }
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const proposeResolution = useCallback(async ({
    disputeId,
    resolution,
    compensation
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

  const acceptResolution = useCallback(async (disputeId) => {
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

  const escalateDispute = useCallback(async ({
    disputeId,
    reason,
    additionalEvidence = []
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

  const value = {
    loading,
    error,
    createDispute,
    getDispute,
    updateDispute,
    getDisputes,
    addDisputeMessage,
    proposeResolution,
    acceptResolution,
    escalateDispute
  };

  return (
    <DisputeContext.Provider value={value}>
      {children}
    </DisputeContext.Provider>
  );
};
