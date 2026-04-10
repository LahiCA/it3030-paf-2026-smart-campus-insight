import { useState, useEffect } from "react";
import BWBookingStatusBadge from "./BWBookingStatusBadge";

function BWAdminBookingTable({
  bookings,
  onApproveBooking,
  onRejectBooking,
  onDeleteBooking,
  actionLoadingId,
  highlightedBookingId
}) {
  const [rejectingId, setRejectingId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (highlightedBookingId) {
      setTimeout(() => {
        const el = document.getElementById(`admin-booking-row-${highlightedBookingId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightedBookingId]);

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
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-x-auto relative">
      
      {/* Visual Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>
      
      <div className="mb-8 border-b border-slate-200/60 pb-6">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <div className="bg-teal-100/50 p-2 rounded-xl text-teal-600 border border-teal-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          Admin Booking Management
        </h2>
        <p className="text-slate-500 mt-2 font-medium">
          Review, approve, and reject incoming booking requests with full oversight.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="font-semibold px-6 py-4 text-xs uppercase tracking-wider text-left">User ID</th>
              <th className="font-semibold px-6 py-4 text-xs uppercase tracking-wider text-left">Resource</th>
              <th className="font-semibold px-6 py-4 text-xs uppercase tracking-wider text-left">Type</th>
              <th className="font-semibold px-6 py-4 text-xs uppercase tracking-wider text-left">Schedule</th>
              <th className="font-semibold px-6 py-4 text-xs uppercase tracking-wider text-left">Status</th>
              <th className="font-semibold px-6 py-4 text-xs uppercase tracking-wider text-left">Purpose</th>
              <th className="font-semibold px-6 py-4 text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  id={`admin-booking-row-${booking.id}`}
                  className={`transition-all duration-500 group align-middle ${
                    highlightedBookingId === booking.id
                      ? "bg-teal-50 ring-2 ring-teal-400 ring-inset"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="px-6 py-5">
                    <span className="font-mono text-sm text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100 font-semibold">{booking.userId}</span>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-800">{booking.resourceName}</td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-medium tracking-wide">{booking.resourceType.replace('_', ' ')}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-700 text-sm whitespace-nowrap">{booking.bookingDate}</span>
                      <span className="text-xs text-slate-500 whitespace-nowrap bg-slate-100 inline-block px-1.5 py-0.5 rounded border border-slate-200 w-fit">{booking.startTime} - {booking.endTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 w-48">
                    <div className="flex flex-col gap-2">
                    <BWBookingStatusBadge status={booking.status} />
                    {booking.status === "REJECTED" && (
                      <p className="text-xs text-red-600 max-w-[150px] bg-red-50 p-2 rounded-md shadow-sm border border-red-100" title={getRemarks(booking)}>
                        <span className="font-semibold block mb-0.5 border-b border-red-200 pb-0.5">Reason:</span>
                        {getRemarks(booking)}
                      </p>
                    )}
                    {booking.status === "CANCELLED" && (
                       <p className="text-xs text-slate-600 max-w-[150px] bg-slate-100 p-2 rounded-md shadow-sm border border-slate-200" title={getRemarks(booking)}>
                         <span className="font-semibold block mb-0.5 border-b border-slate-200 pb-0.5">Cancel Reason:</span>
                         {getRemarks(booking)}
                       </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="max-w-xs text-sm text-slate-600 border border-slate-100 bg-slate-50 rounded-lg p-3">
                    {booking.purpose ? (
                      <p className="line-clamp-3" title={booking.purpose}>{booking.purpose}</p>
                    ) : (
                      <span className="italic text-slate-400">No purpose provided</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-right w-56">
                  {booking.status === "PENDING" && (
                    <div className="flex flex-col gap-2 items-end">
                      {!rejectingId && (
                        <div className="flex gap-2 justify-end w-full">
                          <button
                            onClick={() => onApproveBooking(booking.id)}
                            disabled={actionLoadingId === booking.id}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition transform hover:scale-105 active:scale-95 flex-1 flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                            {actionLoadingId === booking.id ? "Loading..." : "Approve"}
                          </button>

                          <button
                            onClick={() => handleRejectClick(booking.id)}
                            disabled={actionLoadingId === booking.id}
                            className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition flex-1 flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            Reject
                          </button>
                        </div>
                      )}

                      {rejectingId === booking.id && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mt-1 w-full max-w-[280px] shadow-sm transform transition-all origin-top scale-100 opacity-100 duration-200 animate-in slide-in-from-top-4">
                          <p className="text-xs font-bold text-rose-800 mb-2 uppercase tracking-wide">Rejection Reason</p>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Why is this rejected?"
                            rows="2"
                            className="w-full bg-white border border-rose-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 resize-none shadow-inner transition placeholder:text-rose-300 text-slate-700"
                          />

                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleRejectSubmit(booking.id)}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex-1 transition shadow-sm"
                            >
                              Confirm
                            </button>

                            <button
                              onClick={handleCancelReject}
                              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-3 py-1.5 rounded-lg text-xs flex-1 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {booking.status !== "PENDING" && (
                    <div className="flex justify-end items-center gap-2">
                      <span className="text-slate-300 text-sm italic font-medium bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">—</span>
                      <button
                        onClick={() => onDeleteBooking(booking)}
                        disabled={actionLoadingId === booking.id}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                        title="Delete Booking"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}

                  {booking.status === "PENDING" && !rejectingId && (
                    <div className="flex justify-end mt-2">
                       <button
                        onClick={() => onDeleteBooking(booking)}
                        disabled={actionLoadingId === booking.id}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete Request
                      </button>
                    </div>
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
  </div>
  );
}

export default BWAdminBookingTable;