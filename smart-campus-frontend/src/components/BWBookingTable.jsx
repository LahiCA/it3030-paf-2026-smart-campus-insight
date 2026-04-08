import BWBookingStatusBadge from "./BWBookingStatusBadge";

function BWBookingTable({ bookings, onCancelBooking, actionLoadingId }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-[var(--deep-teal)] mb-2">
        My Bookings
      </h2>
      <p className="text-slate-500 mb-6">
        View submitted bookings and their current status.
      </p>

      <table className="min-w-full">
        <thead>
          <tr className="bg-[var(--pale-teal)] text-[var(--deep-teal)]">
            <th className="text-left px-4 py-3 rounded-l-xl">Resource</th>
            <th className="text-left px-4 py-3">Type</th>
            <th className="text-left px-4 py-3">Date</th>
            <th className="text-left px-4 py-3">Time</th>
            <th className="text-left px-4 py-3">Purpose</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3 rounded-r-xl">Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
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
                <td className="px-4 py-4">
                  {booking.status === "APPROVED" ? (
                    <button
                      onClick={() => onCancelBooking(booking.id)}
                      disabled={actionLoadingId === booking.id}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      {actionLoadingId === booking.id ? "Cancelling..." : "Cancel"}
                    </button>
                  ) : (
                    <span className="text-slate-400 text-sm">No action</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-8 text-slate-500">
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BWBookingTable;