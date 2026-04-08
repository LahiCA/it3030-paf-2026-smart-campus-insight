import { useState } from "react";
import BWBookingStatusBadge from "./BWBookingStatusBadge";

function BWAdminBookingTable({
  bookings,
  onApproveBooking,
  onRejectBooking,
  actionLoadingId,
}) {
  const [rejectingId, setRejectingId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const handleRejectClick = (bookingId) => {
    setRejectingId(bookingId);
    setRejectReason("");
  };

  const handleRejectSubmit = (bookingId) => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    onRejectBooking(bookingId, rejectReason);
    setRejectingId("");
    setRejectReason("");
  };

  const handleCancelReject = () => {
    setRejectingId("");
    setRejectReason("");
  };

  const getRemarks = (booking) => {
    if (booking.status === "REJECTED") {
      return booking.rejectionReason || "Rejected";
    }

    if (booking.status === "CANCELLED") {
      return booking.cancelReason || "Cancelled";
    }

    return "—";
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-[var(--deep-teal)] mb-2">
        Admin Booking Management
      </h2>
      <p className="text-slate-500 mb-6">
        Review, approve, and reject booking requests.
      </p>

      <table className="min-w-full">
        <thead>
          <tr className="bg-[var(--pale-teal)] text-[var(--deep-teal)]">
            <th className="text-left px-4 py-3 rounded-l-xl">User ID</th>
            <th className="text-left px-4 py-3">Resource</th>
            <th className="text-left px-4 py-3">Type</th>
            <th className="text-left px-4 py-3">Date</th>
            <th className="text-left px-4 py-3">Time</th>
            <th className="text-left px-4 py-3">Purpose</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Remarks</th>
            <th className="text-left px-4 py-3 rounded-r-xl">Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-slate-100 hover:bg-slate-50 align-top"
              >
                <td className="px-4 py-4">{booking.userId}</td>
                <td className="px-4 py-4">{booking.resourceName}</td>
                <td className="px-4 py-4">{booking.resourceType}</td>
                <td className="px-4 py-4">{booking.bookingDate}</td>
                <td className="px-4 py-4">
                  {booking.startTime} - {booking.endTime}
                </td>
                <td className="px-4 py-4">{booking.purpose}</td>
                <td className="px-4 py-4">
                  <BWBookingStatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 max-w-xs">
                  {getRemarks(booking)}
                </td>
                <td className="px-4 py-4">
                  {booking.status === "PENDING" ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApproveBooking(booking.id)}
                          disabled={actionLoadingId === booking.id}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          {actionLoadingId === booking.id ? "Processing..." : "Approve"}
                        </button>

                        <button
                          onClick={() => handleRejectClick(booking.id)}
                          disabled={actionLoadingId === booking.id}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Reject
                        </button>
                      </div>

                      {rejectingId === booking.id && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-2">
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason"
                            rows="3"
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                          />

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleRejectSubmit(booking.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                            >
                              Confirm Reject
                            </button>

                            <button
                              onClick={handleCancelReject}
                              className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-3 py-2 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">No action</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center py-8 text-slate-500">
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BWAdminBookingTable;