import { Link } from 'react-router-dom';
import TicketStatusBadge from './TicketStatusBadge';

const TicketCard = ({ ticket }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getPriorityClass = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            case 'low': return 'priority-low';
            default: return 'priority-low';
        }
    };

    return (
        <div className="ticket-card card">
            <div className="card-header">
                <div className="ticket-header">
                    <h3 className="ticket-title">{ticket.title}</h3>
                    <TicketStatusBadge status={ticket.status} />
                </div>
                <div className="ticket-meta">
                    <span className={`priority-badge status-badge ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority || 'Low'}
                    </span>
                    <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                </div>
            </div>

            <div className="card-body">
                <p className="ticket-description">
                    {ticket.description.length > 100
                        ? `${ticket.description.substring(0, 100)}...`
                        : ticket.description
                    }
                </p>

                <div className="ticket-details">
                    {ticket.category && (
                        <div className="detail-item">
                            <span className="detail-label">Category:</span>
                            <span className="detail-value">{ticket.category}</span>
                        </div>
                    )}
                    {ticket.assignedTo && (
                        <div className="detail-item">
                            <span className="detail-label">Assigned to:</span>
                            <span className="detail-value">{ticket.assignedTo}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-footer">
                <Link to={`/ticket/${ticket.id}`} className="btn btn-secondary">
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default TicketCard;