const STATUS_STYLES = {
    OPEN: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
    RESOLVED: "bg-green-100 text-green-700 border-green-200",
    CLOSED: "bg-slate-200 text-slate-700 border-slate-300",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export default function TicketStatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}
        >
            {status?.replaceAll("_", " ")}
        </span>
    );
}
