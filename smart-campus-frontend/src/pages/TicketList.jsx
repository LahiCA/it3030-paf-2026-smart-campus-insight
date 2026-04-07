import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../api/ticketApi';
import TicketCard from '../components/TicketCard';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await ticketApi.getAllTickets();
            setTickets(response.data);
        } catch (err) {
            setError('Failed to load tickets');
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        if (filter === 'ALL') return true;
        return ticket.status === filter;
    });

    const getStats = () => {
        const total = tickets.length;
        const open = tickets.filter(t => t.status === 'OPEN').length;
        const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
        const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
        return { total, open, inProgress, resolved };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading tickets...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button className="btn btn-primary" onClick={fetchTickets}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="ticket-list-page">
            <div className="page-header">
                <h1>Ticket Dashboard</h1>
                <Link to="/create" className="btn btn-primary">
                    Create New Ticket
                </Link>
            </div>

            <div className="stats-grid grid grid-4">
                <div className="stat-card card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Tickets</div>
                </div>
                <div className="stat-card card">
                    <div className="stat-value">{stats.open}</div>
                    <div className="stat-label">Open</div>
                </div>
                <div className="stat-card card">
                    <div className="stat-value">{stats.inProgress}</div>
                    <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card card">
                    <div className="stat-value">{stats.resolved}</div>
                    <div className="stat-label">Resolved</div>
                </div>
            </div>

            <div className="filters">
                <div className="filter-buttons">
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                        <button
                            key={status}
                            className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(status)}
                        >
                            {status === 'ALL' ? 'All Tickets' : status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="tickets-grid grid grid-3">
                {filteredTickets.length === 0 ? (
                    <div className="empty-state">
                        <p>No tickets found</p>
                    </div>
                ) : (
                    filteredTickets.map(ticket => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))
                )}
            </div>
        </div>
    );
};

export default TicketList;