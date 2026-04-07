const TicketStatusBadge = ({ status }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'OPEN': return 'status-open';
            case 'IN_PROGRESS': return 'status-in_progress';
            case 'RESOLVED': return 'status-resolved';
            case 'CLOSED': return 'status-closed';
            case 'REJECTED': return 'status-rejected';
            default: return 'status-open';
        }
    };

    const formatStatus = (status) => {
        return status.replace('_', ' ');
    };

    return (
        <span className={`status-badge ${getStatusClass(status)}`}>
            {formatStatus(status)}
        </span>
    );
};

export default TicketStatusBadge;