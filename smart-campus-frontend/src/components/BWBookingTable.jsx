import BWBookingStatusBadge from "./BWBookingStatusBadge";
import { QRCodeCanvas } from "qrcode.react";

/**
 *
 * Renders the table view for user's personal bookings.
 * Includes status badging, cancellation actions, and QR code generation for approved bookings.
 */
function BWBookingTable({ bookings, onCancelBooking, actionLoadingId }) {
  const getRemarks = (booking) => {
    if (booking.status === "REJECTED") {
      return booking.rejectionReason || "Rejected";
    }

    if (booking.status === "CANCELLED") {
      return booking.cancelReason || "Cancelled";
    }

    return "—";
  };

  const downloadQR = (bookingId, resourceName) => {
    const canvas = document.getElementById(`qr-code-${bookingId}`);
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `SmartCampus-QR-${resourceName.replace(/\s+/g, '-')}-${bookingId.slice(-6)}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-teal-800 mb-1">
            My Bookings
          </h2>
          <p className="text-slate-500">
            Track your resource requests and download check-in passes.
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-teal-50 px-4 py-2 rounded-lg border border-teal-100 text-teal-700 font-medium text-sm">
          Total Bookings: {bookings.length}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Resource</th>
              <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-center">QR Check-in</th>
              <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold shadow-sm">
                        {booking.resourceName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-base">{booking.resourceName}</p>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{booking.resourceType.replace("_", " ")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <p className="font-semibold text-slate-700">{booking.bookingDate}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {booking.startTime} <span className="text-slate-400 mx-1">to</span> {booking.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2 relative">
                      <BWBookingStatusBadge status={booking.status} />
                      {booking.status === "REJECTED" && (
                        <p className="text-xs text-red-600 mt-1 max-w-[180px] bg-red-50 p-2 rounded-md shadow-sm border border-red-100" title={getRemarks(booking)}>
                          <span className="font-semibold block mb-0.5 border-b border-red-200 pb-0.5">Reason:</span>
                          {getRemarks(booking)}
                        </p>
                      )}
                      {booking.status === "CANCELLED" && (
                         <p className="text-xs text-slate-600 mt-1 max-w-[180px] bg-slate-100 p-2 rounded-md shadow-sm border border-slate-200" title={getRemarks(booking)}>
                           <span className="font-semibold block mb-0.5 border-b border-slate-200 pb-0.5">Cancel Reason:</span>
                           {getRemarks(booking)}
                         </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {booking.status === "APPROVED" ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition">
                          <QRCodeCanvas 
                            id={`qr-code-${booking.id}`}
                            value={`${window.location.origin}/bw/verify-booking/${booking.id}`} 
                            size={72} 
                            level={"H"} 
                            includeMargin={true}
                          />
                        </div>
                        <button 
                          onClick={() => downloadQR(booking.id, booking.resourceName)}
                          className="text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full transition flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          Download QR
                        </button>
                      </div>
                    ) : booking.status === "CHECKED_IN" ? (
                       <div className="flex flex-col items-center text-green-500">
                         <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Scanned</span>
                       </div>
                    ) : (
                      <div className="flex justify-center">
                        <span className="text-slate-300 text-xs italic bg-slate-50 px-3 py-1 rounded-full">—</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {booking.status === "APPROVED" || booking.status === "PENDING" ? (
                      <button
                        onClick={() => onCancelBooking(booking.id)}
                        disabled={actionLoadingId === booking.id}
                        className="text-red-500 border border-red-200 hover:text-white hover:bg-red-500 hover:border-red-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                      >
                        {actionLoadingId === booking.id ? (
                          <span className="flex items-center gap-2">
                             <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                             Cancelling
                          </span>
                        ) : "Cancel"}
                      </button>
                    ) : (
                      <span className="text-slate-300 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-16">
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                      <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    </div>
                    <p className="text-lg font-semibold text-slate-600 mb-1">No bookings found</p>
                    <p className="text-slate-400 text-sm">You haven't made any resource requests yet.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BWBookingTable;