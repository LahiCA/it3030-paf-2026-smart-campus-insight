import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBell,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
  FaTools,
  FaWrench,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getTickets, updateStatus } from '../api/ticketApi';
import TicketStatusBadge from './TicketStatusBadge';
import PriorityBadge from './PriorityBadge';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const TechnicianDashboardTailwind = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDrafts, setStatusDrafts] = useState({});
  const [busyTicketId, setBusyTicketId] = useState('');

  const displayName = user?.name || user?.email?.split('@')[0] || 'Technician';

  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTickets();
      setTickets(data);
      setStatusDrafts(Object.fromEntries(data.map((ticket) => [
        ticket.id,
        {
          status: getSuggestedNextStatus(ticket.status),
          resolutionNotes: ticket.resolutionNotes || '',
        },
      ])));
    } catch (apiError) {
      setError(apiError.message || 'Failed to load assigned tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const stats = useMemo(() => ({
    assigned: tickets.length,
    highPriority: tickets.filter((ticket) => ['HIGH', 'CRITICAL'].includes(ticket.priority)).length,
    open: tickets.filter((ticket) => ['OPEN', 'IN_PROGRESS'].includes(ticket.status)).length,
    resolved: tickets.filter((ticket) => ['RESOLVED', 'CLOSED'].includes(ticket.status)).length,
  }), [tickets]);

  const recentResolved = useMemo(
    () => tickets.filter((ticket) => ['RESOLVED', 'CLOSED'].includes(ticket.status)).slice(0, 4),
    [tickets],
  );

  const handleDraftChange = (ticketId, field, value) => {
    setStatusDrafts((current) => ({
      ...current,
      [ticketId]: {
        ...current[ticketId],
        [field]: value,
      },
    }));
  };

  const handleStatusUpdate = async (ticketId) => {
    const draft = statusDrafts[ticketId];
    if (!draft?.status) return;

    setBusyTicketId(ticketId);
    setError('');
    try {
      const updated = await updateStatus(ticketId, {
        status: draft.status,
        resolutionNotes: draft.status === 'RESOLVED' ? draft.resolutionNotes : '',
      });
      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? updated : ticket)));
      setStatusDrafts((current) => ({
        ...current,
        [ticketId]: {
          status: getSuggestedNextStatus(updated.status),
          resolutionNotes: updated.resolutionNotes || '',
        },
      }));
    } catch (apiError) {
      setError(apiError.message || 'Failed to update ticket status');
    } finally {
      setBusyTicketId('');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 rounded-[2rem] bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-8 text-white shadow-lg shadow-teal-200/70 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-lg text-teal-50">{getGreeting()},</p>
          <h1 className="mt-2 text-3xl font-bold">{displayName}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-teal-50/90">
            Review only the tickets assigned to you, update their progress, and record resolution notes from one place.
          </p>
          <span className="mt-4 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">
            Technician ID: {user?.displayId || 'Not available'}
          </span>
        </div>
        <div className="hidden rounded-[1.75rem] bg-white/10 p-6 text-7xl text-white/90 lg:flex">
          <FaTools />
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<FaClipboardList className="text-teal-600" />} label="Assigned Tickets" value={stats.assigned} tone="bg-teal-50" onClick={() => navigate('/tickets')} />
        <StatCard icon={<FaExclamationTriangle className="text-red-600" />} label="High Priority" value={stats.highPriority} tone="bg-red-50" onClick={() => navigate('/tickets')} />
        <StatCard icon={<FaWrench className="text-amber-600" />} label="Open Work" value={stats.open} tone="bg-amber-50" onClick={() => navigate('/tickets')} />
        <StatCard icon={<FaBell className="text-teal-700" />} label="Unread Alerts" value={unreadCount ?? 0} tone="bg-slate-100" onClick={() => navigate('/notifications')} />
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Technician Queue</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Assigned tickets</h2>
            </div>
            <Link to="/tickets" className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100">
              Open full dashboard
            </Link>
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
              Loading assigned tickets...
            </div>
          ) : tickets.length ? (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const draft = statusDrafts[ticket.id] || { status: '', resolutionNotes: '' };
                const nextStatuses = getTechnicianStatuses(ticket.status);
                return (
                  <article key={ticket.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">{ticket.category}</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">{ticket.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{ticket.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <PriorityBadge priority={ticket.priority} />
                          <TicketStatusBadge status={ticket.status} />
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            Reporter: {ticket.userDisplayId || ticket.userId}
                          </span>
                        </div>
                      </div>
                      <Link to={`/tickets/${ticket.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50">
                        View details
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Next status</span>
                        <select
                          value={draft.status}
                          onChange={(event) => handleDraftChange(ticket.id, 'status', event.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                        >
                          {nextStatuses.length ? nextStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          )) : (
                            <option value="">No actions available</option>
                          )}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Resolution notes</span>
                        <textarea
                          value={draft.resolutionNotes}
                          onChange={(event) => handleDraftChange(ticket.id, 'resolutionNotes', event.target.value)}
                          rows="4"
                          placeholder="Add findings, work completed, or parts replaced"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        Updated {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : 'recently'}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(ticket.id)}
                        disabled={!draft.status || busyTicketId === ticket.id}
                        className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {busyTicketId === ticket.id ? 'Saving...' : 'Update ticket'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
              No tickets are currently assigned to you.
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-teal-600" />
              <h3 className="text-lg font-semibold text-slate-900">Recently resolved</h3>
            </div>
            {recentResolved.length ? (
              <div className="space-y-3">
                {recentResolved.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">{ticket.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <FaClock size={10} />
                      {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : 'Recently updated'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Resolved tickets will appear here once your updates are completed.</p>
            )}
          </section>

          <section className="rounded-xl border border-teal-100 bg-teal-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <FaTools className="mt-1 text-teal-600" />
              <div>
                <p className="text-sm font-semibold text-teal-900">Technician guidance</p>
                <p className="mt-2 text-sm leading-6 text-teal-800">
                  Move tickets from OPEN to IN_PROGRESS when work begins, and add clear resolution notes before marking them RESOLVED.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, tone, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold leading-none text-slate-800">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  </button>
);

const getTechnicianStatuses = (status) => {
  if (status === 'OPEN') return ['IN_PROGRESS'];
  if (status === 'IN_PROGRESS') return ['RESOLVED'];
  if (status === 'RESOLVED') return ['CLOSED'];
  return [];
};

const getSuggestedNextStatus = (status) => {
  if (status === 'OPEN') return 'IN_PROGRESS';
  if (status === 'IN_PROGRESS') return 'RESOLVED';
  if (status === 'RESOLVED') return 'CLOSED';
  return '';
};

export default TechnicianDashboardTailwind;
