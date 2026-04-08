export default function TicketStatusBadge({ status }) {
    const map = {
        OPEN: "bg-blue-100 text-blue-600",
        IN_PROGRESS: "bg-yellow-100 text-yellow-600",
        RESOLVED: "bg-green-100 text-green-600",
        CLOSED: "bg-gray-200 text-gray-600",
        REJECTED: "bg-red-100 text-red-600",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
            {status}
        </span>
    );
}