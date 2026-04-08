export default function TicketCard({ ticket }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md">
            <h3 className="font-semibold text-lg">{ticket.title}</h3>

            <p className="text-sm text-gray-500 line-clamp-2">
                {ticket.description}
            </p>

            <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-400">
                    {ticket.category}
                </span>

                <span className="text-xs font-semibold text-teal-600">
                    {ticket.priority}
                </span>
            </div>

            <div className="flex justify-between mt-3">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {ticket.status}
                </span>
            </div>
        </div>
    );
}