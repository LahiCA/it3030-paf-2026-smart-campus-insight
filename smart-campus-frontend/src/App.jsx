import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import TicketList from "./pages/TicketList";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<TicketList />} />
          <Route path="/create" element={<CreateTicket />} />
          <Route path="/ticket/:id" element={<TicketDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;