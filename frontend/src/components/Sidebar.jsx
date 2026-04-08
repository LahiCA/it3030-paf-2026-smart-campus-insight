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

  const menuItems = [
    { path: '/dashboard', icon: FaThLarge, label: 'Dashboard' },
    { path: '/resources', icon: FaBuilding, label: 'Resources' },
    { path: '/bookings', icon: FaCalendarAlt, label: 'Bookings' },
    { path: '/tickets', icon: FaTicketAlt, label: 'Tickets' },
    { path: '/notifications', icon: FaBell, label: 'Notifications' },
  ];

  if (isAdmin()) {
    menuItems[0] = { path: '/admin-dashboard', icon: FaThLarge, label: 'Dashboard' };
    menuItems.push({ path: '/admin', icon: FaUsers, label: 'User Management' });
    menuItems.push({ path: '/notifications-management', icon: FaBullhorn, label: 'Notification Mgmt' });
  }

  return (
    <>
      <style>{`
        .sb-root { width: 260px; min-width: 260px; height: 100vh; background: #fff; display: flex; flex-direction: column; border-right: 1px solid #f0f0f0; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: sticky; top: 0; }
        .sb-brand { display: flex; align-items: center; gap: 12px; padding: 24px 20px 20px; border-bottom: 1px solid #f0f0f0; }
        .sb-brand-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #14B8A6, #0f766e); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .sb-brand-info { display: flex; flex-direction: column; }
        .sb-brand-name { font-size: 16px; font-weight: 700; color: #1e293b; line-height: 1.2; }
        .sb-brand-sub { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 500; }
        .sb-menu { flex: 1; padding: 20px 12px; overflow-y: auto; }
        .sb-menu-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; padding: 0 8px; margin-bottom: 12px; }
        .sb-nav-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
        .sb-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; color: #64748b; font-size: 15px; font-weight: 500; text-decoration: none; transition: all 0.2s ease; cursor: pointer; border: none; background: none; width: 100%; }
        .sb-nav-item:hover { background: #f8fafc; color: #334155; }
        .sb-nav-item.active { background: #f0fdfa; color: #14B8A6; font-weight: 600; }
        .sb-nav-item.active .sb-nav-icon { color: #14B8A6; }
        .sb-nav-icon { font-size: 18px; width: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sb-footer { padding: 16px; border-top: 1px solid #f0f0f0; }
        .sb-user { display: flex; align-items: center; gap: 12px; width: 100%; }
        .sb-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #14B8A6, #0f766e); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; }
        .sb-user-info { flex: 1; min-width: 0; }
        .sb-user-name { font-size: 14px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sb-user-role { font-size: 12px; color: #14B8A6; font-weight: 500; }
        .sb-logout { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0; }
        .sb-logout:hover { background: #fee2e2; color: #ef4444; }
        @media (max-width: 768px) {
          .sb-root { width: 72px; min-width: 72px; }
          .sb-brand-info, .sb-menu-label, .sb-nav-item span, .sb-user-info { display: none; }
          .sb-brand { justify-content: center; padding: 20px 12px 16px; }
          .sb-nav-item { justify-content: center; padding: 12px; }
          .sb-nav-icon { font-size: 20px; }
          .sb-footer { display: flex; flex-direction: column; align-items: center; gap: 8px; }
          .sb-user { justify-content: center; }
          .sb-logout { margin: 0; }
        }
      `}</style>
      <aside className="sb-root">
        <div className="sb-brand">
          <div className="sb-brand-icon">
            <FaGraduationCap />
          </div>
          <div className="sb-brand-info">
            <span className="sb-brand-name">SmartCampus</span>
            <span className="sb-brand-sub">Management</span>
          </div>
        </div>

        <nav className="sb-menu">
          <p className="sb-menu-label">Menu</p>
          <ul className="sb-nav-list">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `sb-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="sb-nav-icon"><item.icon /></span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="sb-user-info">
              <div className="sb-user-name">{displayName}</div>
              <div className="sb-user-role">{roleDisplay}</div>
            </div>
            <button className="sb-logout" onClick={handleLogout} title="Logout">
              <FaSignOutAlt size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
