import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBWBookingById, checkInBWBooking } from "../api/bwBookingApi";

function BWVerifyBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await getBWBookingById(id);
      setBooking(response.data);
    } catch (err) {
      setError("Failed to fetch booking. It may not exist or the ID is invalid.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await checkInBWBooking(id);
      setSuccess("Booking successfully checked in!");
      await fetchBooking(); // refetch to get updated status
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.error || "Failed to check in booking."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !booking) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Invalid Booking</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button onClick={() => navigate("/bw/my-bookings")} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-teal-700 p-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-1">Verify Booking</h2>
        <p className="text-teal-100">QR Code Scan Result</p>
      </div>

      <div className="p-8">
        {success && (
          <div className="mb-6 rounded-xl bg-green-100 text-green-700 px-4 py-4 shadow-sm text-center flex flex-col items-center">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="font-bold text-lg">{success}</p>
          </div>
        )}
        
        {error && (
           <div className="mb-6 rounded-xl bg-red-100 text-red-700 px-4 py-3 shadow-sm text-center">
             {error}
           </div>
        )}

        <div className="space-y-4 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div>
            <p className="text-sm text-slate-500 font-medium">Booking ID</p>
            <p className="font-mono text-slate-800">{booking.id}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">User</p>
              <p className="font-bold text-slate-800 text-lg">{booking.userId}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Status</p>
              <div className="mt-1">
                {booking.status === 'APPROVED' ? (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 font-bold rounded-lg uppercase">APPROvED (READY)</span>
                ) : booking.status === 'CHECKED_IN' ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 font-bold rounded-lg uppercase">CHECKED IN</span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-3 py-1 font-bold rounded-lg uppercase">{booking.status}</span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 my-2 pt-4 grid grid-cols-2 gap-4">
             <div>
               <p className="text-sm text-slate-500 font-medium">Resource</p>
               <p className="font-bold text-slate-800">{booking.resourceName}</p>
               <p className="text-xs text-slate-500">{booking.resourceType}</p>
             </div>
             <div>
               <p className="text-sm text-slate-500 font-medium">Schedule</p>
               <p className="font-bold text-slate-800">{booking.bookingDate}</p>
               <p className="text-sm text-slate-600">{booking.startTime} - {booking.endTime}</p>
             </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          {booking.status === "APPROVED" ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Confirm Check-in
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => navigate("/bw/my-bookings")}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 w-full py-3 rounded-xl font-bold shadow transition"
            >
              Return to Bookings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BWVerifyBooking;