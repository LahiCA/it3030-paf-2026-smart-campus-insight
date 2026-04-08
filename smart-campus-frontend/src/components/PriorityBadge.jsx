const PRIORITY_STYLES = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    HIGH: "bg-red-100 text-red-700",
    CRITICAL: "bg-red-600 text-white",
};

export default function PriorityBadge({ priority }) {
    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${PRIORITY_STYLES[priority] || "bg-slate-100 text-slate-700"}`}>
            {priority}
        </span>
    );
}
