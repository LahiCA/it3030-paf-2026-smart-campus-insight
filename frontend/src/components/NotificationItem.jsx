import React from 'react';
import { FaTrash, FaCheckCircle, FaCircle } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';

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

const TYPE_STYLES = {
  BOOKING_APPROVED:  'bg-green-100 text-green-700',
  BOOKING_REJECTED:  'bg-red-100 text-red-700',
  TICKET_CREATED:    'bg-orange-100 text-orange-700',
  TICKET_UPDATED:    'bg-purple-100 text-purple-700',
  COMMENT_ADDED:     'bg-teal-100 text-teal-700',
  BOOKING_COMMENT:   'bg-pink-100 text-pink-700',
  GENERAL:           'bg-gray-100 text-gray-600',
};

const NotificationItem = ({ notification, onItemClick = null }) => {
  const { markAsRead, markAsUnread, deleteNotification } = useNotifications();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isTogglingRead, setIsTogglingRead] = React.useState(false);

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

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteNotification(notification.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    if (!notification.read) markAsRead(notification.id);
    if (onItemClick) onItemClick(notification);
  };

  const typeBadge = TYPE_STYLES[notification.type] || TYPE_STYLES.GENERAL;

  return (
    <div
      onClick={handleClick}
      className={[
        'flex items-start gap-3 px-5 py-4 border-b border-gray-100 last:border-0 transition-colors',
        notification.read
          ? 'bg-white hover:bg-gray-50'
          : 'bg-blue-50 border-l-4 border-l-blue-400 pl-4 hover:bg-blue-100/60',
        onItemClick ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      {/* Status icon */}
      <div className="mt-0.5 w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100">
        {notification.read
          ? <FaCheckCircle className="text-green-500" size={14} />
          : <FaCircle className="text-blue-500" size={11} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug break-words ${notification.read ? 'text-gray-600 font-normal' : 'text-gray-800 font-medium'}`}>
          {notification.message}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${typeBadge}`}>
            {formatTypeName(notification.type)}
          </span>
          <span className="text-xs text-gray-400">{formatTime(new Date(notification.createdAt))}</span>
          {notification.readAt && (
            <span className="text-xs text-gray-300 italic">(read)</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        <button
          onClick={handleToggleRead}
          disabled={isTogglingRead}
          title={notification.read ? 'Mark as unread' : 'Mark as read'}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors disabled:opacity-50
            ${notification.read
              ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              : 'text-blue-500 hover:bg-blue-100'}`}
        >
          {isTogglingRead ? '…' : notification.read ? '✕' : '✓'}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete notification"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {isDeleting ? '…' : <FaTrash size={13} />}
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
