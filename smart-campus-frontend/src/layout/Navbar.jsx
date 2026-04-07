import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <div style={{
            padding: "15px",
            backgroundColor: "#14B8A6",
            color: "white",
            display: "flex",
            justifyContent: "space-between"
        }}>
            <h2>Smart Campus</h2>
            <div>
                <Link to="/" style={{ color: "white", marginRight: "10px" }}>Tickets</Link>
                <Link to="/create" style={{ color: "white" }}>Create</Link>
            </div>
        </div>
    );
}