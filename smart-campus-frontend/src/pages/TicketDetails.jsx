import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTicket, updateStatus } from "../api/ticketApi";
import CommentSection from "../components/CommentSection";
import ImageUpload from "../components/ImageUpload";

export default function TicketDetails() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);



    const load = async () => {
        const data = await getTicket(id);
        setTicket(data);
    };

    useEffect(() => { load(); }, []);

    if (!ticket) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold">{ticket.title}</h1>
            <p>{ticket.description}</p>

            <div className="mt-4 flex gap-2">
                <div className="flex gap-2 mt-4">
                    <button onClick={() => updateStatus(id, "IN_PROGRESS")}
                        className="bg-yellow-500 text-white px-3 py-1 rounded">
                        Start
                    </button>

                    <button onClick={() => updateStatus(id, "RESOLVED")}
                        className="bg-green-500 text-white px-3 py-1 rounded">
                        Resolve
                    </button>

                    <button onClick={() => updateStatus(id, "CLOSED")}
                        className="bg-gray-500 text-white px-3 py-1 rounded">
                        Close
                    </button>
                </div>
            </div>

            <ImageUpload ticketId={id} refresh={load} />
            <CommentSection ticketId={id} />
        </div>
    );
}