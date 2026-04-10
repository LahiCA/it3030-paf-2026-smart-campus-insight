import { useEffect, useMemo, useState } from "react";
import {
  approveBWBooking,
  getAllBWBookings,
  rejectBWBooking,
} from "../api/bwBookingApi";
import BWAdminBookingTable from "../components/BWAdminBookingTable";

function BWAdminBookingList() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const fetchBookings = async () => {
    try {
      const response = await getAllBWBookings();
      setBookings(response.data);
    } catch (error) {
      setErrorMessage("Failed to load all bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "ALL") return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const handleApproveBooking = async (bookingId) => {
    setSuccessMessage("");
    setErrorMessage("");
    setActionLoadingId(bookingId);

    try {
      await approveBWBooking(bookingId);
      setSuccessMessage("Booking approved successfully.");
      await fetchBookings();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to approve booking"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRejectBooking = async (bookingId, reason) => {
    setSuccessMessage("");
    setErrorMessage("");
    setActionLoadingId(bookingId);

    try {
      await rejectBWBooking(bookingId, reason);
      setSuccessMessage("Booking rejected successfully.");
      await fetchBookings();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to reject booking"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="rounded-xl bg-green-100 text-green-700 px-4 py-3 shadow-sm">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-red-100 text-red-700 px-4 py-3 shadow-sm">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-(--deep-teal)">
              Booking Filters
            </h2>
            <p className="text-slate-500 text-sm">
              Filter all bookings by current workflow status.
            </p>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-(--accent)"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <BWAdminBookingTable
        bookings={filteredBookings}
        onApproveBooking={handleApproveBooking}
        onRejectBooking={handleRejectBooking}
        actionLoadingId={actionLoadingId}
      />
    </div>
  );
}

export default BWAdminBookingList;