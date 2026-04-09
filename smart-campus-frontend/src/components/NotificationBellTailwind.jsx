import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';

const NotificationBellTailwind = () => {
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const recentNotifications = notifications.slice(0, 5);

  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async (event, notificationId) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
  };

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
    <div className="relative font-['Poppins',sans-serif]" ref={dropdownRef}>
      <button
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 active:scale-95"
        onClick={handleBellClick}
        aria-label="Notifications"
        aria-expanded={isDropdownOpen}
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
      >
        <FaBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 min-w-[22px] animate-pulse rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[11px] font-bold text-white shadow-md">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="animate-[slideDown_0.3s_ease-out] absolute right-0 top-full z-[1000] mt-2 w-[90vw] min-w-[300px] max-w-[400px] overflow-hidden rounded-lg bg-white shadow-2xl sm:min-w-[350px]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-4">
            <h3 className="text-base font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-1 text-[11px] font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="scrollbar-ui max-h-[300px] overflow-y-auto sm:max-h-[400px]">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex cursor-pointer items-start gap-3 border-b border-slate-100 px-4 py-3 transition last:border-b-0 ${notification.read
                      ? 'bg-white hover:bg-slate-50'
                      : 'border-l-[3px] border-l-blue-500 bg-blue-50/60 pl-[13px] hover:bg-blue-50'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {!notification.read && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500"></div>}

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-xs leading-5 text-slate-800 sm:text-[13px]">
                      {notification.message}
                    </p>
                    <span className="mt-1 block text-xs text-slate-400">
                      {formatTime(new Date(notification.createdAt))}
                    </span>
                  </div>

                  <button
                    className="ml-2 shrink-0 bg-transparent p-0 text-base text-slate-400 transition hover:text-red-600"
                    onClick={(event) => handleDelete(event, notification.id)}
                    aria-label="Delete notification"
                    title="Delete"
                  >
                    x
                  </button>
                </div>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          {recentNotifications.length > 0 && (
            <a
              href="/notifications"
              className="block border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-blue-700 transition hover:bg-slate-100 hover:underline"
            >
              View all notifications -
            </a>
          )}
        </div>
      )}
    </div>
  );
};

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

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default NotificationBellTailwind;
