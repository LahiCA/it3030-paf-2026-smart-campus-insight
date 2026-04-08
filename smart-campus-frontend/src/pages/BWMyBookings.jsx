import { useEffect, useState } from "react";
import { cancelBWBooking, getBWBookingsByUser } from "../api/bwBookingApi";
import BWBookingTable from "../components/BWBookingTable";

function BWMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const userId = "USER001";

  const fetchBookings = async () => {
    try {
      const response = await getBWBookingsByUser(userId);
      setBookings(response.data);
    } catch (error) {
      setErrorMessage("Failed to load bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoadingId(bookingId);

    try {
      await cancelBWBooking(bookingId, "Cancelled by user");
      setSuccessMessage("Booking cancelled successfully.");
      await fetchBookings();
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

      <BWBookingTable
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
        actionLoadingId={actionLoadingId}
      />
    </div>
  );
}

export default BWMyBookings;