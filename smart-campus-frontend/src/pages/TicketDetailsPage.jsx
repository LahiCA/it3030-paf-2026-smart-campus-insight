import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PriorityBadge from "../components/PriorityBadge";
import TicketComments from "../components/TicketComments";
import TicketImageUpload from "../components/TicketImageUpload";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { assignTechnician, deleteTicket, getAttachmentUrl, getCurrentUser, getTicket, updateStatus } from "../api/ticketApi";

const STATUS_OPTIONS = ["IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

export default function TicketDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { role, displayId } = getCurrentUser();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusForm, setStatusForm] = useState({ status: "IN_PROGRESS", resolutionNotes: "", rejectionReason: "" });
    const [technicianId, setTechnicianId] = useState("");
    const [busy, setBusy] = useState(false);

    const isAssignedTechnician = role === "TECHNICIAN" && ticket?.assignedTo && ticket.assignedTo === displayId;
    const canManageStatus = role === "ADMIN" || isAssignedTechnician;
    const canAssign = role === "ADMIN";

    const loadTicket = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getTicket(id);
            setTicket(data);
            setStatusForm((current) => ({ ...current, status: getSuggestedNextStatus(data.status) }));
        } catch (apiError) {
            setError(apiError.message || "Failed to load ticket");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTicket();
    }, [id]);

    const nextStatuses = useMemo(() => {
        if (!ticket) return [];
        return STATUS_OPTIONS.filter((status) => {
            if (ticket.status === "OPEN") return status === "IN_PROGRESS" || (role === "ADMIN" && status === "REJECTED");
            if (ticket.status === "IN_PROGRESS") return status === "RESOLVED" || (role === "ADMIN" && status === "REJECTED");
            if (ticket.status === "RESOLVED") return status === "CLOSED";
            return false;
        });
    }, [role, ticket]);

    const handleStatusSubmit = async () => {
        setBusy(true);
        setError("");
        try {
            const updated = await updateStatus(id, statusForm);
            setTicket(updated);
            setStatusForm({ status: getSuggestedNextStatus(updated.status), resolutionNotes: "", rejectionReason: "" });
        } catch (apiError) {
            setError(apiError.message || "Failed to update status");
        } finally {
            setBusy(false);
        }
    };

    const handleAssign = async () => {
        if (!technicianId.trim()) {
            setError("Enter a technician ID before assigning");
            return;
        }
        setBusy(true);
        setError("");
        try {
            const updated = await assignTechnician(id, technicianId.trim());
            setTicket(updated);
            setTechnicianId("");
        } catch (apiError) {
            setError(apiError.message || "Failed to assign technician");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        setBusy(true);
        setError("");
        try {
            await deleteTicket(id);
            navigate("/tickets");
        } catch (apiError) {
            setError(apiError.message || "Failed to delete ticket");
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return <div className="px-4 py-16 text-center text-slate-500">Loading ticket details...</div>;
    }

    if (!ticket) {
        return <div className="px-4 py-16 text-center text-red-600">Ticket not found.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8">
            <div className="mx-auto max-w-7xl">
                <Link to="/tickets" className="mb-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
                    Back to dashboard
                </Link>

                {error ? (
                    <div className="mb-5 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                    <div className="space-y-6">
                        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">{ticket.category}</p>
                                    <h1 className="mt-2 text-3xl font-semibold text-slate-900">{ticket.title}</h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{ticket.description}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <TicketStatusBadge status={ticket.status} />
                                    <PriorityBadge priority={ticket.priority} />
                                </div>
                            </div>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <InfoCard label="Reported by" value={ticket.userDisplayId || ticket.userId} />
                                <InfoCard label="Contact Number" value={ticket.contactNumber || "Not provided"} />
                                <InfoCard label="Assigned to" value={ticket.assignedTo || "Unassigned"} />
                                <InfoCard label="Created" value={formatDate(ticket.createdAt)} />
                                <InfoCard label="Updated" value={formatDate(ticket.updatedAt)} />
                                <InfoCard label="First response" value={formatSla(ticket.createdAt, ticket.firstResponseAt)} />
                                <InfoCard label="Resolution time" value={formatSla(ticket.createdAt, ticket.resolvedAt)} />
                            </div>

                            {ticket.resolutionNotes ? (
                                <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5">
                                    <p className="text-sm font-semibold text-green-800">Resolution notes</p>
                                    <p className="mt-2 text-sm leading-6 text-green-900">{ticket.resolutionNotes}</p>
                                </div>
                            ) : null}

                            {ticket.rejectionReason ? (
                                <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5">
                                    <p className="text-sm font-semibold text-red-800">Rejection reason</p>
                                    <p className="mt-2 text-sm leading-6 text-red-900">{ticket.rejectionReason}</p>
                                </div>
                            ) : null}
                        </section>

                        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Evidence</p>
                                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Attachments</h2>
                                </div>
                                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                                    {ticket.attachments?.length || 0}/3 uploaded
                                </span>
                            </div>

                            {ticket.attachments?.length ? (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {ticket.attachments.map((attachment) => (
                                        <a key={attachment.id} href={getAttachmentUrl(attachment.id)} target="_blank" rel="noreferrer" className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                                            <img src={getAttachmentUrl(attachment.id)} alt={attachment.fileName} className="h-44 w-full object-cover" />
                                            <div className="px-4 py-3 text-sm font-semibold text-slate-700">{attachment.fileName}</div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
                                    No attachments uploaded yet.
                                </div>
                            )}

                            {(ticket.attachments?.length || 0) < 3 ? (
                                <div className="mt-6">
                                    <TicketImageUpload
                                        ticketId={ticket.id}
                                        currentCount={ticket.attachments?.length || 0}
                                        onUploaded={(attachments) => setTicket((current) => ({ ...current, attachments }))}
                                    />
                                </div>
                            ) : null}
                        </section>

                        <TicketComments ticketId={ticket.id} />
                    </div>

                    <aside className="space-y-6">
                        {canManageStatus && nextStatuses.length ? (
                            <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Workflow</p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Update status</h2>
                                <div className="mt-5 space-y-4">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-700">Next status</span>
                                        <select
                                            value={statusForm.status}
                                            onChange={(event) => setStatusForm((current) => ({ ...current, status: event.target.value }))}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                                        >
                                            {nextStatuses.map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </label>

                                    {statusForm.status === "RESOLVED" ? (
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-700">Resolution notes</span>
                                            <textarea
                                                value={statusForm.resolutionNotes}
                                                onChange={(event) => setStatusForm((current) => ({ ...current, resolutionNotes: event.target.value }))}
                                                rows="4"
                                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                                            />
                                        </label>
                                    ) : null}

                                    {statusForm.status === "REJECTED" ? (
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-700">Rejection reason</span>
                                            <textarea
                                                value={statusForm.rejectionReason}
                                                onChange={(event) => setStatusForm((current) => ({ ...current, rejectionReason: event.target.value }))}
                                                rows="4"
                                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                                            />
                                        </label>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={handleStatusSubmit}
                                        disabled={busy}
                                        className="w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-slate-300"
                                    >
                                        Save status
                                    </button>
                                </div>
                            </section>
                        ) : null}

                        {canAssign ? (
                            <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Admin Control</p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Assign technician</h2>
                                <p className="mt-2 text-sm text-slate-500">Use the technician display ID, for example <span className="font-semibold text-slate-700">TEC0001</span>.</p>
                                <input
                                    value={technicianId}
                                    onChange={(event) => setTechnicianId(event.target.value)}
                                    placeholder="TEC0001"
                                    className="mt-5 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
                                />
                                <button
                                    type="button"
                                    onClick={handleAssign}
                                    disabled={busy}
                                    className="mt-4 w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-slate-300"
                                >
                                    Assign
                                </button>
                            </section>
                        ) : null}

                        {canAssign ? (
                            <section className="rounded-[2rem] border border-red-200 bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold text-slate-900">Administrative delete</p>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Remove this incident ticket and all related comments and attachments.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={busy}
                                    className="mt-4 w-full rounded-full bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:bg-slate-300"
                                >
                                    Delete ticket
                                </button>
                            </section>
                        ) : null}
                    </aside>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}

function formatDate(value) {
    return value ? new Date(value).toLocaleString() : "N/A";
}

function formatSla(createdAt, milestoneAt) {
    if (!createdAt || !milestoneAt) return "Pending";
    const start = new Date(createdAt);
    const end = new Date(milestoneAt);
    const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    if (Number.isNaN(totalMinutes) || totalMinutes < 0) return "Pending";
    if (totalMinutes < 1) return "Less than a minute";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
        return minutes > 0
            ? `${hours} hr${hours !== 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`
            : `${hours} hr${hours !== 1 ? "s" : ""}`;
    }
    return `${totalMinutes} min${totalMinutes !== 1 ? "s" : ""}`;
}

function getSuggestedNextStatus(status) {
    if (status === "OPEN") return "IN_PROGRESS";
    if (status === "IN_PROGRESS") return "RESOLVED";
    if (status === "RESOLVED") return "CLOSED";
    return "IN_PROGRESS";
}
