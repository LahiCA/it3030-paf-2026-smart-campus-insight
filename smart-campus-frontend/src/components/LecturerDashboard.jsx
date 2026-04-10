import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaTicketAlt,
  FaBell,
  FaBookOpen,
  FaArrowRight,
  FaGraduationCap,
  FaClipboardList,
  FaBuilding,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
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

const ActionCard = ({ icon, iconBg, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="group flex flex-col gap-4 bg-white rounded-xl p-6 shadow-sm border-2 border-transparent hover:border-teal-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
  >
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
    <div className="self-end w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
      <FaArrowRight size={14} />
    </div>
  </div>
);

const BadgePill = ({ status }) => {
  const map = {
    Approved: 'bg-emerald-50 text-emerald-700',
    Pending: 'bg-amber-50 text-amber-700',
    Cancelled: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${map[status] || map.Pending}`}>
      {status}
    </span>
  );
};

const recentBookings = [
  { room: 'Lecture Hall A', date: 'Today, 10:00 AM', status: 'Approved' },
  { room: 'Lab 3 - Computer', date: 'Tomorrow, 2:00 PM', status: 'Pending' },
  { room: 'Conference Room B', date: 'Apr 10, 9:00 AM', status: 'Approved' },
];

const recentTickets = [
  { title: 'Projector not working - Hall A', created: '2 hours ago', status: 'Pending' },
  { title: 'AC unit malfunction - Lab 3', created: '1 day ago', status: 'Approved' },
];

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const displayName = user?.name || user?.email?.split('@')[0] || 'Lecturer';

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">

      {/* Welcome Banner */}
      <div className="flex items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-700 text-white px-10 py-10 mb-10 shadow-lg shadow-teal-200">
        <div>
          <p className="text-xl opacity-90 mb-1">{getGreeting()},</p>
          <h1 className="text-3xl font-bold mb-3">{displayName} 👋</h1>
          <p className="text-base opacity-85 leading-relaxed mb-4 max-w-lg">
            Welcome to your Lecturer Portal. Book facilities, raise maintenance requests, and stay up to date with campus notifications.
          </p>
          <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
            Role: Lecturer &nbsp;·&nbsp; {user?.displayId || ''}
          </span>
        </div>
        <div className="hidden md:flex items-center justify-center text-8xl opacity-80 flex-shrink-0">
          <FaGraduationCap />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          icon={<FaCalendarCheck size={22} className="text-teal-600" />}
          label="Active Bookings"
          value="3"
          colorClass="bg-teal-50"
          onClick={() => navigate('/bw-my-bookings')}
        />
        <StatCard
          icon={<FaHourglassHalf size={22} className="text-amber-500" />}
          label="Pending Approvals"
          value="1"
          colorClass="bg-amber-50"
          onClick={() => navigate('/bw-my-bookings')}
        />
        <StatCard
          icon={<FaTicketAlt size={22} className="text-orange-500" />}
          label="Open Tickets"
          value="2"
          colorClass="bg-orange-50"
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
          icon={<FaBuilding size={26} className="text-teal-600" />}
          iconBg="bg-teal-50"
          title="Book a Facility"
          description="Reserve lecture halls, labs, and meeting rooms"
          onClick={() => navigate('/bw-create-booking')}
        />
        <ActionCard
          icon={<FaClipboardList size={26} className="text-blue-600" />}
          iconBg="bg-blue-50"
          title="My Bookings"
          description="View and manage your current facility reservations"
          onClick={() => navigate('/bw-my-bookings')}
        />
        <ActionCard
          icon={<FaTicketAlt size={26} className="text-orange-500" />}
          iconBg="bg-orange-50"
          title="Raise a Ticket"
          description="Report maintenance or technical issues in your area"
          onClick={() => navigate('/tickets')}
        />
        <ActionCard
          icon={<FaBell size={26} className="text-purple-500" />}
          iconBg="bg-purple-50"
          title="Notifications"
          description="Check booking confirmations and campus updates"
          onClick={() => navigate('/notifications')}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaCalendarCheck className="text-teal-500" size={16} />
            <h3 className="text-base font-semibold text-slate-800">Recent Bookings</h3>
          </div>
          <ul className="divide-y divide-slate-50">
            {recentBookings.map((b, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <FaBuilding size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{b.room}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <FaClock size={10} /> {b.date}
                    </p>
                  </div>
                </div>
                <BadgePill status={b.status} />
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/bw-my-bookings')}
            className="mt-4 w-full text-sm text-teal-600 font-semibold hover:text-teal-800 text-center transition-colors"
          >
            View all bookings →
          </button>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaTicketAlt className="text-orange-500" size={16} />
            <h3 className="text-base font-semibold text-slate-800">My Support Tickets</h3>
          </div>
          <ul className="divide-y divide-slate-50">
            {recentTickets.map((t, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <FaTicketAlt size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{t.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.created}</p>
                  </div>
                </div>
                <BadgePill status={t.status} />
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/tickets')}
            className="mt-4 w-full text-sm text-teal-600 font-semibold hover:text-teal-800 text-center transition-colors"
          >
            View all tickets →
          </button>
        </div>

      </div>

      {/* Info Panel */}
      <div className="mt-6 bg-teal-50 border border-teal-100 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <FaBookOpen size={18} className="text-teal-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-teal-800 mb-1">Booking Policy Reminder</h4>
            <p className="text-sm text-teal-700 leading-relaxed">
              Facility bookings must be submitted at least <strong>24 hours in advance</strong>.
              Cancellations can be made up to 2 hours before the booking time.
              For urgent requests, contact the campus facilities team directly.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LecturerDashboard;
