import { Link } from "react-router-dom";
import TicketStatusBadge from "./TicketStatusBadge";

const PRIORITY_STYLES = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    HIGH: "bg-red-100 text-red-700",
    CRITICAL: "bg-red-600 text-white",
};

export default function TicketCard({ ticket }) {
    return (
        <article className="rounded-3xl border border-teal-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
                        {ticket.category}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{ticket.title}</h3>
                </div>
                <TicketStatusBadge status={ticket.status} />
            </div>

            <p className="text-sm leading-6 text-slate-600">
                {ticket.description.length > 160 ? `${ticket.description.slice(0, 160)}...` : ticket.description}
            </p>

            {ticket.rating ? (
                <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">Rating received</div>
                    <div className="mt-2 flex items-center gap-2 text-amber-600">
                        {Array.from({ length: 5 }, (_, index) => (
                            <span key={index} className={ticket.rating > index ? "text-yellow-400" : "text-slate-300"}>
                                ★
                            </span>
                        ))}
                        <span className="font-semibold text-slate-700">{ticket.rating}/5</span>
                    </div>
                    {ticket.feedback ? <p className="mt-3 text-slate-600">"{ticket.feedback}"</p> : null}
                </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${PRIORITY_STYLES[ticket.priority] || "bg-slate-100 text-slate-700"}`}>
                    {ticket.priority}
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                    {ticket.attachments?.length || 0} attachment{ticket.attachments?.length === 1 ? "" : "s"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {ticket.comments?.length || 0} comment{ticket.comments?.length === 1 ? "" : "s"}
                </span>
            </div>

            <div className="mt-4 space-y-1 text-sm text-slate-500">
                <p>First Response: {formatSlaDuration(ticket.createdAt, ticket.firstResponseAt)}</p>
                <p>Resolution Time: {formatSlaDuration(ticket.createdAt, ticket.resolvedAt)}</p>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
                <div className="text-slate-500">
                    Reported by <span className="font-semibold text-slate-700">{ticket.userDisplayId || ticket.userId}</span>
                </div>
                <Link
                    to={`/tickets/${ticket.id}`}
                    className="rounded-full bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700"
                >
                    View details
                </Link>
            </div>
        </article>
    );
}

function formatSlaDuration(createdAt, milestoneAt) {
    if (!createdAt || !milestoneAt) return "Pending";
    const start = new Date(createdAt);
    const end = new Date(milestoneAt);
    const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    if (Number.isNaN(totalMinutes) || totalMinutes < 0) return "Pending";
    if (totalMinutes < 1) return "Less than a minute";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
        return minutes > 0
            ? `${hours} hr${hours !== 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`
            : `${hours} hr${hours !== 1 ? "s" : ""}`;
    }
    return `${totalMinutes} min${totalMinutes !== 1 ? "s" : ""}`;
}

