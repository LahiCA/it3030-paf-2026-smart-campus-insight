import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketApi } from '../api/ticketApi';
import CommentSection from '../components/CommentSection';
import ImageUpload from '../components/ImageUpload';
import TicketStatusBadge from '../components/TicketStatusBadge';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const [ticketRes, commentsRes, imagesRes] = await Promise.all([
                ticketApi.getTicketById(id),
                ticketApi.getComments(id),
                ticketApi.getImages(id)
            ]);

            setTicket(ticketRes.data);
            setComments(commentsRes.data);
            setImages(imagesRes.data);
        } catch (err) {
            setError('Failed to load ticket details');
            console.error('Error fetching ticket details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setUpdating(true);
            await ticketApi.updateStatus(id, newStatus);
            setTicket(prev => ({ ...prev, status: newStatus }));
        } catch (err) {
            alert('Failed to update status');
            console.error('Error updating status:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignTechnician = async () => {
        const techId = prompt('Enter technician ID:');
        if (!techId) return;

        try {
            setUpdating(true);
            await ticketApi.assignTechnician(id, techId);
            setTicket(prev => ({ ...prev, assignedTo: techId }));
            alert('Technician assigned successfully');
        } catch (err) {
            alert('Failed to assign technician');
            console.error('Error assigning technician:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteTicket = async () => {
        if (!confirm('Are you sure you want to delete this ticket?')) return;

        try {
            setUpdating(true);
            await ticketApi.deleteTicket(id);
            navigate('/');
        } catch (err) {
            alert('Failed to delete ticket');
            console.error('Error deleting ticket:', err);
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading ticket details...</p>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="error-container">
                <p className="error-message">{error || 'Ticket not found'}</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="ticket-details-page">
            <div className="page-header">
                <button className="btn btn-secondary" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>
                <h1>{ticket.title}</h1>
                <TicketStatusBadge status={ticket.status} />
            </div>

            <div className="ticket-details-content grid grid-2">
                <div className="ticket-info card">
                    <div className="card-header">
                        <h2>Ticket Information</h2>
                    </div>
                    <div className="card-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Status:</span>
                                <TicketStatusBadge status={ticket.status} />
                            </div>
                            <div className="info-item">
                                <span className="info-label">Priority:</span>
                                <span className={`priority-badge status-badge ${getPriorityClass(ticket.priority)}`}>
                                    {ticket.priority || 'Low'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Category:</span>
                                <span>{ticket.category || 'Not specified'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Created by:</span>
                                <span>{ticket.createdBy}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Assigned to:</span>
                                <span>{ticket.assignedTo || 'Unassigned'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Created:</span>
                                <span>{formatDate(ticket.createdAt)}</span>
                            </div>
                        </div>

                        <div className="ticket-description">
                            <h3>Description</h3>
                            <p>{ticket.description}</p>
                        </div>

                        {ticket.resolutionNote && (
                            <div className="resolution-note">
                                <h3>Resolution Note</h3>
                                <p>{ticket.resolutionNote}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="ticket-actions card">
                    <div className="card-header">
                        <h2>Actions</h2>
                    </div>
                    <div className="card-body">
                        <div className="action-buttons">
                            <h3>Update Status</h3>
                            <div className="status-buttons">
                                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(status => (
                                    <button
                                        key={status}
                                        className={`btn ${ticket.status === status ? 'btn-success' : 'btn-secondary'}`}
                                        onClick={() => handleStatusUpdate(status)}
                                        disabled={updating || ticket.status === status}
                                    >
                                        {status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn btn-primary"
                                onClick={handleAssignTechnician}
                                disabled={updating}
                            >
                                Assign Technician
                            </button>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn btn-danger"
                                onClick={handleDeleteTicket}
                                disabled={updating}
                            >
                                Delete Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ticket-sections">
                <ImageUpload ticketId={id} images={images} onImagesUpdate={setImages} />
                <CommentSection ticketId={id} comments={comments} onCommentsUpdate={setComments} />
            </div>
        </div>
    );
};

export default TicketDetails;