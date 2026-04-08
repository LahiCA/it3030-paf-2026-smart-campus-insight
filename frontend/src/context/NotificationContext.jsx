import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
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
 */
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useRef is better than useState for interval IDs
  const pollingIntervalRef = useRef(null);

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
        setError(result.message || 'Failed to fetch notifications');
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
        setUnreadCount(result.count ?? 0);
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
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );

        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
        return { success: true };
      }

      return { success: false, message: result.message };
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
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: false }
              : notification
          )
        );

        setUnreadCount((prevCount) => prevCount + 1);
        return { success: true };
      }

      return { success: false, message: result.message };
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
      const notificationToDelete = notifications.find(
        (n) => n.id === notificationId
      );

      const result = await deleteNotification(notificationId);

      if (result.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification.id !== notificationId
          )
        );

        if (notificationToDelete && !notificationToDelete.read) {
          setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
        }

        return { success: true };
      }

      return { success: false, message: result.message };
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
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            read: true
          }))
        );

        setUnreadCount(0);
        return { success: true, message: result.message };
      }

      return { success: false, message: result.message };
    } catch (err) {
      console.error('Error marking all as read:', err);
      return { success: false, message: 'Failed to mark all as read' };
    }
  }, [notifications]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (!isAuthenticated) return;

    stopPolling();

    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    pollingIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
      fetchNotifications();
    }, NOTIFICATION_POLL_INTERVAL);
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount, stopPolling]);

  /**
   * Initialize when auth changes
   */
  useEffect(() => {
    if (isAuthenticated) {
      startPolling();
    } else {
      stopPolling();
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
    }

    return () => {
      stopPolling();
    };
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

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  return context;
};