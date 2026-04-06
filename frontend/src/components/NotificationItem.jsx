import React from 'react';
import { FaTrash, FaCheckCircle, FaCircle } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';
import './NotificationItem.css';

/**
 * NotificationItem Component
 * 
 * Displays a single notification in the notifications list
 * Shows message, timestamp, type badge, and action buttons
 * 
 * Props:
 * - notification: Notification object {id, message, type, read, createdAt, readAt, relatedEntityId, relatedEntityType}
 * 
 * Features:
 * - Shows unread/read status with visual indicator
 * - Type badge with different colors
 * - Timestamp formatted as relative time
 * - Mark as read/unread toggle button
 * - Delete button
 * - Optional click handler (could navigate to related entity)
 */

const NotificationItem = ({ notification, onItemClick = null }) => {
  const { markAsRead, markAsUnread, deleteNotification } = useNotifications();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isTogglingRead, setIsTogglingRead] = React.useState(false);

  /**
   * Handle mark as read/unread toggle
   */
  const handleToggleRead = async (e) => {
    e.stopPropagation();
    setIsTogglingRead(true);

    try {
      if (notification.read) {
        await markAsUnread(notification.id);
      } else {
        await markAsRead(notification.id);
      }
    } finally {
      setIsTogglingRead(false);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);

    try {
      await deleteNotification(notification.id);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle item click
   */
  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (onItemClick) {
      onItemClick(notification);
    }
  };

  return (
    <div
      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
      onClick={handleClick}
      style={{ cursor: onItemClick ? 'pointer' : 'default' }}
    >
      {/* Status indicator */}
      <div className="item-status">
        {notification.read ? (
          <FaCheckCircle className="icon-read" title="Read" />
        ) : (
          <FaCircle className="icon-unread" title="Unread" />
        )}
      </div>

      {/* Content */}
      <div className="item-content">
        {/* Message */}
        <p className="item-message">
          {notification.message}
        </p>

        {/* Metadata */}
        <div className="item-metadata">
          {/* Type badge */}
          <span className={`type-badge type-${notification.type.toLowerCase()}`}>
            {formatTypeName(notification.type)}
          </span>

          {/* Timestamp */}
          <span className="item-time">
            {formatTime(new Date(notification.createdAt))}
          </span>

          {notification.readAt && (
            <span className="read-time" title={`Read at ${new Date(notification.readAt).toLocaleString()}`}>
              (read)
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="item-actions">
        {/* Mark as read/unread button */}
        <button
          className="action-btn toggle-read-btn"
          onClick={handleToggleRead}
          disabled={isTogglingRead}
          title={notification.read ? 'Mark as unread' : 'Mark as read'}
          aria-label={notification.read ? 'Mark as unread' : 'Mark as read'}
        >
          {isTogglingRead ? '...' : notification.read ? '✕' : '✓'}
        </button>

        {/* Delete button */}
        <button
          className="action-btn delete-btn"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete notification"
          aria-label="Delete notification"
        >
          {isDeleting ? '...' : <FaTrash size={16} />}
        </button>
      </div>
    </div>
  );
};

/**
 * Format notification type from enum to readable name
 * BOOKING_APPROVED -> Booking Approved
 */
function formatTypeName(type) {
  return type
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format time as relative string
 * Shows "just now", "5 minutes ago", "2 hours ago", etc.
 */
function formatTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

export default NotificationItem;
