import { useEffect, useState } from "react";
import { getTickets } from "../api/ticketApi";
import TicketCard from "../components/ticketCard";

export default function TicketList() {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        getTickets().then(setTickets);
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2>All Tickets</h2>
            {tickets.map(t => (
                <TicketCard key={t.id} ticket={t} />
            ))}
        </div>
    );
}