import axiosInstance from '../utils/axios-instance';

/**
 * Notifications Service
 * 
 * Handles all notification-related API calls
 */

/**
 * Get all notifications for current user
 * 
 * @param {boolean} unreadOnly - If true, get only unread notifications
 * @returns {Promise<object>} Notifications list
 */
export const getNotifications = async (unreadOnly = false) => {
  try {
    const url = unreadOnly ? '/notifications?unread=true' : '/notifications';
    const response = await axiosInstance.get(url);
    
    return {
      success: true,
      notifications: Array.isArray(response.data) ? response.data : [],
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      success: false,
      notifications: [],
      message: error.response?.data?.message || 'Failed to fetch notifications'
    };
  }
};

/**
 * Get unread notification count
 * Used for notification bell badge
 * 
 * @returns {Promise<object>} Unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get('/notifications/unread/count');
    
    return {
      success: true,
      count: response.data.unreadCount || 0
    };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return {
      success: false,
      count: 0,
      message: error.response?.data?.message || 'Failed to fetch unread count'
    };
  }
};

/**
 * Mark single notification as read
 * 
 * @param {number} notificationId - The notification ID
 * @returns {Promise<object>} Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.post(`/notifications/${notificationId}/read`);
    
    return {
      success: true,
      notification: response.data
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to mark as read'
    };
  }
};

/**
 * Mark single notification as unread
 * 
 * @param {number} notificationId - The notification ID
 * @returns {Promise<object>} Updated notification
 */
export const markAsUnread = async (notificationId) => {
  try {
    const response = await axiosInstance.put(`/notifications/${notificationId}`, {
      read: false
    });
    
    return {
      success: true,
      notification: response.data
    };
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to mark as unread'
    };
  }
};

/**
 * Delete a notification
 * 
 * @param {number} notificationId - The notification ID
 * @returns {Promise<object>} Success response
 */
export const deleteNotification = async (notificationId) => {
  try {
    await axiosInstance.delete(`/notifications/${notificationId}`);
    
    return {
      success: true,
      message: 'Notification deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete notification'
    };
  }
};

/**
 * Mark all notifications as read
 * Utility function
 * 
 * @param {array} notifications - Array of notification objects
 * @returns {Promise<object>} Results
 */
export const markAllAsRead = async (notifications) => {
  try {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    const promises = unreadNotifications.map(notification =>
      markAsRead(notification.id)
    );
    
    await Promise.all(promises);
    
    return {
      success: true,
      marked: unreadNotifications.length,
      message: `${unreadNotifications.length} notifications marked as read`
    };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return {
      success: false,
      message: 'Failed to mark all as read'
    };
  }
};
