import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  deleteNotification,
  markAllAsRead
} from '../services/notifications';
import { NOTIFICATION_POLL_INTERVAL } from '../utils/constants';
import { useAuth } from './AuthContext';

/**
 * NotificationContext
 * 
 * Manages notifications state globally
 * Provides:
 * - List of notifications
 * - Unread count
 * - Functions to manage notifications
 * - Auto-polling for new notifications
 */

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  /**
   * Fetch all notifications
   */
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const result = await getNotifications(unreadOnly);

      if (result.success) {
        setNotifications(result.notifications || []);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const result = await getUnreadCount();

      if (result.success) {
        setUnreadCount(result.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated]);

  /**
   * Mark notification as read
   */
  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      const result = await markAsRead(notificationId);

      if (result.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        // Update unread count
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return { success: false, message: 'Failed to mark as read' };
    }
  }, []);

  /**
   * Mark notification as unread
   */
  const handleMarkAsUnread = useCallback(async (notificationId) => {
    try {
      const result = await markAsUnread(notificationId);

      if (result.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: false }
              : notification
          )
        );
        // Update unread count
        setUnreadCount(prevCount => prevCount + 1);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('Error marking notification as unread:', err);
      return { success: false, message: 'Failed to mark as unread' };
    }
  }, []);

  /**
   * Delete notification
   */
  const handleDeleteNotification = useCallback(async (notificationId) => {
    try {
      const result = await deleteNotification(notificationId);

      if (result.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.filter(notification => notification.id !== notificationId)
        );
        // Update unread count if it was unread
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      return { success: false, message: 'Failed to delete notification' };
    }
  }, [notifications]);

  /**
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const result = await markAllAsRead(notifications);

      if (result.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({
            ...notification,
            read: true
          }))
        );
        setUnreadCount(0);
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      return { success: false, message: 'Failed to mark all as read' };
    }
  }, [notifications]);

  /**
   * Start polling for new notifications
   */
  const startPolling = useCallback(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Poll every NOTIFICATION_POLL_INTERVAL
    const interval = setInterval(() => {
      fetchUnreadCount(); // Just check count frequently
      // Fetch full list less frequently
      if (Math.random() < 0.3) {
        fetchNotifications();
      }
    }, NOTIFICATION_POLL_INTERVAL);

    setPollingInterval(interval);
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  /**
   * Initialize polling when user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      startPolling();
    } else {
      stopPolling();
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => stopPolling();
  }, [isAuthenticated, startPolling, stopPolling]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead: handleMarkAsRead,
    markAsUnread: handleMarkAsUnread,
    deleteNotification: handleDeleteNotification,
    markAllAsRead: handleMarkAllAsRead,
    startPolling,
    stopPolling
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * useNotifications Hook
 * Use this in components to access notification context
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
