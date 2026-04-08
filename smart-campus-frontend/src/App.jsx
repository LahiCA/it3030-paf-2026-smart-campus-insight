import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./layout/Navbar";
import CreateTicketPage from "./pages/CreateTicketPage";
import TicketDashboardPage from "./pages/TicketDashboardPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/tickets" element={<TicketDashboardPage />} />
        <Route path="/tickets/:id" element={<TicketDetailsPage />} />
        <Route path="/create" element={<CreateTicketPage />} />
      </Routes>
    </BrowserRouter>
  );
}
