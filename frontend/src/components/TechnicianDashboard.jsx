import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTicketAlt,
  FaBell,
  FaArrowRight,
  FaTools,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaWrench,
  FaListAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const StatCard = ({ icon, label, value, colorClass, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm border border-slate-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">{label}</p>
    </div>
  </div>
);

const ActionCard = ({ icon, iconBg, title, description, onClick, badge }) => (
  <div
    onClick={onClick}
    className="group relative flex flex-col gap-4 bg-white rounded-xl p-6 shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
  >
    {badge && (
      <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
    <div className="self-end w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
      <FaArrowRight size={14} />
    </div>
  </div>
);

const PriorityBadge = ({ priority }) => {
  const map = {
    High: 'bg-red-50 text-red-700',
    Medium: 'bg-amber-50 text-amber-700',
    Low: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${map[priority] || map.Low}`}>
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Resolved: 'bg-emerald-50 text-emerald-700',
    'In Progress': 'bg-blue-50 text-blue-700',
    Open: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${map[status] || map.Open}`}>
      {status}
    </span>
  );
};

const assignedTickets = [
  { title: 'Projector malfunction - Hall A', reporter: 'Dr. Silva', priority: 'High', status: 'In Progress' },
  { title: 'AC unit not cooling - Lab 3', reporter: 'Dr. Perera', priority: 'Medium', status: 'Open' },
  { title: 'Network switch failure - Room 201', reporter: 'Mr. Kamal', priority: 'High', status: 'Open' },
];

const recentActivity = [
  { title: 'Repaired water leak - Corridor B', resolved: '1 hour ago', status: 'Resolved' },
  { title: 'Replaced UPS - Server Room', resolved: 'Yesterday', status: 'Resolved' },
];

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const displayName = user?.name || user?.email?.split('@')[0] || 'Technician';

  const openTicketsCount = assignedTickets.filter(t => t.status !== 'Resolved').length;
  const highPriorityCount = assignedTickets.filter(t => t.priority === 'High').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">

      {/* Welcome Banner */}
      <div className="flex items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-10 py-10 mb-10 shadow-lg shadow-indigo-200">
        <div>
          <p className="text-xl opacity-90 mb-1">{getGreeting()},</p>
          <h1 className="text-3xl font-bold mb-3">{displayName} 👋</h1>
          <p className="text-base opacity-85 leading-relaxed mb-4 max-w-lg">
            Welcome to your Technician Portal. Manage maintenance tickets, track work orders, and keep campus facilities running smoothly.
          </p>
          <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
            Role: Technician &nbsp;·&nbsp; {user?.displayId || ''}
          </span>
        </div>
        <div className="hidden md:flex items-center justify-center text-8xl opacity-80 flex-shrink-0">
          <FaTools />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          icon={<FaListAlt size={22} className="text-indigo-600" />}
          label="Assigned Tickets"
          value={assignedTickets.length}
          colorClass="bg-indigo-50"
          onClick={() => navigate('/tickets')}
        />
        <StatCard
          icon={<FaExclamationTriangle size={22} className="text-red-500" />}
          label="High Priority"
          value={highPriorityCount}
          colorClass="bg-red-50"
          onClick={() => navigate('/tickets')}
        />
        <StatCard
          icon={<FaHourglassHalf size={22} className="text-amber-500" />}
          label="Open Tickets"
          value={openTicketsCount}
          colorClass="bg-amber-50"
          onClick={() => navigate('/tickets')}
        />
        <StatCard
          icon={<FaBell size={22} className="text-purple-500" />}
          label="Unread Notifications"
          value={unreadCount ?? 0}
          colorClass="bg-purple-50"
          onClick={() => navigate('/notifications')}
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-slate-700 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <ActionCard
          icon={<FaTicketAlt size={26} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
          title="My Assigned Tickets"
          description="View and update tickets assigned to you"
          onClick={() => navigate('/tickets')}
          badge={openTicketsCount > 0 ? openTicketsCount : null}
        />
        <ActionCard
          icon={<FaClipboardList size={26} className="text-amber-600" />}
          iconBg="bg-amber-50"
          title="Work Queue"
          description="See the full list of pending maintenance requests"
          onClick={() => navigate('/tickets')}
        />
        <ActionCard
          icon={<FaWrench size={26} className="text-slate-600" />}
          iconBg="bg-slate-100"
          title="Log Work Done"
          description="Record completed maintenance tasks and resolutions"
          onClick={() => navigate('/tickets')}
        />
        <ActionCard
          icon={<FaBell size={26} className="text-purple-500" />}
          iconBg="bg-purple-50"
          title="Notifications"
          description="View new ticket assignments and campus alerts"
          onClick={() => navigate('/notifications')}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Assigned / Open Tickets */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaTicketAlt className="text-indigo-500" size={16} />
            <h3 className="text-base font-semibold text-slate-800">Assigned Tickets</h3>
            <span className="ml-auto bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {openTicketsCount} open
            </span>
          </div>
          <ul className="divide-y divide-slate-50">
            {assignedTickets.map((t, i) => (
              <li key={i} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5">
                      <FaWrench size={13} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{t.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Reported by {t.reporter}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/tickets')}
            className="mt-4 w-full text-sm text-indigo-600 font-semibold hover:text-indigo-800 text-center transition-colors"
          >
            View all tickets →
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaCheckCircle className="text-emerald-500" size={16} />
            <h3 className="text-base font-semibold text-slate-800">Recently Resolved</h3>
          </div>
          <ul className="divide-y divide-slate-50">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <FaCheckCircle size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{a.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <FaClock size={10} /> {a.resolved}
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>

          {/* Performance Tip */}
          <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FaTools size={15} className="text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-indigo-800 mb-0.5">SLA Reminder</p>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  High priority tickets must be resolved within <strong>4 hours</strong>. 
                  Update ticket status as you progress.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TechnicianDashboard;
