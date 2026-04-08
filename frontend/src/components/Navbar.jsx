import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaCog, FaChevronDown, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isTechnician } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleUserDropdownToggle = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleLogoutClick = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login', { replace: true });
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsUserDropdownOpen(false);
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setIsUserDropdownOpen(false);
  };

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
    <>
      <style>{`
        .nb-bar { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(90deg, #14B8A6 0%, #0f766e 100%); color: white; padding: 0 20px; height: 70px; min-height: 70px; flex-shrink: 0; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box; }
        .nb-left { flex: 1; }
        .nb-brand { display: flex; align-items: center; gap: 12px; background: transparent; border: none; color: white; font-size: 18px; font-weight: 600; cursor: pointer; padding: 8px 12px; border-radius: 6px; transition: background-color 0.3s ease; }
        .nb-brand:hover { background-color: rgba(255,255,255,0.1); }
        .nb-brand-icon { font-size: 24px; display: flex; align-items: center; }
        .nb-brand-text { display: inline; }
        .nb-right { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 16px; }
        .nb-user-wrap { position: relative; }
        .nb-user-btn { display: flex; align-items: center; gap: 12px; background-color: rgba(255,255,255,0.15); color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: background-color 0.3s ease; max-width: 280px; border: none; }
        .nb-user-btn:hover { background-color: rgba(255,255,255,0.25); }
        .nb-avatar { width: 36px; height: 36px; border-radius: 50%; background-color: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px; flex-shrink: 0; }
        .nb-user-info { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
        .nb-user-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nb-user-role { font-size: 12px; opacity: 0.9; }
        .nb-chevron { margin-left: 8px; transition: transform 0.3s ease; flex-shrink: 0; }
        .nb-chevron-open { transform: rotate(180deg); }
        @keyframes nb-slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nb-dropdown { position: absolute; top: 100%; right: 0; background: white; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); min-width: 220px; margin-top: 8px; z-index: 1000; animation: nb-slideDown 0.3s ease-out; overflow: hidden; }
        .nb-dropdown-header { padding: 12px 16px; border-bottom: 1px solid #e0e0e0; }
        .nb-dropdown-email { color: #999; font-size: 13px; word-break: break-all; }
        .nb-dropdown-body { padding: 8px 0; }
        .nb-dropdown-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px; background: transparent; color: #333; text-align: left; border: none; cursor: pointer; transition: background-color 0.2s ease; font-size: 14px; }
        .nb-dropdown-item:hover { background-color: #f5f5f5; }
        .nb-dropdown-item svg { color: #999; }
        .nb-dropdown-item.nb-admin { color: #1565c0; }
        .nb-dropdown-item.nb-admin svg { color: #1565c0; }
        .nb-divider { height: 1px; background-color: #e0e0e0; margin: 8px 0; }
        .nb-dropdown-item.nb-logout { color: #c62828; }
        .nb-dropdown-item.nb-logout svg { color: #c62828; }
        .nb-dropdown-item.nb-logout:hover { background-color: #ffebee; }
        @media (max-width: 768px) {
          .nb-bar { padding: 0 12px; }
          .nb-brand { padding: 6px 8px; }
          .nb-brand-text { display: none; }
          .nb-user-btn { padding: 8px; }
          .nb-user-info { display: none; }
        }
        @media (max-width: 600px) {
          .nb-bar { gap: 8px; }
          .nb-left { flex: none; }
          .nb-right { flex: 1; justify-content: flex-end; }
          .nb-avatar { width: 32px; height: 32px; }
        }
      `}</style>
      <nav className="nb-bar">
        <div className="nb-left">
          <button className="nb-brand" onClick={() => navigate('/dashboard')} title="Go to Dashboard">
            <span className="nb-brand-icon"><FaGraduationCap size={24} /></span>
            <span className="nb-brand-text">Smart Campus</span>
          </button>
        </div>

        <div className="nb-right" ref={dropdownRef}>
          <NotificationBell />
          <div className="nb-user-wrap">
            <button
              className="nb-user-btn"
              onClick={handleUserDropdownToggle}
              aria-expanded={isUserDropdownOpen}
              title={user?.email || 'User'}
            >
              <div className="nb-avatar">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <span className="nb-user-info">
                <span className="nb-user-name">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="nb-user-role">
                  {formatRole(user?.role || 'USER')}
                </span>
              </span>
              <FaChevronDown
                size={12}
                className={`nb-chevron ${isUserDropdownOpen ? 'nb-chevron-open' : ''}`}
              />
            </button>

            {isUserDropdownOpen && (
              <div className="nb-dropdown">
                <div className="nb-dropdown-header">
                  <div className="nb-dropdown-email">{user?.email || 'No email'}</div>
                </div>
                <div className="nb-dropdown-body">
                  <button className="nb-dropdown-item" onClick={handleProfileClick}>
                    <FaUser size={16} />
                    <span>My Profile</span>
                  </button>

                  {(isAdmin() || isTechnician()) && (
                    <button className="nb-dropdown-item nb-admin" onClick={handleAdminClick}>
                      <FaCog size={16} />
                      <span>{isAdmin() ? 'Admin Panel' : 'Technician Panel'}</span>
                    </button>
                  )}

                  <button className="nb-dropdown-item" onClick={() => { navigate('/settings'); setIsUserDropdownOpen(false); }}>
                    <FaCog size={16} />
                    <span>Notification Settings</span>
                  </button>

                  <div className="nb-divider"></div>

                  <button className="nb-dropdown-item nb-logout" onClick={handleLogoutClick}>
                    <FaSignOutAlt size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

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
