import { Link } from "react-router-dom";
import TicketStatusBadge from "./TicketStatusBadge";

export default function TicketCard({ ticket }) {
    return (
        <div className="flex justify-between mt-3">
            <TicketStatusBadge status={ticket.status} />
            <span className={`text-xs px-2 py-1 rounded-full ${ticket.priority === "HIGH"
                    ? "bg-red-100 text-red-600"
                    : ticket.priority === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                }`}>
                {ticket.priority}
            </span>
            <Link to={`/tickets/${ticket.id}`} className="text-teal-600">View</Link>
        </div>
    );
}
