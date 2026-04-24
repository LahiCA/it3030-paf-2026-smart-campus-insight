import { useEffect, useState } from "react";
import { cancelBWBooking, deleteBWBooking, getBWBookingsByUser } from "../api/bwBookingApi";
import BWBookingTable from "../components/BWBookingTable";
import { useAuth } from "../context/AuthContext";

/**

 * User dashboard displaying their personal resource bookings.
 * Shows cancellation and checking status to basic roles.
 */
function BWMyBookings() {
  const { user } = useAuth();
  const currentUserId = user?.displayId;

  const [bookings, setBookings] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchBookings = async (userIdToFetch) => {
    if (!userIdToFetch) return;
    try {
      const response = await getBWBookingsByUser(userIdToFetch);
      setBookings(response.data);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Failed to load bookings");
      setBookings([]);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchBookings(currentUserId);
    }
  }, [currentUserId]);

  const handleCancelBooking = async (bookingId, bookingStatus) => {
    // If booking is pending, only ask for confirmation (no reason required)
    let reason = null;
    if (bookingStatus === "PENDING") {
      const ok = window.confirm("Are you sure you want to cancel this pending booking?");
      if (!ok) return;
    } else {
      // APPROVED bookings still require a reason
      reason = window.prompt("Are you sure you want to cancel this booking?\nPlease provide a reason for cancellation:");
      if (reason === null) return;
      if (reason.trim() === "") {
        setErrorMessage("Cancellation reason is required.");
        return;
      }
      reason = reason.trim();
    }

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoadingId(bookingId);

    try {
      await cancelBWBooking(bookingId, reason);
      setSuccessMessage("Booking cancelled successfully.");
      await fetchBookings(currentUserId);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to cancel booking"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    const ok = window.confirm("Delete this booking from your history?");
    if (!ok) return;

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoadingId(bookingId);

    try {
      await deleteBWBooking(bookingId);
      setSuccessMessage("Booking deleted successfully.");
      await fetchBookings(currentUserId);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete booking"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const statusMatches = filterStatus === "ALL" || booking.status === filterStatus;
    const dateMatches = !filterDate || booking.bookingDate === filterDate;
    return statusMatches && dateMatches;
  });

  return (
    <div>
      {successMessage && (
        <div className="mb-4 rounded-xl bg-green-100 text-green-700 px-4 py-3 shadow-sm">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl bg-red-100 text-red-700 px-4 py-3 shadow-sm">
          {errorMessage}
        </div>
      )}

      <div className="mb-4 bg-white rounded-2xl shadow-md p-4 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label htmlFor="my-bookings-filter-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Filter by Date
            </label>
            <input
              id="my-bookings-filter-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="my-bookings-filter-status" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Filter by Status
            </label>
            <select
              id="my-bookings-filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 transition bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="CHECKED_IN">Checked In</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setFilterDate("");
              setFilterStatus("ALL");
            }}
            className="md:w-auto w-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg font-semibold transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {currentUserId ? (
        <BWBookingTable
          bookings={filteredBookings}
          onCancelBooking={handleCancelBooking}
          onDeleteBooking={handleDeleteBooking}
          actionLoadingId={actionLoadingId}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center text-slate-500">
          Unable to fetch your user profile. Please log in again.
        </div>
      )}
    </div>
  );
}

export default BWMyBookings;