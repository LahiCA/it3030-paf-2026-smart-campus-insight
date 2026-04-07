import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketApi } from '../api/ticketApi';

const CreateTicket = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'Low'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.description.trim()) {
            setError('Title and description are required');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const ticketData = {
                ...formData,
                createdBy: 'user123', // In real app, get from auth
                status: 'OPEN'
            };

            await ticketApi.createTicket(ticketData);
            navigate('/');
        } catch (err) {
            setError('Failed to create ticket. Please try again.');
            console.error('Error creating ticket:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-ticket-page">
            <div className="page-header">
                <h1>Create New Ticket</h1>
            </div>

            <div className="form-container card">
                <div className="card-body">
                    {error && (
                        <div className="error-message" style={{
                            color: 'var(--danger)',
                            backgroundColor: '#fef2f2',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '20px',
                            border: '1px solid #fecaca'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="title">
                                Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter ticket title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="description">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-input form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the issue in detail"
                                required
                            />
                        </div>

                        <div className="form-row grid grid-2">
                            <div className="form-group">
                                <label className="form-label" htmlFor="category">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select category</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Facilities">Facilities</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="priority">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    className="form-select"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTicket;