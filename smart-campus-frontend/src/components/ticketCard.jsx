import { Link } from "react-router-dom";

export default function TicketCard({ ticket }) {
    return (
        <div style={{
            background: "#CCFBF1",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px"
        }}>
            <h3>{ticket.title}</h3>
            <p>{ticket.description}</p>
            <p>Status: <b>{ticket.status}</b></p>

            <Link to={`/ticket/${ticket.id}`}>View Details</Link>
        </div>
    );
}