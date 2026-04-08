import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const seedUser = () => {
    if (!localStorage.getItem("userId")) {
        localStorage.setItem("userId", "user-003");
    }
    if (!localStorage.getItem("userRole")) {
        localStorage.setItem("userRole", "USER");
    }
};

const Navbar = () => {
    seedUser();
    const location = useLocation();
    const role = localStorage.getItem("userRole") || "USER";

    const switchRole = (nextRole) => {
        localStorage.setItem("userRole", nextRole);
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    Smart Campus Insight
                </Link>

                <div className="navbar-menu">
                    <Link to="/tickets" className={`navbar-link ${location.pathname === "/tickets" ? "active" : ""}`}>
                        Dashboard
                    </Link>
                    <Link to="/create" className={`navbar-link ${location.pathname === "/create" ? "active" : ""}`}>
                        New Ticket
                    </Link>
                </div>

                <div className="navbar-actions">
                    <select
                        value={role}
                        onChange={(event) => switchRole(event.target.value)}
                        className="role-select"
                    >
                        <option value="USER">USER</option>
                        <option value="TECHNICIAN">TECHNICIAN</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                    <span className="user-role">{role}</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
