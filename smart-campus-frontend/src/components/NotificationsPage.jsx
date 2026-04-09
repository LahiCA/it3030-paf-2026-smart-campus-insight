import React, { useState } from 'react';
import { FaArrowLeft, FaCheckDouble } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { NOTIFICATION_TYPES } from '../utils/constants';

/**
 * NotificationsPage Component
 * 
 * Full-page view of all notifications
 * Shows notification list with filtering and bulk actions
 * 
 * Features:
 * - Display all notifications with pagination/scroll
 * - Filter by read/unread status
 * - Filter by notification type
 * - Mark all as read button
 * - Delete notification button (per item)
 * - Back to dashboard button
 * - Empty state message when no notifications
 */

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllAsRead, loading, error } = useNotifications();

  // Filter states
  const [filterStatus, setFilterStatus] = useState('all'); // all, read, unread
  const [filterType, setFilterType] = useState('all'); // all, or notification type
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest

  /**
   * Filter and sort notifications
   */
  const filteredNotifications = React.useMemo(() => {
    let filtered = [...notifications];

    // Filter by status
    if (filterStatus === 'read') {
      filtered = filtered.filter(n => n.read);
    } else if (filterStatus === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Sort
    if (sortOrder === 'oldest') {
      filtered.reverse();
    }

    return filtered;
  }, [notifications, filterStatus, filterType, sortOrder]);

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = async () => {
    if (window.confirm('Mark all notifications as read?')) {
      const result = await markAllAsRead();
      if (!result.success) {
        alert(result.message || 'Failed to mark all as read');
      }
    }
  };

  /**
   * Handle notification item click
   */
  const handleNotificationClick = (notification) => {
    // Could navigate to related page
    // if (notification.relatedEntityType === 'BOOKING') {
    //   navigate(`/bookings/${notification.relatedEntityId}`);
    // }
  };

  /**
   * Count notifications by status
   */
  const readCount = notifications.filter(n => n.read).length;
  const unreadCountCalc = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            aria-label="Back"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">Notifications</h1>
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="text-red-500">{unreadCountCalc} unread</span>
            <span className="text-gray-300">•</span>
            <span className="text-green-600">{readCount} read</span>
          </div>
        </div>
        {unreadCount > 0 && (
          <div className="flex">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <FaCheckDouble size={14} />
              Mark All as Read
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All ({notifications.length})</option>
            <option value="unread">Unread ({unreadCountCalc})</option>
            <option value="read">Read ({readCount})</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Types</option>
            {Object.values(NOTIFICATION_TYPES).map(type => (
              <option key={type} value={type}>{formatTypeName(type)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sort:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm">Loading notifications…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">⚠️</span>
            <p className="text-red-500 text-sm font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
            <span className="text-6xl">📭</span>
            <h2 className="text-lg font-semibold text-gray-600">No notifications</h2>
            <p className="text-sm text-center max-w-sm text-gray-400">
              {notifications.length === 0
                ? "You don't have any notifications yet. You'll see them here when activities happen."
                : 'No notifications match your filters. Try adjusting them.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredNotifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onItemClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="px-6 pb-6 text-xs text-gray-400 text-center">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
      )}
    </div>
  );
};

/**
 * Format notification type from enum to readable name
 */
function formatTypeName(type) {
  return type
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export default NotificationsPage;
