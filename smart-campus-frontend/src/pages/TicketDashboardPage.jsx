import { useEffect, useMemo, useState } from "react";
import TicketCard from "../components/ticketCard";
import CreateTicketPage from "./CreateTicketPage";
import { getCurrentUser, getTickets } from "../api/ticketApi";

const FILTERS = {
    status: ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"],
    priority: ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
    category: ["ALL"],
};

export default function TicketDashboardPage() {
    const { role, userId, displayId } = getCurrentUser();
    const [tickets, setTickets] = useState([]);
    const [filters, setFilters] = useState({ status: "ALL", priority: "ALL", category: "ALL" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const loadTickets = async () => {
        setLoading(true);
        setError("");
        try {
            setTickets(await getTickets());
        } catch (apiError) {
            setError(apiError.message || "Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const categories = useMemo(() => {
        const dynamic = [...new Set(tickets.map((ticket) => ticket.category).filter(Boolean))];
        return [...FILTERS.category, ...dynamic];
    }, [tickets]);

    const filteredTickets = useMemo(
        () =>
            tickets.filter((ticket) => {
                const statusMatch = filters.status === "ALL" || ticket.status === filters.status;
                const priorityMatch = filters.priority === "ALL" || ticket.priority === filters.priority;
                const categoryMatch = filters.category === "ALL" || ticket.category === filters.category;
                return statusMatch && priorityMatch && categoryMatch;
            }),
        [filters, tickets],
    );

    const canCreateTicket = role !== "ADMIN" && role !== "TECHNICIAN";
    const stats = {
        total: tickets.length,
        open: tickets.filter((ticket) => ticket.status === "OPEN").length,
        active: tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
        resolved: tickets.filter((ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED").length,
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_35%),linear-gradient(180deg,_#f8fffd_0%,_#f8fafc_100%)] px-4 py-8">
            <div className="mx-auto max-w-7xl">
                <section className="rounded-[2rem] bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>

                            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                                Maintenance and Incident Ticketing
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                                {role === "ADMIN"
                                    ? "Admin overview of every reported incident on campus."
                                    : role === "TECHNICIAN"
                                        ? `Welcome ${displayId || userId}. View and update only the tickets assigned to you.`
                                        : `Welcome ${displayId || userId}. Track your maintenance issues, evidence, and comment history.`}
                            </p>
                        </div>
                        {canCreateTicket ? (
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                            >
                                Create Ticket
                            </button>
                        ) : null}
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard label="Total tickets" value={stats.total} tone="teal" />
                        <StatCard label="Open" value={stats.open} tone="blue" />
                        <StatCard label="In progress" value={stats.active} tone="amber" />
                        <StatCard label="Resolved / Closed" value={stats.resolved} tone="green" />
                    </div>
                </section>

                <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-3">
                        <FilterSelect label="Status" value={filters.status} options={FILTERS.status} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} />
                        <FilterSelect label="Priority" value={filters.priority} options={FILTERS.priority} onChange={(value) => setFilters((current) => ({ ...current, priority: value }))} />
                        <FilterSelect label="Category" value={filters.category} options={categories} onChange={(value) => setFilters((current) => ({ ...current, category: value }))} />
                    </div>
                </section>

                {error ? (
                    <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
                ) : null}

                {loading ? (
                    <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm">
                        Loading tickets...
                    </div>
                ) : (
                    <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredTickets.length ? filteredTickets.map((ticket) => (
                            <TicketCard key={ticket.id} ticket={ticket} role={role} />
                        )) : (
                            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500 md:col-span-2 xl:col-span-3">
                                No tickets match the selected filters.
                            </div>
                        )}
                    </section>
                )}
            </div>

            {showCreateModal && canCreateTicket ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
                        <CreateTicketPage
                            embedded
                            onClose={() => setShowCreateModal(false)}
                            onTicketCreated={(ticket) => {
                                setTickets((current) => [ticket, ...current]);
                                setShowCreateModal(false);
                            }}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function FilterSelect({ label, value, options, onChange }) {
    return (
        <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
            >
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        </label>
    );
}

function StatCard({ label, value, tone }) {
    const tones = {
        teal: "bg-teal-50 text-teal-700",
        blue: "bg-blue-50 text-blue-700",
        amber: "bg-amber-50 text-amber-700",
        green: "bg-green-50 text-green-700",
    };
    return (
        <article className={`rounded-3xl px-5 py-6 ${tones[tone]}`}>
            <p className="text-sm font-medium">{label}</p>
            <p className="mt-3 text-4xl font-semibold">{value}</p>
        </article>
    );
}
