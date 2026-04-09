import React from 'react';
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
  FaBuilding
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email?.split('@')[0] || 'User';

  const roleDisplay = user?.role || 'USER';

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login', { replace: true });
    }
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
    { path: '/bookings', icon: FaCalendarAlt, label: 'Bookings' },
    { path: '/tickets', icon: FaTicketAlt, label: 'Tickets' },
    { path: '/notifications', icon: FaBell, label: 'Notifications' },
  ];

  if (isAdmin()) {
    menuItems.push({ path: '/admin', icon: FaUsers, label: 'User Management' });
    menuItems.push({ path: '/notifications-management', icon: FaBullhorn, label: 'Notification Mgmt' });
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[72px] min-w-[72px] flex-col border-r border-slate-100 bg-white font-['Poppins',sans-serif] md:w-[260px] md:min-w-[260px]">
      <div className="flex justify-center gap-3 border-b border-slate-100 px-3 py-5 md:justify-start md:px-5 md:pb-5 md:pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-teal-500 to-teal-800 text-xl text-white">
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
                <span className="flex w-5 shrink-0 items-center justify-center text-lg"><item.icon /></span>
                <span className="hidden md:inline">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center justify-center gap-3 md:justify-start">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-800 text-sm font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden min-w-0 flex-1 md:block">
            <div className="truncate whitespace-nowrap text-sm font-semibold text-slate-800">{displayName}</div>
            <div className="text-xs font-medium text-teal-500">{roleDisplay}</div>
          </div>
          <button className="flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-500" onClick={handleLogout} title="Logout">
            <FaSignOutAlt size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
