import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaCheckCircle,
    FaClock,
    FaUser,
    FaArrowRight,
    FaStar,
    FaDownload,
    FaChevronLeft,
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import { getTicket } from '../api/ticketApi';
import TicketStatusBadge from '../components/TicketStatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const TicketTimelinePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadTicket = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getTicket(id);
            setTicket(data);
        } catch (apiError) {
            setError(apiError.message || 'Failed to load ticket');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTicket();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = end - start;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const buildTimeline = () => {
        if (!ticket) return [];

        const events = [];

        // Event 1: Ticket Created
        events.push({
            id: 'created',
            title: 'Ticket Created',
            timestamp: ticket.createdAt,
            description: `Ticket #${ticket.id} was reported by ${ticket.userDisplayId || 'User'}`,
            icon: 'create',
            color: 'teal',
        });

        // Event 2: Assigned to Technician
        if (ticket.assignedTo) {
            events.push({
                id: 'assigned',
                title: 'Assigned to Technician',
                timestamp: ticket.updatedAt,
                description: `Assigned to technician: ${ticket.assignedTo}`,
                icon: 'assigned',
                color: 'blue',
            });
        }

        // Event 3: Status Changes
        if (ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
            events.push({
                id: 'in_progress',
                title: 'Status: In Progress',
                timestamp: ticket.updatedAt,
                description: 'Technician started working on the ticket',
                icon: 'progress',
                color: 'amber',
            });
        }

        if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
            events.push({
                id: 'resolved',
                title: 'Status: Resolved',
                timestamp: ticket.resolvedAt || ticket.updatedAt,
                description: ticket.resolutionNotes || 'Ticket resolved',
                icon: 'resolved',
                color: 'green',
            });
        }

        if (ticket.status === 'CLOSED') {
            events.push({
                id: 'closed',
                title: 'Status: Closed',
                timestamp: ticket.updatedAt,
                description: 'Ticket closed and concluded',
                icon: 'closed',
                color: 'slate',
            });
        }

        if (ticket.status === 'REJECTED') {
            events.push({
                id: 'rejected',
                title: 'Ticket Rejected',
                timestamp: ticket.updatedAt,
                description: ticket.rejectionReason || 'Ticket was rejected',
                icon: 'rejected',
                color: 'red',
            });
        }

        // Event: First Response Time (SLA)
        if (ticket.firstResponseAt) {
            const responseTime = calculateDuration(ticket.createdAt, ticket.firstResponseAt);
            events.push({
                id: 'first_response',
                title: 'First Response (SLA)',
                timestamp: ticket.firstResponseAt,
                description: `First response provided after ${responseTime}`,
                icon: 'sla',
                color: 'purple',
            });
        }

        // Event: Resolution Time (SLA)
        if (ticket.resolvedAt) {
            const resolutionTime = calculateDuration(ticket.createdAt, ticket.resolvedAt);
            events.push({
                id: 'resolution_time',
                title: 'Resolution Time (SLA)',
                timestamp: ticket.resolvedAt,
                description: `Resolved after ${resolutionTime}`,
                icon: 'sla',
                color: 'purple',
            });
        }

        // Event: Rating and Feedback
        if (ticket.rating && ticket.ratedAt) {
            events.push({
                id: 'rated',
                title: 'Customer Feedback',
                timestamp: ticket.ratedAt,
                description: `Rating: ${ticket.rating}/5 stars`,
                icon: 'rating',
                color: 'yellow',
                feedback: ticket.feedback,
            });
        }

        // Sort events by timestamp
        return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    };

    const getIconComponent = (iconType) => {
        const baseClass = 'w-5 h-5';
        switch (iconType) {
            case 'create':
                return <FaClock className={baseClass} />;
            case 'assigned':
                return <FaUser className={baseClass} />;
            case 'progress':
                return <FaArrowRight className={baseClass} />;
            case 'resolved':
                return <FaCheckCircle className={baseClass} />;
            case 'closed':
                return <FaCheckCircle className={baseClass} />;
            case 'rejected':
                return <FaCheckCircle className={baseClass} />;
            case 'sla':
                return <FaClock className={baseClass} />;
            case 'rating':
                return <FaStar className={baseClass} />;
            default:
                return <FaCheckCircle className={baseClass} />;
        }
    };

    const getColorClasses = (color) => {
        const colorMap = {
            teal: {
                bg: 'bg-teal-100',
                text: 'text-teal-600',
                border: 'border-teal-300',
                dot: 'bg-teal-500',
            },
            blue: {
                bg: 'bg-blue-100',
                text: 'text-blue-600',
                border: 'border-blue-300',
                dot: 'bg-blue-500',
            },
            amber: {
                bg: 'bg-amber-100',
                text: 'text-amber-600',
                border: 'border-amber-300',
                dot: 'bg-amber-500',
            },
            green: {
                bg: 'bg-green-100',
                text: 'text-green-600',
                border: 'border-green-300',
                dot: 'bg-green-500',
            },
            slate: {
                bg: 'bg-slate-100',
                text: 'text-slate-600',
                border: 'border-slate-300',
                dot: 'bg-slate-500',
            },
            red: {
                bg: 'bg-red-100',
                text: 'text-red-600',
                border: 'border-red-300',
                dot: 'bg-red-500',
            },
            purple: {
                bg: 'bg-purple-100',
                text: 'text-purple-600',
                border: 'border-purple-300',
                dot: 'bg-purple-500',
            },
            yellow: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-600',
                border: 'border-yellow-300',
                dot: 'bg-yellow-500',
            },
        };
        return colorMap[color] || colorMap.slate;
    };

    const timeline = buildTimeline();

    const downloadReport = () => {
        if (!ticket) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Helper function to add text with line breaks
        const addText = (text, fontSize = 12, fontWeight = 'normal', maxWidth = pageWidth - 40) => {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', fontWeight);

            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                if (yPosition > pageHeight - 30) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, 20, yPosition);
                yPosition += fontSize * 0.4;
            });
            yPosition += 5; // Add some spacing after the text block
        };

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('TICKET ACTIVITY TIMELINE REPORT', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Separator line
        doc.setLineWidth(0.5);
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 10;

        // Ticket Information
        addText('Ticket Information', 14, 'bold');
        addText(`Ticket ID: ${ticket.id}`);
        addText(`Title: ${ticket.title}`);
        addText(`Category: ${ticket.category}`);
        addText(`Priority: ${ticket.priority}`);
        addText(`Status: ${ticket.status}`);
        addText(`Reporter: ${ticket.userDisplayId || ticket.userId}`);
        addText(`Assigned Technician: ${ticket.assignedTo || 'Unassigned'}`);
        yPosition += 10;

        // Timeline Events
        addText('TIMELINE EVENTS', 14, 'bold');
        timeline.forEach((event, index) => {
            addText(`${index + 1}. ${event.title}`, 12, 'bold');
            addText(`   Time: ${formatDate(event.timestamp)}`, 11);
            addText(`   Description: ${event.description}`, 11);
            if (event.feedback) {
                addText(`   Feedback: ${event.feedback}`, 11);
            }
            yPosition += 5;
        });

        // Summary Section
        if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = 20;
        }

        yPosition += 10;
        addText('SUMMARY', 14, 'bold');
        addText(`Created: ${formatDate(ticket.createdAt)}`);
        addText(`First Response: ${ticket.firstResponseAt ? formatDate(ticket.firstResponseAt) : 'N/A'}`);
        addText(`Resolved: ${ticket.resolvedAt ? formatDate(ticket.resolvedAt) : 'N/A'}`);
        addText(`Rating: ${ticket.rating ? `${ticket.rating}/5 stars` : 'Not rated'}`);

        // Footer
        yPosition += 10;
        addText(`Generated on: ${new Date().toLocaleString()}`, 10);

        // Save the PDF
        doc.save(`ticket-timeline-${ticket.id}.pdf`);
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
                    Loading ticket timeline...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
                    {error}
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
                    Ticket not found
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 transition"
                    >
                        <FaChevronLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">{ticket.title}</h1>
                    <p className="mt-2 text-sm text-slate-600">Ticket #{ticket.id}</p>
                </div>
                <button
                    onClick={downloadReport}
                    className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600"
                >
                    <FaDownload className="w-4 h-4" />
                    Download Report
                </button>
            </div>

            {/* Ticket Summary Card */}
            <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-600">Category</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.category}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-600">Priority</p>
                        <div className="mt-1">
                            <PriorityBadge priority={ticket.priority} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-600">Status</p>
                        <div className="mt-1">
                            <TicketStatusBadge status={ticket.status} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-600">Assigned To</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                            {ticket.assignedTo || 'Unassigned'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="mb-8 text-xl font-bold text-slate-900">Activity Timeline</h2>

                {/* Timeline Line and Events */}
                <div className="space-y-6">
                    {timeline.map((event, index) => {
                        const colors = getColorClasses(event.color);
                        const isLast = index === timeline.length - 1;

                        return (
                            <div key={event.id} className="relative flex gap-6">
                                {/* Timeline Line and Dot */}
                                <div className="flex flex-col items-center">
                                    {/* Dot */}
                                    <div
                                        className={`h-4 w-4 rounded-full ${colors.dot} border-4 border-white shadow-sm`}
                                    />
                                    {/* Vertical Line */}
                                    {!isLast && (
                                        <div className="mt-2 w-1 flex-1 bg-gradient-to-b from-slate-300 to-slate-200" />
                                    )}
                                </div>

                                {/* Event Content */}
                                <div className="flex-1 pb-6">
                                    <div
                                        className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-4`}
                                    >
                                        <h3 className={`text-sm font-bold ${colors.text}`}>{event.title}</h3>
                                        <p className="mt-1 text-xs text-gray-600">
                                            {formatDate(event.timestamp)}
                                        </p>
                                        <p className="mt-3 text-sm leading-6 text-slate-700">
                                            {event.description}
                                        </p>
                                        {event.feedback && (
                                            <div className="mt-3 border-t border-slate-300 pt-3">
                                                <p className="text-xs font-semibold text-slate-600">Customer Feedback:</p>
                                                <p className="mt-1 italic text-slate-700">"{event.feedback}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Stats */}
                <div className="mt-8 border-t border-slate-200 pt-8">
                    <h3 className="mb-4 text-lg font-bold text-slate-900">Timeline Summary</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg bg-teal-50 p-4">
                            <p className="text-xs font-semibold uppercase text-teal-600">Created</p>
                            <p className="mt-2 text-sm text-slate-700">{formatDate(ticket.createdAt)}</p>
                        </div>

                        {ticket.firstResponseAt && (
                            <div className="rounded-lg bg-purple-50 p-4">
                                <p className="text-xs font-semibold uppercase text-purple-600">
                                    First Response (SLA)
                                </p>
                                <p className="mt-2 text-sm text-slate-700">
                                    {formatDate(ticket.firstResponseAt)}
                                </p>
                                <p className="mt-1 text-xs text-purple-600">
                                    {calculateDuration(ticket.createdAt, ticket.firstResponseAt)} after creation
                                </p>
                            </div>
                        )}

                        {ticket.resolvedAt && (
                            <div className="rounded-lg bg-green-50 p-4">
                                <p className="text-xs font-semibold uppercase text-green-600">
                                    Resolution Time (SLA)
                                </p>
                                <p className="mt-2 text-sm text-slate-700">
                                    {formatDate(ticket.resolvedAt)}
                                </p>
                                <p className="mt-1 text-xs text-green-600">
                                    {calculateDuration(ticket.createdAt, ticket.resolvedAt)} for resolution
                                </p>
                            </div>
                        )}

                        {ticket.rating && (
                            <div className="rounded-lg bg-yellow-50 p-4">
                                <p className="text-xs font-semibold uppercase text-yellow-600">Rating</p>
                                <div className="mt-2 flex items-center gap-1">
                                    {Array.from({ length: 5 }, (_, index) => (
                                        <span
                                            key={index}
                                            className={
                                                ticket.rating > index ? 'text-yellow-400' : 'text-slate-300'
                                            }
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                    {ticket.rating}/5
                                </p>
                            </div>
                        )}

                        {ticket.ratedAt && (
                            <div className="rounded-lg bg-slate-100 p-4">
                                <p className="text-xs font-semibold uppercase text-slate-600">Rated On</p>
                                <p className="mt-2 text-sm text-slate-700">{formatDate(ticket.ratedAt)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketTimelinePage; 