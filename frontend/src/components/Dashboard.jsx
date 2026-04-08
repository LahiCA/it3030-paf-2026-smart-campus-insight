import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaTicketAlt,
  FaBell,
  FaUsers,
  FaArrowRight,
  FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './Dashboard.css';

/**
 * Dashboard Component
 * 
 * Main application home page
 * Shows welcome message, quick stats, and action cards
 * 
 * Features:
 * - Personalized welcome greeting
 * - Quick stats (unread notifications count)
 * - Quick action cards (navigate to modules)
 * - Visual card-based layout
 * - Role-based content visibility
 * - Responsive design
 */

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isTechnician, isManager } = useAuth();
  const { unreadCount } = useNotifications();

  /**
   * Get user's display name
   */
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email?.split('@')[0] || 'User';

  /**
   * Format role for display
   */
  const roleDisplay = formatRole(user?.role || 'USER');

  /**
   * Get greeting based on time of day
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard">
      {/* Welcome section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <h1>
            <span className="greeting">{getGreeting()},</span>{displayName}! 👋
          </h1>
          <p className="welcome-message">
            Welcome to Smart Campus Operations Hub. Manage facilities, bookings, and support tickets efficiently.
          </p>
          <p className="role-badge">
            Role: <strong>{roleDisplay}</strong>
          </p>
        </div>

        {/* Welcome visualization */}
        <div className="welcome-icon">
          🏛️
        </div>
      </section>

      {/* Quick stats section */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon unread">
            <FaBell size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Unread Notifications</p>
            <p className="stat-value">{unreadCount}</p>
          </div>
          <button
            className="stat-action"
            onClick={() => navigate('/notifications')}
            title="View all notifications"
          >
            <FaArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Quick actions section */}
      <section className="actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {/* Bookings card */}
          <div className="action-card bookings-card">
            <div className="card-icon">
              <FaCalendarCheck size={32} />
            </div>
            <div className="card-content">
              <h3>Bookings</h3>
              <p>View and manage facility bookings</p>
            </div>
            <button
              className="card-button"
              onClick={() => navigate('/bookings')}
              title="Go to Bookings"
            >
              <FaArrowRight />
            </button>
          </div>

          {/* Tickets card */}
          <div className="action-card tickets-card">
            <div className="card-icon">
              <FaTicketAlt size={32} />
            </div>
            <div className="card-content">
              <h3>Support Tickets</h3>
              <p>Create and track support requests</p>
            </div>
            <button
              className="card-button"
              onClick={() => navigate('/tickets')}
              title="Go to Tickets"
            >
              <FaArrowRight />
            </button>
          </div>

          {/* Notifications card */}
          <div className="action-card notifications-card">
            <div className="card-icon">
              <FaBell size={32} />
            </div>
            <div className="card-content">
              <h3>Notifications</h3>
              <p>View all notifications and updates</p>
            </div>
            <button
              className="card-button"
              onClick={() => navigate('/notifications')}
              title="Go to Notifications"
            >
              <FaArrowRight />
            </button>
          </div>

          {/* Admin card - only for admins */}
          {isAdmin() && (
            <div className="action-card admin-card">
              <div className="card-icon">
                <FaUsers size={32} />
              </div>
              <div className="card-content">
                <h3>User Management</h3>
                <p>Manage users and roles</p>
              </div>
              <button
                className="card-button"
                onClick={() => navigate('/admin/users')}
                title="Go to Admin Panel"
              >
                <FaArrowRight />
              </button>
            </div>
          )}

          {/* Technician card - only for technicians */}
          {isTechnician() && (
            <div className="action-card tech-card">
              <div className="card-icon">
                <FaChartLine size={32} />
              </div>
              <div className="card-content">
                <h3>Maintenance</h3>
                <p>View maintenance requests</p>
              </div>
              <button
                className="card-button"
                onClick={() => navigate('/maintenance')}
                title="Go to Maintenance"
              >
                <FaArrowRight />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Info section */}
      <section className="info-section">
        <div className="info-card">
          <h3>📚 Getting Started</h3>
          <ul>
            <li>Check your <strong>notifications</strong> for updates on bookings and tickets</li>
            <li>Navigate to <strong>Bookings</strong> to reserve facilities</li>
            <li>Use <strong>Support Tickets</strong> to report issues and track resolutions</li>
            <li>Visit your <strong>Profile</strong> to manage account settings</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>💡 Tips</h3>
          <ul>
            <li>Enable notifications to stay updated with important events</li>
            <li>Check notification bell regularly for new messages</li>
            <li>Use filters in Notifications page to find specific updates</li>
            <li>Mark notifications as read to keep your inbox organized</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

/**
 * Format role name
 */
function formatRole(role) {
  const roleNames = {
    'USER': 'Regular User',
    'ADMIN': 'Administrator',
    'TECHNICIAN': 'Technician',
    'MANAGER': 'Manager'
  };

  return roleNames[role] || role;
}

export default Dashboard;
