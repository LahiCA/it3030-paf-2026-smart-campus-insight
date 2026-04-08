import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import TicketList from "./pages/TicketList";
import TicketDetails from "./pages/TicketDetails";
import CreateTicket from "./pages/CreateTicket";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<TicketList />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
          <Route path="/create" element={<CreateTicket />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

