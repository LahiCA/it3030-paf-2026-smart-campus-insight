import { useEffect, useState } from "react";
import { getTickets } from "../api/ticketApi";
import CreateTicket from "./CreateTicket";

export default function TicketList() {
    const [tickets, setTickets] = useState([]);
    const [open, setOpen] = useState(false); // modal state

    const getId = (t) => t.id?.timestamp || t._id;

    const fetchTickets = async () => {
        try {
            const data = await getTickets();
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Tickets</h1>
                    <p className="text-gray-500 text-sm">
                        Manage incident tickets
                    </p>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg shadow"
                >
                    + New Ticket
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow p-4">
                <table className="w-full text-sm">
                    <thead className="text-gray-500 border-b">
                        <tr>
                            <th className="text-left py-2">Title</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Contact</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tickets.map((t) => (
                            <tr key={getId(t)} className="border-b hover:bg-gray-50">
                                <td className="py-2 font-medium">{t.title}</td>
                                <td className="text-center">{t.category}</td>
                                <td className="text-center text-teal-600 font-semibold">{t.priority}</td>
                                <td className="text-center">
                                    <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                                        {t.status}
                                    </span>
                                </td>
                                <td className="text-center text-gray-500">
                                    {t.contactDetails}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-4 relative">

                        {/* CLOSE BUTTON */}
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-2 right-3 text-gray-500 text-lg"
                        >
                            ✕
                        </button>

                        <CreateTicket
                            onTicketCreated={(t) => {
                                setTickets([t, ...tickets]);
                                setOpen(false); // close modal
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}