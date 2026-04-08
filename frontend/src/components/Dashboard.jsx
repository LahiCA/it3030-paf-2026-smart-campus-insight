import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaTicketAlt,
  FaBell,
  FaUsers,
  FaArrowRight,
  FaChartLine,
  FaGraduationCap,
  FaBuilding,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isTechnician } = useAuth();
  const { unreadCount } = useNotifications();

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email?.split('@')[0] || 'User';

  const roleDisplay = formatRole(user?.role || 'USER');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <style>{`
        .db-wrap { padding: 40px 24px; max-width: 1400px; margin: 0 auto; width: 100%; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .db-welcome { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #14B8A6 0%, #0f766e 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 40px; gap: 20px; box-shadow: 0 8px 16px rgba(20, 184, 166, 0.4); }
        .db-welcome-content { flex-grow: 1; }
        .db-welcome-content h1 { font-size: 32px; margin: 0 0 16px 0; line-height: 1.3; font-weight: 700; }
        .db-greeting { display: block; font-size: 24px; opacity: 0.95; margin-bottom: 8px; }
        .db-welcome-msg { font-size: 16px; margin: 0 0 16px 0; opacity: 0.95; line-height: 1.6; }
        .db-role-badge { display: inline-block; background-color: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 24px; font-size: 14px; margin: 0; }
        .db-role-badge strong { font-weight: 600; }
        .db-welcome-icon { font-size: 80px; line-height: 1; flex-shrink: 0; }
        .db-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .db-stat-card { display: flex; align-items: center; gap: 16px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .db-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .db-stat-icon { width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
        .db-stat-icon.unread { background-color: #fff3e0; color: #ff9800; }
        .db-stat-content { flex-grow: 1; }
        .db-stat-label { margin: 0 0 4px 0; font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .db-stat-value { margin: 0; font-size: 28px; font-weight: 700; color: #333; }
        .db-stat-action { width: 40px; height: 40px; border-radius: 8px; background-color: #f0f0f0; color: #666; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background-color 0.2s ease; flex-shrink: 0; border: none; }
        .db-stat-action:hover { background-color: #e0e0e0; color: #333; }
        .db-actions h2 { font-size: 20px; color: #333; margin: 0 0 20px 0; font-weight: 600; }
        .db-actions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .db-action-card { display: flex; flex-direction: column; gap: 16px; background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s ease; cursor: pointer; border: 2px solid transparent; }
        .db-action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); border-color: #14B8A6; }
        .db-card-icon { font-size: 40px; line-height: 1; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 8px; flex-shrink: 0; }
        .db-bookings .db-card-icon { background-color: #e3f2fd; color: #2196f3; }
        .db-tickets .db-card-icon { background-color: #fff3e0; color: #ff9800; }
        .db-notifs .db-card-icon { background-color: #f3e5f5; color: #9c27b0; }
        .db-admin .db-card-icon { background-color: #e8f5e9; color: #4caf50; }
        .db-tech .db-card-icon { background-color: #fce4ec; color: #e91e63; }
        .db-card-content { flex-grow: 1; }
        .db-card-content h3 { margin: 0 0 8px 0; font-size: 18px; color: #333; font-weight: 600; }
        .db-card-content p { margin: 0; font-size: 14px; color: #666; line-height: 1.4; }
        .db-card-btn { align-self: flex-start; width: 40px; height: 40px; border-radius: 8px; background-color: #f0f0f0; color: #666; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; font-size: 16px; border: none; }
        .db-card-btn:hover { background-color: #e0e0e0; color: #333; transform: translateX(4px); }
        .db-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 40px; }
        .db-info-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .db-info-card h3 { margin: 0 0 16px 0; font-size: 16px; color: #333; font-weight: 600; }
        .db-info-card ul { list-style: none; padding: 0; margin: 0; }
        .db-info-card li { padding: 8px 0; font-size: 14px; color: #666; line-height: 1.6; border-bottom: 1px solid #f0f0f0; }
        .db-info-card li:last-child { border-bottom: none; }
        .db-info-card li strong { color: #333; font-weight: 600; }
        .db-overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .db-ov-card { display: flex; align-items: center; gap: 16px; background: white; padding: 20px 24px; border-radius: 12px; border: 1px solid #f0f0f0; }
        .db-ov-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .db-ov-icon.res { background: #eef2ff; color: #6366f1; }
        .db-ov-icon.avail { background: #ecfdf5; color: #22c55e; }
        .db-ov-icon.pend { background: #fff7ed; color: #f59e0b; }
        .db-ov-icon.tix { background: #fef2f2; color: #ef4444; }
        .db-ov-num { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0; line-height: 1; }
        .db-ov-label { font-size: 13px; color: #94a3b8; margin: 0; margin-top: 2px; }
        .db-recent { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .db-recent-card { background: white; border-radius: 12px; border: 1px solid #f0f0f0; padding: 24px; }
        .db-recent-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 20px 0; }
        .db-recent-title svg { color: #64748b; }
        .db-recent-list { list-style: none; padding: 0; margin: 0; }
        .db-recent-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f8fafc; }
        .db-recent-item:last-child { border-bottom: none; }
        .db-recent-left { display: flex; align-items: center; gap: 12px; }
        .db-recent-icon { width: 36px; height: 36px; border-radius: 8px; background: #f8fafc; color: #94a3b8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .db-recent-name { font-size: 14px; font-weight: 600; color: #1e293b; margin: 0; }
        .db-recent-sub { font-size: 12px; color: #94a3b8; margin: 0; margin-top: 2px; }
        .db-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .db-badge.approved { background: #ecfdf5; color: #16a34a; }
        .db-badge.pending { background: #fff7ed; color: #f59e0b; }
        .db-badge.cancelled { background: #f8fafc; color: #94a3b8; }
        .db-recent-empty { text-align: center; color: #94a3b8; padding: 40px 0; font-size: 14px; }
        @media (max-width: 1024px) {
          .db-wrap { padding: 30px 16px; }
          .db-welcome { flex-direction: column; text-align: center; padding: 30px; }
          .db-welcome-content h1 { font-size: 28px; }
          .db-welcome-icon { font-size: 60px; }
          .db-actions-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
          .db-overview { grid-template-columns: repeat(2, 1fr); }
          .db-recent { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .db-wrap { padding: 20px 12px; }
          .db-welcome { padding: 20px; gap: 16px; margin-bottom: 30px; }
          .db-welcome-content h1 { font-size: 24px; margin-bottom: 12px; }
          .db-greeting { font-size: 20px; margin-bottom: 6px; }
          .db-welcome-msg { font-size: 14px; margin-bottom: 12px; }
          .db-welcome-icon { font-size: 48px; }
          .db-stats { grid-template-columns: 1fr; margin-bottom: 30px; }
          .db-overview { grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 30px; }
          .db-recent { grid-template-columns: 1fr; gap: 16px; margin-bottom: 30px; }
          .db-actions-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 30px; }
          .db-action-card { padding: 16px; }
          .db-card-icon { width: 48px; height: 48px; font-size: 32px; }
          .db-card-content h3 { font-size: 16px; }
          .db-card-content p { font-size: 13px; }
          .db-info { grid-template-columns: 1fr; gap: 16px; margin-top: 30px; }
          .db-info-card { padding: 16px; }
          .db-info-card h3 { font-size: 15px; margin-bottom: 12px; }
          .db-info-card li { padding: 6px 0; font-size: 13px; }
        }
        @media (max-width: 600px) {
          .db-wrap { padding: 16px 10px; }
          .db-welcome { padding: 16px; margin-bottom: 20px; }
          .db-welcome-content h1 { font-size: 20px; }
          .db-greeting { font-size: 16px; }
          .db-welcome-msg { font-size: 13px; margin-bottom: 12px; }
          .db-welcome-icon { font-size: 40px; }
          .db-actions h2 { font-size: 18px; }
          .db-actions-grid { grid-template-columns: 1fr; }
          .db-overview { grid-template-columns: 1fr; }
          .db-action-card { padding: 16px; }
          .db-card-icon { width: 40px; height: 40px; font-size: 28px; }
          .db-card-content h3 { font-size: 15px; }
        }
      `}</style>
      <div className="db-wrap">
        <section className="db-welcome">
          <div className="db-welcome-content">
            <h1>
              <span className="db-greeting">{getGreeting()},</span>{displayName}! 👋
            </h1>
            <p className="db-welcome-msg">
              Welcome to Smart Campus Operations Hub. Manage facilities, bookings, and support tickets efficiently.
            </p>
            <p className="db-role-badge">
              Role: <strong>{roleDisplay}</strong>
            </p>
          </div>
          <div className="db-welcome-icon">
            <FaGraduationCap size={80} />
          </div>
        </section>

        <section className="db-actions">
          <h2>Quick Actions</h2>
          <div className="db-actions-grid">
            <div className="db-action-card db-bookings">
              <div className="db-card-icon"><FaCalendarCheck size={32} /></div>
              <div className="db-card-content"><h3>Bookings</h3><p>View and manage facility bookings</p></div>
              <button className="db-card-btn" onClick={() => navigate('/bookings')} title="Go to Bookings"><FaArrowRight /></button>
            </div>
            <div className="db-action-card db-tickets">
              <div className="db-card-icon"><FaTicketAlt size={32} /></div>
              <div className="db-card-content"><h3>Support Tickets</h3><p>Create and track support requests</p></div>
              <button className="db-card-btn" onClick={() => navigate('/tickets')} title="Go to Tickets"><FaArrowRight /></button>
            </div>
            <div className="db-action-card db-notifs">
              <div className="db-card-icon"><FaBell size={32} /></div>
              <div className="db-card-content"><h3>Notifications</h3><p>View all notifications and updates</p></div>
              <button className="db-card-btn" onClick={() => navigate('/notifications')} title="Go to Notifications"><FaArrowRight /></button>
            </div>
            {isAdmin() && (
              <div className="db-action-card db-admin">
                <div className="db-card-icon"><FaUsers size={32} /></div>
                <div className="db-card-content"><h3>User Management</h3><p>Manage users and roles</p></div>
                <button className="db-card-btn" onClick={() => navigate('/admin/users')} title="Go to Admin Panel"><FaArrowRight /></button>
              </div>
            )}
            {isTechnician() && (
              <div className="db-action-card db-tech">
                <div className="db-card-icon"><FaChartLine size={32} /></div>
                <div className="db-card-content"><h3>Maintenance</h3><p>View maintenance requests</p></div>
                <button className="db-card-btn" onClick={() => navigate('/maintenance')} title="Go to Maintenance"><FaArrowRight /></button>
              </div>
            )}
          </div>
        </section>

        <section className="db-overview">
          <div className="db-ov-card">
            <div className="db-ov-icon res"><FaBuilding size={22} /></div>
            <div>
              <p className="db-ov-num">5</p>
              <p className="db-ov-label">Total Resources</p>
            </div>
          </div>
          <div className="db-ov-card">
            <div className="db-ov-icon avail"><FaCheckCircle size={22} /></div>
            <div>
              <p className="db-ov-num">4</p>
              <p className="db-ov-label">Available Now</p>
            </div>
          </div>
          <div className="db-ov-card">
            <div className="db-ov-icon pend"><FaClock size={22} /></div>
            <div>
              <p className="db-ov-num">1</p>
              <p className="db-ov-label">Pending Bookings</p>
            </div>
          </div>
          <div className="db-ov-card">
            <div className="db-ov-icon tix"><FaTicketAlt size={22} /></div>
            <div>
              <p className="db-ov-num">0</p>
              <p className="db-ov-label">Open Tickets</p>
            </div>
          </div>
        </section>

        <section className="db-recent">
          <div className="db-recent-card">
            <h3 className="db-recent-title"><FaCalendarCheck /> Recent Bookings</h3>
            <ul className="db-recent-list">
              <li className="db-recent-item">
                <div className="db-recent-left">
                  <div className="db-recent-icon"><FaCalendarCheck size={14} /></div>
                  <div>
                    <p className="db-recent-name">PAF Lecture</p>
                    <p className="db-recent-sub">Lecture Hall A · Mar 15, 14:30</p>
                  </div>
                </div>
                <span className="db-badge approved">Approved</span>
              </li>
              <li className="db-recent-item">
                <div className="db-recent-left">
                  <div className="db-recent-icon"><FaCalendarCheck size={14} /></div>
                  <div>
                    <p className="db-recent-name">Web Dev Workshop</p>
                    <p className="db-recent-sub">Computer Lab 1 · Mar 16, 19:30</p>
                  </div>
                </div>
                <span className="db-badge pending">Pending</span>
              </li>
              <li className="db-recent-item">
                <div className="db-recent-left">
                  <div className="db-recent-icon"><FaCalendarCheck size={14} /></div>
                  <div>
                    <p className="db-recent-name">Group Project Meeting</p>
                    <p className="db-recent-sub">Meeting Room 101 · Mar 17, 15:30</p>
                  </div>
                </div>
                <span className="db-badge approved">Approved</span>
              </li>
              <li className="db-recent-item">
                <div className="db-recent-left">
                  <div className="db-recent-icon"><FaCalendarCheck size={14} /></div>
                  <div>
                    <p className="db-recent-name">Guest Lecture</p>
                    <p className="db-recent-sub">Lecture Hall A · Mar 18, 14:30</p>
                  </div>
                </div>
                <span className="db-badge cancelled">Cancelled</span>
              </li>
            </ul>
          </div>
          <div className="db-recent-card">
            <h3 className="db-recent-title"><FaTicketAlt /> Recent Tickets</h3>
            <p className="db-recent-empty">No tickets yet.</p>
          </div>
        </section>

        <section className="db-stats">
          <div className="db-stat-card">
            <div className="db-stat-icon unread">
              <FaBell size={24} />
            </div>
            <div className="db-stat-content">
              <p className="db-stat-label">Unread Notifications</p>
              <p className="db-stat-value">{unreadCount}</p>
            </div>
            <button className="db-stat-action" onClick={() => navigate('/notifications')} title="View all notifications">
              <FaArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="db-info">
          <div className="db-info-card">
            <h3>📚 Getting Started</h3>
            <ul>
              <li>Check your <strong>notifications</strong> for updates on bookings and tickets</li>
              <li>Navigate to <strong>Bookings</strong> to reserve facilities</li>
              <li>Use <strong>Support Tickets</strong> to report issues and track resolutions</li>
              <li>Visit your <strong>Profile</strong> to manage account settings</li>
            </ul>
          </div>
          <div className="db-info-card">
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
    </>
  );
};

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
