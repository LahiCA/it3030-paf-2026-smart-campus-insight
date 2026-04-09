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
 * Uses the bulk endpoint
 * 
 * @returns {Promise<object>} Results
 */
export const markAllAsRead = async () => {
  try {
    await axiosInstance.post('/notifications/mark-all-read');

    return {
      success: true,
      message: 'All notifications marked as read'
    };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return {
      success: false,
      message: 'Failed to mark all as read'
    };
  }
};

// ====================== Admin Notification Management ======================

export const adminGetAllNotifications = async () => {
  try {
    const response = await axiosInstance.get('/notifications/admin');
    return { success: true, notifications: Array.isArray(response.data) ? response.data : [] };
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return { success: false, notifications: [], message: error.response?.data?.message || 'Failed to fetch notifications' };
  }
};

export const adminCreateNotification = async ({ message, type, targetAudience }) => {
  try {
    const response = await axiosInstance.post('/notifications/admin', { message, type, targetAudience });
    return { success: true, notification: response.data };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to create notification' };
  }
};

export const adminUpdateNotification = async (id, { message, type, targetAudience }) => {
  try {
    const response = await axiosInstance.put(`/notifications/admin/${id}`, { message, type, targetAudience });
    return { success: true, notification: response.data };
  } catch (error) {
    console.error('Error updating notification:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update notification' };
  }
};

export const adminDeleteNotification = async (id) => {
  try {
    await axiosInstance.delete(`/notifications/admin/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to delete notification' };
  }
};

/**
 * Send a notification to a specific user (ADMIN only)
 * Uses POST /api/notifications
 */
export const adminSendToUser = async ({ userId, message, type }) => {
  try {
    const response = await axiosInstance.post('/notifications', { userId, message, type });
    return { success: true, notification: response.data };
  } catch (error) {
    console.error('Error sending notification to user:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to send notification' };
  }
};
