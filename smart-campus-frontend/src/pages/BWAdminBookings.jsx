import { useState, useEffect } from "react";
import {
  getAllBWBookings,
  approveBWBooking,
  rejectBWBooking,
} from "../api/bwBookingApi";
import BWBookingStatusBadge from "../components/BWBookingStatusBadge";
import { format } from "date-fns";

function BWAdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBWBookings();
      setBookings(response.data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)));
      setError("");
    } catch (err) {
      setError("Failed to fetch bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (id) => {
    if (window.confirm("Are you sure you want to approve this booking?")) {
      try {
        await approveBWBooking(id);
        fetchBookings(); // Refresh the list
      } catch (err) {
        alert("Failed to approve booking.");
      }
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      try {
        await rejectBWBooking(id, reason);
        fetchBookings(); // Refresh the list
      } catch (err) {
        alert("Failed to reject booking.");
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "ALL") return true;
    return booking.status === filter;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-teal-800 mb-4">Admin - All Bookings</h2>

      <div className="flex space-x-2 mb-6 border-b border-slate-200">
        <button onClick={() => setFilter("ALL")} className={`px-4 py-2 font-medium ${filter === 'ALL' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-500'}`}>All</button>
        <button onClick={() => setFilter("PENDING")} className={`px-4 py-2 font-medium ${filter === 'PENDING' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-500'}`}>Pending</button>
        <button onClick={() => setFilter("APPROVED")} className={`px-4 py-2 font-medium ${filter === 'APPROVED' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-500'}`}>Approved</button>
        <button onClick={() => setFilter("REJECTED")} className={`px-4 py-2 font-medium ${filter === 'REJECTED' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-500'}`}>Rejected</button>
        <button onClick={() => setFilter("CANCELLED")} className={`px-4 py-2 font-medium ${filter === 'CANCELLED' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-500'}`}>Cancelled</button>
      </div>

      {loading && <p>Loading bookings...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{booking.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{booking.resourceName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {format(new Date(booking.bookingDate), "MMM d, yyyy")}, {booking.startTime} - {booking.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <BWBookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {booking.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BWAdminBookings;
