import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicket, updateStatus, rejectTicket, assignTech, getImages, deleteImage } from "../api/ticketApi";
import TicketStatusBadge from "../components/TicketStatusBadge";
import CommentSection from "../components/CommentSection";
import ImageUpload from "../components/ImageUpload";
import { deleteTicket } from "../api/ticketApi";

export default function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [assignTechId, setAssignTechId] = useState("");
    const [userRole, setUserRole] = useState("USER");

    const load = async () => {
        try {
            const data = await getTicket(id);
            setTicket(data);
            loadImages();
            // In real app, get role from auth/session
            const role = localStorage.getItem("userRole") || "USER";
            setUserRole(role);
        } catch (err) {
            console.error("Error loading ticket:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadImages = async () => {
        try {
            const res = await getImages(id);
            setImages(res.data || []);
        } catch (err) {
            console.error("Error loading images:", err);
        }
    };

    useEffect(() => {
        load(); // initial load

        const interval = setInterval(() => {
            load(); // refresh every 5 seconds
        }, 5000);

        return () => clearInterval(interval); // cleanup on unmount
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        if (!window.confirm(`Update status to ${newStatus}?`)) return;

        setUpdating(true);
        try {
            await updateStatus(id, newStatus);
            setTicket({ ...ticket, status: newStatus });
            alert("Status updated successfully!");
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert("Please provide a rejection reason");
            return;
        }

        setUpdating(true);
        try {
            await rejectTicket(id, rejectReason);
            setTicket({ ...ticket, status: "REJECTED" });
            setShowRejectForm(false);
            setRejectReason("");
            alert("Ticket rejected successfully!");
        } catch (err) {
            console.error("Error rejecting ticket:", err);
            alert("Failed to reject ticket");
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignTech = async () => {
        if (!assignTechId.trim()) {
            alert("Please enter a technician ID");
            return;
        }

        setUpdating(true);
        try {
            await assignTech(id, assignTechId);
            setTicket({ ...ticket, assignedTo: assignTechId });
            setAssignTechId("");
            alert("Technician assigned successfully!");
        } catch (err) {
            console.error("Error assigning technician:", err);
            alert("Failed to assign technician");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm("Delete this image?")) return;

        try {
            await deleteImage(imageId);
            setImages(images.filter(img => img.id !== imageId));
            alert("Image deleted successfully!");
        } catch (err) {
            console.error("Error deleting image:", err);
            alert("Failed to delete image");
        }
    };

    const handleDeleteTicket = async () => {
        if (!window.confirm("Delete this ticket?")) return;

        try {
            await deleteTicket(id);
            alert("Deleted successfully");
            navigate("/");
        } catch {
            alert("Delete failed");
        }
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading ticket details...</p>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <p className="text-red-600 font-semibold mb-4">Ticket not found</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg"
                    >
                        Back to Tickets
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button & Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate("/")}
                        className="text-teal-600 hover:text-teal-700 font-medium mb-4 flex items-center gap-2"
                    >
                        ← Back to Tickets
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="col-span-2 space-y-6">
                        {/* Ticket Info Card */}
                        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <div className="mt-1">
                                        <TicketStatusBadge status={ticket.status} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Priority</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${ticket.priority === "HIGH"
                                        ? "bg-red-100 text-red-600"
                                        : ticket.priority === "MEDIUM"
                                            ? "bg-yellow-100 text-yellow-600"
                                            : "bg-green-100 text-green-600"
                                        }`}>
                                        {ticket.priority}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Category</p>
                                    <p className="font-semibold text-gray-900 mt-1">{ticket.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Location</p>
                                    <p className="font-semibold text-gray-900 mt-1">{ticket.location || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Resource ID</p>
                                    <p className="font-semibold text-gray-900 mt-1">{ticket.resourceId || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Assigned To</p>
                                    <p className="font-semibold text-gray-900 mt-1">{ticket.assignedTo || "Unassigned"}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Description</p>
                                <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                                    {ticket.description}
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">Contact Details</p>
                                <p className="text-gray-900 mt-1">{ticket.contactDetails || "No contact info"}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600">Created By</p>
                            <p className="font-semibold">{ticket.createdBy}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600">Created At</p>
                            <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                        </div>

                        {ticket.resolutionNote && (
                            <div>
                                <p className="text-green-600 font-semibold">Resolution</p>
                                <p>{ticket.resolutionNote}</p>
                            </div>
                        )}

                        {ticket.rejectionReason && (
                            <div>
                                <p className="text-red-600 font-semibold">Rejected Reason</p>
                                <p>{ticket.rejectionReason}</p>
                            </div>
                        )}

                        {/* Images Section */}
                        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>

                            {images.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {images.map((img) => (
                                        <div key={img.id} className="relative group">
                                            <img
                                                src={`http://localhost:8080/${img.imagePath.split("uploads/")[1]}`}
                                                alt="Attachment"
                                                className="w-full h-40 object-cover rounded-lg border"
                                            />
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 mb-4">No images attached</p>
                            )}

                            {images.length < 3 && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Upload up to 3 images</p>
                                    <ImageUpload ticketId={id} refresh={loadImages} />
                                </div>
                            )}
                        </div>

                        {/* Comments Section */}
                        <CommentSection ticketId={id} />
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {/* Status Actions Card */}
                        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

                            <div className="space-y-2">
                                {ticket.status === "OPEN" && (
                                    <button
                                        onClick={() => handleStatusUpdate("IN_PROGRESS")}
                                        disabled={updating}
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Start Work
                                    </button>
                                )}

                                {ticket.status === "IN_PROGRESS" && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate("RESOLVED")}
                                            disabled={updating}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Mark Resolved
                                        </button>
                                    </>
                                )}

                                {ticket.status === "RESOLVED" && (
                                    <button
                                        onClick={() => handleStatusUpdate("CLOSED")}
                                        disabled={updating}
                                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Close Ticket
                                    </button>
                                )}

                                {userRole === "ADMIN" && ticket.status !== "REJECTED" && ticket.status !== "CLOSED" && (
                                    <>
                                        {!showRejectForm ? (
                                            <button
                                                onClick={() => setShowRejectForm(true)}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
                                            >
                                                Reject Ticket
                                            </button>
                                        ) : (
                                            <div className="space-y-2">
                                                <textarea
                                                    placeholder="Reason for rejection..."
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                                    rows="3"
                                                />
                                                <button
                                                    onClick={handleReject}
                                                    disabled={updating}
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    Confirm Rejection
                                                </button>
                                                <button
                                                    onClick={() => setShowRejectForm(false)}
                                                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Technician Assignment Card (Admin Only) */}
                        {userRole === "ADMIN" && (
                            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Technician</h3>

                                {ticket.assignedTo && (
                                    <p className="text-sm text-green-600 mb-3 font-medium">
                                        ✓ Assigned to: {ticket.assignedTo}
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Technician ID"
                                        value={assignTechId}
                                        onChange={(e) => setAssignTechId(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                                    />
                                    <button
                                        onClick={handleAssignTech}
                                        disabled={updating || !assignTechId.trim()}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>
                        )}

                        {userRole === "ADMIN" && (
                            <button
                                onClick={handleDeleteTicket}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
                            >
                                Delete Ticket
                            </button>
                        )}

                        {/* Summary Card */}
                        <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
                            <h3 className="text-lg font-semibold text-teal-900 mb-3">Summary</h3>
                            <ul className="text-sm text-teal-800 space-y-2">
                                <li>• <strong>Status:</strong> {ticket.status}</li>
                                <li>• <strong>Priority:</strong> {ticket.priority}</li>
                                <li>• <strong>Images:</strong> {images.length}/3</li>
                                <li>• <strong>Category:</strong> {ticket.category}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}