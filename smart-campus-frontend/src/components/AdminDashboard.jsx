import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUsers,
    FaCalendarCheck,
    FaTicketAlt,
    FaBell,
    FaArrowRight,
    FaBuilding,
    FaCheckCircle,
    FaHourglassHalf,
    FaChartBar,
    FaCog,
    FaClipboardList,
    FaShieldAlt,
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
        <div className="self-end w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <FaArrowRight size={14} />
        </div>
    </div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { unreadCount } = useNotifications();

    const displayName = user?.name || user?.email?.split('@')[0] || 'Admin';

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 font-sans">

            {/* Welcome Banner */}
            <div className="flex items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-800 text-white px-10 py-10 mb-10 shadow-lg shadow-teal-300">
                <div>
                    <p className="text-xl opacity-85 mb-1">{getGreeting()},</p>
                    <h1 className="text-3xl font-bold mb-3">{displayName} 👋</h1>
                    <p className="text-base opacity-80 leading-relaxed mb-4 max-w-lg">
                        Welcome to the Admin Dashboard. Manage users, oversee facility bookings, track support tickets, and monitor campus resources.
                    </p>
                    <span className="inline-block bg-white/15 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                        Role: Administrator &nbsp;·&nbsp; {user?.displayId || ''}
                    </span>
                </div>
                <div className="hidden md:flex items-center justify-center text-8xl opacity-60 flex-shrink-0">
                    <FaShieldAlt />
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <StatCard
                    icon={<FaBuilding size={22} className="text-slate-600" />}
                    label="Total Resources"
                    value="5"
                    colorClass="bg-slate-100"
                    onClick={() => navigate('/resources')}
                />
                <StatCard
                    icon={<FaCheckCircle size={22} className="text-emerald-600" />}
                    label="Available Now"
                    value="4"
                    colorClass="bg-emerald-50"
                    onClick={() => navigate('/resources')}
                />
                <StatCard
                    icon={<FaHourglassHalf size={22} className="text-amber-500" />}
                    label="Pending Bookings"
                    value="1"
                    colorClass="bg-amber-50"
                    onClick={() => navigate('/bw-admin-bookings')}
                />
                <StatCard
                    icon={<FaTicketAlt size={22} className="text-red-400" />}
                    label="Open Tickets"
                    value="0"
                    colorClass="bg-red-50"
                    onClick={() => navigate('/tickets')}
                />
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                <ActionCard
                    icon={<FaUsers size={26} className="text-slate-700" />}
                    iconBg="bg-slate-100"
                    title="User Management"
                    description="Add, edit, and manage lecturer and technician accounts"
                    onClick={() => navigate('/admin')}
                />
                <ActionCard
                    icon={<FaBuilding size={26} className="text-teal-600" />}
                    iconBg="bg-teal-50"
                    title="Campus Resources"
                    description="View and manage facilities, labs, and equipment"
                    onClick={() => navigate('/resources')}
                />
                <ActionCard
                    icon={<FaCalendarCheck size={26} className="text-blue-600" />}
                    iconBg="bg-blue-50"
                    title="Bookings"
                    description="Review, approve, or reject facility booking requests"
                    onClick={() => navigate('/bw-admin-bookings')}
                />
                <ActionCard
                    icon={<FaTicketAlt size={26} className="text-orange-500" />}
                    iconBg="bg-orange-50"
                    title="Support Tickets"
                    description="Monitor and manage maintenance and support requests"
                    onClick={() => navigate('/tickets')}
                />
                <ActionCard
                    icon={<FaBell size={26} className="text-purple-500" />}
                    iconBg="bg-purple-50"
                    title="Notifications"
                    description="View and send campus-wide notifications and alerts"
                    onClick={() => navigate('/notifications-management')}
                />
                <ActionCard
                    icon={<FaCog size={26} className="text-slate-500" />}
                    iconBg="bg-slate-100"
                    title="Settings"
                    description="Configure notification preferences and system settings"
                    onClick={() => navigate('/settings')}
                />
            </div>

            {/* Admin Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-start gap-3">
                <FaChartBar size={18} className="text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Admin Overview</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        You have <strong className="text-slate-700">full access</strong> to all campus management features.
                        Use <strong className="text-slate-700">User Management</strong> to enroll new lecturers and technicians,
                        and <strong className="text-slate-700">Bookings</strong> to approve pending facility requests.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
