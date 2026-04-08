import { BrowserRouter, Routes, Route } from "react-router-dom";
import BWSidebar from "./layout/BWSidebar";
import BWCreateBooking from "./pages/BWCreateBooking";
import BWMyBookings from "./pages/BWMyBookings";
import BWAdminBookingList from "./pages/BWAdminBookingList";
import BWVerifyBooking from "./pages/BWVerifyBooking";

function BWDashboard() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-3xl font-bold text-[var(--deep-teal)] mb-4">
        Booking Workflow Dashboard
      </h2>
      <p className="text-slate-600">
        Welcome to the Smart Campus booking workflow module.
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[var(--surface)]">
        <BWSidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<BWDashboard />} />
            <Route path="/bw-create-booking" element={<BWCreateBooking />} />
            <Route path="/bw-my-bookings" element={<BWMyBookings />} />
            <Route path="/bw-admin-bookings" element={<BWAdminBookingList />} />
            <Route path="/bw/verify-booking/:id" element={<BWVerifyBooking />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;