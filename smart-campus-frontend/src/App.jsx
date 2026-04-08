import { BrowserRouter, Routes, Route } from "react-router-dom";
import BWSidebar from "./layout/BWSidebar";
import BWCreateBooking from "./pages/BWCreateBooking";
import BWMyBookings from "./pages/BWMyBookings";
import BWAdminBookingList from "./pages/BWAdminBookingList";
import CreateTicketPage from "./pages/CreateTicketPage";
import TicketDashboardPage from "./pages/TicketDashboardPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import Navbar from "./layout/Navbar";


function App() {
  return (
    <BrowserRouter>
     <Navbar />
      <div className="flex min-h-screen bg-[var(--surface)]">
        <BWSidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<BWDashboard />} />
            <Route path="/bw-create-booking" element={<BWCreateBooking />} />
            <Route path="/bw-my-bookings" element={<BWMyBookings />} />
            <Route path="/bw-admin-bookings" element={<BWAdminBookingList />} />
              
            <Route path="/tickets" element={<TicketDashboardPage />} />
            <Route path="/tickets/:id" element={<TicketDetailsPage />} />
            <Route path="/create" element={<CreateTicketPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
