import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../../../frontend/src/context/NotificationContext';
import './NotificationBell.css';

/**
 * NotificationBell Component
 * 
 * Displays notification bell icon with unread count badge
 * Shows dropdown menu with recent notifications (up to 5)
 * Clicking on notification item marks it as read
 * 
 * Features:
 * - Shows unread badge if count > 0
 * - Dropdown on bell click
 * - Marks as read on click
 * - Delete notification button
 * - "View All" link to NotificationsPage
 * - Auto-hide on click outside
 */

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /**
   * Get 5 most recent notifications
   */
  const recentNotifications = notifications.slice(0, 5);

  /**
   * Handle bell click to toggle dropdown
   */
  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  /**
   * Handle clicking on a notification
   */
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // Could navigate to related page here
    // navigate(`/booking/${notification.relatedEntityId}`);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="notification-bell" ref={dropdownRef}>
      {/* Bell button */}
      <button
        className="bell-button"
        onClick={handleBellClick}
        aria-label="Notifications"
        aria-expanded={isDropdownOpen}
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
      >
        <FaBell size={24} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-label">{unreadCount} new</span>
            )}
          </div>

          {/* Notifications list */}
          <div className="notifications-list">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Unread indicator */}
                  {!notification.read && <div className="unread-indicator"></div>}

                  {/* Content */}
                  <div className="notification-content">
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <span className="notification-time">
                      {formatTime(new Date(notification.createdAt))}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDelete(e, notification.id)}
                    aria-label="Delete notification"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer with link to all notifications */}
          {recentNotifications.length > 0 && (
            <a href="/notifications" className="view-all-link">
              View all notifications →
            </a>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Format notification time
 * Shows relative time (e.g., "2 minutes ago")
 */
function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default NotificationBell;
