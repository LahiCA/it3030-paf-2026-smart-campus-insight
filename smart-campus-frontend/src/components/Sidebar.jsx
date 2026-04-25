import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaThLarge,
  FaCalendarAlt,
  FaTicketAlt,
  FaBell,
  FaBullhorn,
  FaUsers,
  FaSignOutAlt,
  FaGraduationCap,
  FaBuilding,
  FaChartBar,
  FaFileExport,
  FaUserEdit,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { saveUser } from '../services/storage';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, setUser, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
  });
  const [profileError, setProfileError] = useState('');

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email?.split('@')[0] || 'User';

  const roleDisplay = user?.role || 'USER';

  useEffect(() => {
    if (!user) {
      return;
    }

    const fallbackParts = (user?.name || '').trim().split(/\s+/);
    const fallbackFirstName = fallbackParts[0] || user?.email?.split('@')[0] || '';
    const fallbackLastName = fallbackParts.length > 1 ? fallbackParts.slice(1).join(' ') : '';

    setProfileForm({
      firstName: user?.firstName || fallbackFirstName,
      lastName: user?.lastName || fallbackLastName,
    });
  }, [user]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login', { replace: true });
    }
  };

  const handleOpenProfile = () => {
    setProfileError('');
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileError('');
    setIsProfileOpen(false);
  };

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = (event) => {
    event.preventDefault();

    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();

    if (!firstName) {
      setProfileError('First name is required.');
      return;
    }

    const updatedUser = {
      ...user,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
    };

    setUser(updatedUser);
    saveUser(updatedUser);
    handleCloseProfile();
  };

  const getDashboardPath = () => {
    const role = user?.role;
    if (role === 'ADMIN') return '/admin-dashboard';
    if (role === 'LECTURER') return '/lecturer-dashboard';
    if (role === 'TECHNICIAN') return '/technician-dashboard';
    return '/dashboard';
  };

  const menuItems = [
    { path: getDashboardPath(), icon: FaThLarge, label: 'Dashboard' },
    { path: '/resources', icon: FaBuilding, label: 'Resources' },
    { path: '/bw-create-booking', icon: FaCalendarAlt, label: 'Bookings' },
    { path: '/tickets', icon: FaTicketAlt, label: 'Tickets' },
    { path: '/notifications', icon: FaBell, label: 'Notifications' },
  ];

  if (isAdmin()) {
    menuItems.push({ path: '/admin', icon: FaUsers, label: 'User Management' });
    menuItems.push({ path: '/notifications-management', icon: FaBullhorn, label: 'Notification Manager' });
    menuItems.push({ path: '/analytics', icon: FaChartBar, label: 'Analytics' });
    menuItems.push({ path: '/reports', icon: FaFileExport, label: 'Export Reports' });
  }

  return (
    <aside className="sticky top-0 flex h-screen w-18 min-w-18 flex-col border-r border-slate-100 bg-white font-['Poppins',sans-serif] md:w-65 md:min-w-65">
      <div className="flex justify-center gap-3 border-b border-slate-100 px-3 py-5 md:justify-start md:px-5 md:pb-5 md:pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-linear-to-br from-teal-500 to-teal-800 text-xl text-white">
          <FaGraduationCap />
        </div>
        <div className="hidden flex-col md:flex">
          <span className="text-base font-bold leading-tight text-slate-800">SmartCampus</span>
          <span className="text-[11px] font-medium uppercase tracking-[1px] text-slate-400">Management</span>
        </div>
      </div>

      <nav className="scrollbar-ui flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 hidden px-2 text-[11px] font-semibold uppercase tracking-[1px] text-slate-400 md:block">Menu</p>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex w-full items-center justify-center gap-3 rounded-[10px] px-3 py-3 text-[15px] font-medium transition md:justify-start md:px-4 ${isActive
                    ? 'bg-teal-50 font-semibold text-teal-500'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`
                }
              >
                {/* Bell icon with red dot for Notifications item */}
                <span className="relative flex w-5 shrink-0 items-center justify-center text-lg">
                  <item.icon />
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    </span>
                  )}
                </span>
                <span className="hidden items-center gap-2 md:flex">
                  {item.label}
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-tight text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center justify-center gap-3 md:justify-start">
          <button
            type="button"
            onClick={handleOpenProfile}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1.5 py-1.5 text-left transition hover:bg-slate-50"
            title="Open profile management"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-teal-800 text-sm font-semibold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden min-w-0 flex-1 md:block">
              <div className="truncate whitespace-nowrap text-sm font-semibold text-slate-800 group-hover:text-teal-700">{displayName}</div>
              <div className="text-xs font-medium text-teal-500">{roleDisplay}</div>
            </div>
          </button>
          <button className="flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-500" onClick={handleLogout} title="Logout">
            <FaSignOutAlt size={16} />
          </button>
        </div>
      </div>

      {isProfileOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2 text-slate-800">
                <FaUserEdit className="text-teal-600" />
                <h2 className="text-lg font-bold">Profile Management</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseProfile}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                title="Close"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileFieldChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileFieldChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
                  <input
                    value={user?.role || 'USER'}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">User ID</label>
                  <input
                    value={user?.displayId || '-'}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  />
                </div>
              </div>

              {profileError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                  {profileError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleCloseProfile}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
