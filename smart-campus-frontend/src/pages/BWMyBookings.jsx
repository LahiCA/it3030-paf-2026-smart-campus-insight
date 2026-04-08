import { useEffect, useState } from "react";
import { cancelBWBooking, getBWBookingsByUser } from "../api/bwBookingApi";
import BWBookingTable from "../components/BWBookingTable";

function BWMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [inputId, setInputId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputId.trim()) {
      setCurrentUserId(inputId.trim());
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoadingId(bookingId);

    try {
      await cancelBWBooking(bookingId, "Cancelled by user");
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

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1 max-w-sm">
            <label htmlFor="searchUserId" className="block text-sm font-medium text-slate-600 mb-1">
              Enter User ID to view bookings
            </label>
            <input
              type="text"
              id="searchUserId"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="e.g., USER001"
              className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            View Bookings
          </button>
        </form>
      </div>

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

      {currentUserId ? (
        <BWBookingTable
          bookings={bookings}
          onCancelBooking={handleCancelBooking}
          actionLoadingId={actionLoadingId}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center text-slate-500">
          Please enter a User ID above to view your bookings.
        </div>
      )}
    </div>
  );
}

export default BWMyBookings;