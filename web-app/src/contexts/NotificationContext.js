import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('notification');
    };
  }, [socket]);

  const sendNotification = useCallback(async ({
    userId,
    type,
    title,
    message,
    data = {},
    email = false,
    push = false,
    sms = false
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const notification = {
        id: 'not_' + Math.random().toString(36).substr(2, 9),
        userId,
        type,
        title,
        message,
        data,
        createdAt: new Date(),
        read: false
      };

      setNotifications((prev) => [notification, ...prev]);
      return { success: true, notification };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getNotifications = useCallback(async ({
    userId,
    page = 1,
    limit = 10,
    unreadOnly = false
  }) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockNotifications = [
        {
          id: 'not_1',
          userId: 'user_1',
          type: 'dispute',
          title: 'New Dispute Resolution',
          message: 'Your dispute has been resolved',
          data: { disputeId: 'dsp_1' },
          createdAt: new Date(),
          read: false
        }
      ];

      return {
        success: true,
        notifications: mockNotifications,
        total: 25,
        unreadCount: 10
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
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

  const markAllAsRead = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNotificationPreferences = useCallback(async ({
    userId,
    preferences
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
    notifications,
    loading,
    error,
    sendNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    updateNotificationPreferences
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
