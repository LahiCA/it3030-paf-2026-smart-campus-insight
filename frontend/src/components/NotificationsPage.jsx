import React, { useState } from 'react';
import { FaArrowLeft, FaCheckDouble, FaFilter, FatRedX } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { NOTIFICATION_TYPES } from '../utils/constants';
import './NotificationsPage.css';

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
    <div className="notifications-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <button
            className="back-button"
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
            aria-label="Back"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1>Notifications</h1>
          <div className="header-stats">
            <span className="stat unread">
              {unreadCountCalc} unread
            </span>
            <span className="stat divider">•</span>
            <span className="stat read">
              {readCount} read
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="header-actions">
          {unreadCount > 0 && (
            <button
              className="action-button mark-all"
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              <FaCheckDouble size={16} />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="page-controls">
        {/* Status filter */}
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All ({notifications.length})</option>
            <option value="unread">Unread ({unreadCountCalc})</option>
            <option value="read">Read ({readCount})</option>
          </select>
        </div>

        {/* Type filter */}
        <div className="filter-group">
          <label htmlFor="type-filter">Type:</label>
          <select
            id="type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {Object.values(NOTIFICATION_TYPES).map(type => (
              <option key={type} value={type}>
                {formatTypeName(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort order */}
        <div className="filter-group">
          <label htmlFor="sort-filter">Sort:</label>
          <select
            id="sort-filter"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="page-content">
        {/* Loading state */}
        {loading && (
          <div className="state-message loading-state">
            <span className="spinner">⏳</span>
            <p>Loading notifications...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="state-message error-state">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="state-message empty-state">
            <span className="empty-icon">📭</span>
            <h2>No notifications</h2>
            <p>
              {notifications.length === 0
                ? 'You don\'t have any notifications yet. You\'ll see them here when activities happen.'
                : 'No notifications match your filters. Try adjusting them.'}
            </p>
          </div>
        )}

        {/* Notifications list */}
        {!loading && !error && filteredNotifications.length > 0 && (
          <div className="notifications-list">
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

      {/* Footer info */}
      {filteredNotifications.length > 0 && (
        <div className="page-footer">
          <p>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </p>
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
