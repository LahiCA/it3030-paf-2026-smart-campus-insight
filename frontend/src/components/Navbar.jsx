import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaCog, FaChevronDown, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBellTailwind';

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
      <nav className="sticky top-0 z-100 flex h-[70px] min-h-[70px] items-center justify-between gap-2 bg-gradient-to-r from-teal-500 to-teal-800 px-3 text-white shadow-md sm:px-5">
        <div className="flex flex-1">
          <button
            className="flex items-center gap-3 rounded-md bg-transparent px-2 py-2 text-lg font-semibold text-white transition hover:bg-white/10"
            onClick={() => navigate('/dashboard')}
            title="Go to Dashboard"
          >
            <span className="flex items-center text-2xl"><FaGraduationCap size={24} /></span>
            <span className="hidden md:inline">Smart Campus</span>
          </button>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4" ref={dropdownRef}>
          <NotificationBell />
          <div className="relative">
            <button
              className="flex max-w-[280px] items-center gap-3 rounded-lg bg-white/15 px-2 py-2 text-white transition hover:bg-white/25 md:px-4"
              onClick={handleUserDropdownToggle}
              aria-expanded={isUserDropdownOpen}
              title={user?.email || 'User'}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/30 text-sm font-semibold md:h-9 md:w-9 md:text-base">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <span className="hidden min-w-0 flex-col items-start gap-0.5 md:flex">
                <span className="truncate whitespace-nowrap text-sm font-medium">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-xs opacity-90">
                  {formatRole(user?.role || 'USER')}
                </span>
              </span>
              <FaChevronDown
                size={12}
                className={`ml-2 shrink-0 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isUserDropdownOpen && (
              <div className="animate-[slideDown_0.3s_ease-out] absolute right-0 top-full z-[1000] mt-2 min-w-[220px] overflow-hidden rounded-lg bg-white text-slate-800 shadow-2xl">
                <div className="border-b border-slate-200 px-4 py-3">
                  <div className="break-all text-[13px] text-slate-400">{user?.email || 'No email'}</div>
                </div>
                <div className="py-2">
                  <button className="flex w-full items-center gap-3 bg-transparent px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100" onClick={handleProfileClick}>
                    <FaUser size={16} className="text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  {(isAdmin() || isTechnician()) && (
                    <button className="flex w-full items-center gap-3 bg-transparent px-4 py-3 text-left text-sm text-blue-700 transition hover:bg-slate-100" onClick={handleAdminClick}>
                      <FaCog size={16} className="text-blue-700" />
                      <span>{isAdmin() ? 'Admin Panel' : 'Technician Panel'}</span>
                    </button>
                  )}

                  <button className="flex w-full items-center gap-3 bg-transparent px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100" onClick={() => { navigate('/settings'); setIsUserDropdownOpen(false); }}>
                    <FaCog size={16} className="text-slate-400" />
                    <span>Notification Settings</span>
                  </button>

                  <div className="my-2 h-px bg-slate-200"></div>

                  <button className="flex w-full items-center gap-3 bg-transparent px-4 py-3 text-left text-sm text-red-700 transition hover:bg-red-50" onClick={handleLogoutClick}>
                    <FaSignOutAlt size={16} className="text-red-700" />
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
