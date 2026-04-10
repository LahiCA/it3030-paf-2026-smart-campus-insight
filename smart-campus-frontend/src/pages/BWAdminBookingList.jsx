import { useEffect, useMemo, useState } from "react";
import {
  approveBWBooking,
  getAllBWBookings,
  rejectBWBooking,
} from "../api/bwBookingApi";
import BWAdminBookingTable from "../components/BWAdminBookingTable";
import BWBookingCalendar from "../components/BWBookingCalendar";

function BWAdminBookingList() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [highlightedBookingId, setHighlightedBookingId] = useState(null);

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
    let result = bookings;
    
    if (statusFilter !== "ALL") {
      result = result.filter((booking) => booking.status === statusFilter);
    }
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((booking) => 
        (booking.userId && booking.userId.toLowerCase().includes(lowerQuery)) ||
        (booking.resourceName && booking.resourceName.toLowerCase().includes(lowerQuery)) ||
        (booking.purpose && booking.purpose.toLowerCase().includes(lowerQuery)) ||
        (booking.status && booking.status.toLowerCase().includes(lowerQuery))
      );
    }
    
    return result;
  }, [bookings, statusFilter, searchQuery]);

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
              Filter all bookings by current workflow status or search text.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input
                type="text"
                placeholder="Search user, resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 bg-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition cursor-pointer"
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

      <BWBookingCalendar 
        bookings={filteredBookings} 
        onBookingClick={(id) => setHighlightedBookingId(id)}
      />

      <BWAdminBookingTable
        bookings={filteredBookings}
        onApproveBooking={handleApproveBooking}
        onRejectBooking={handleRejectBooking}
        actionLoadingId={actionLoadingId}
        highlightedBookingId={highlightedBookingId}
      />
    </div>
  );
}

export default BWAdminBookingList;