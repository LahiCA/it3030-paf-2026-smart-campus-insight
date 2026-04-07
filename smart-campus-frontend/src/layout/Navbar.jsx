import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon"></span>
                    Smart Campus
                </Link>

                <div className="navbar-menu">
                    <Link
                        to="/"
                        className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/create"
                        className={`navbar-link ${location.pathname === '/create' ? 'active' : ''}`}
                    >
                        Create Ticket
                    </Link>
                </div>

                <div className="navbar-actions">
                    <span className="user-role">Member 03</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;