import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaCog, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

/**
 * Navbar Component
 * 
 * Top navigation bar with:
 * - Smart Campus logo/title
 * - NotificationBell component
 * - User profile dropdown menu
 * - Responsive design
 * 
 * Features:
 * - Logo/branding on left
 * - Notification bell in middle
 * - User dropdown menu on right
 * - Shows user email and role
 * - Logout button
 * - Profile/settings navigation
 * - Auto-hide dropdown on click outside
 */

const Navbar = () => {
  const navigate = useNavigate();
  const { user, handleLogout, isAdmin, isTechnician } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /**
   * Handle user dropdown toggle
   */
  const handleUserDropdownToggle = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  /**
   * Handle logout
   */
  const handleLogoutClick = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await handleLogout();
      navigate('/login', { replace: true });
    }
  };

  /**
   * Handle profile click
   */
  const handleProfileClick = () => {
    navigate('/profile');
    setIsUserDropdownOpen(false);
  };

  /**
   * Handle admin panel click
   */
  const handleAdminClick = () => {
    navigate('/admin');
    setIsUserDropdownOpen(false);
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      {/* Left section - Logo/Brand */}
      <div className="navbar-left">
        <button
          className="navbar-brand"
          onClick={() => navigate('/dashboard')}
          title="Go to Dashboard"
        >
          <span className="brand-icon">🏛️</span>
          <span className="brand-text">Smart Campus</span>
        </button>
      </div>

      {/* Middle section - Notification Bell */}
      <div className="navbar-middle">
        <NotificationBell />
      </div>

      {/* Right section - User Menu */}
      <div className="navbar-right" ref={dropdownRef}>
        <div className="user-menu">
          {/* User button */}
          <button
            className="user-button"
            onClick={handleUserDropdownToggle}
            aria-expanded={isUserDropdownOpen}
            title={user?.email || 'User'}
          >
            <div className="user-avatar">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <span className="user-info">
              <span className="user-name">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="user-role">
                {formatRole(user?.role || 'USER')}
              </span>
            </span>
            <FaChevronDown
              size={12}
              className={`dropdown-icon ${isUserDropdownOpen ? 'open' : ''}`}
            />
          </button>

          {/* User dropdown menu */}
          {isUserDropdownOpen && (
            <div className="user-dropdown">
              {/* User info */}
              <div className="dropdown-header">
                <div className="user-email">
                  {user?.email || 'No email'}
                </div>
              </div>

              {/* Menu items */}
              <div className="dropdown-menu">
                {/* Profile */}
                <button
                  className="dropdown-item"
                  onClick={handleProfileClick}
                >
                  <FaUser size={16} />
                  <span>My Profile</span>
                </button>

                {/* Admin panel (if admin or technician) */}
                {(isAdmin() || isTechnician()) && (
                  <button
                    className="dropdown-item admin-item"
                    onClick={handleAdminClick}
                  >
                    <FaCog size={16} />
                    <span>
                      {isAdmin() ? 'Admin Panel' : 'Technician Panel'}
                    </span>
                  </button>
                )}

                {/* Divider */}
                <div className="dropdown-divider"></div>

                {/* Logout */}
                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogoutClick}
                >
                  <FaSignOutAlt size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

/**
 * Format role name
 * USER -> User
 * ADMIN -> Administrator
 */
function formatRole(role) {
  const roleNames = {
    'USER': 'User',
    'ADMIN': 'Administrator',
    'TECHNICIAN': 'Technician',
    'MANAGER': 'Manager'
  };

  return roleNames[role] || role;
}

export default Navbar;
