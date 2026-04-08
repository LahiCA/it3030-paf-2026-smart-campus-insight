import { Link, useLocation } from "react-router-dom";

function BWSidebar() {
  const location = useLocation();

  const linkClasses = (path) =>
    `block px-4 py-3 rounded-xl font-medium transition ${
      location.pathname === path
        ? "bg-[var(--pale-teal)] text-[var(--deep-teal)]"
        : "text-white hover:bg-white/10"
    }`;

  return (
    <aside className="w-72 min-h-screen bg-[var(--deep-teal)] text-white p-6">
      <div className="mb-10">
        <h1 className="text-2xl font-bold">Smart Campus</h1>
        <p className="text-sm text-white/70 mt-1">Booking Workflow Module</p>
      </div>

      <nav className="space-y-3">
        <Link to="/" className={linkClasses("/")}>
          Dashboard
        </Link>

        <Link to="/bw-create-booking" className={linkClasses("/bw-create-booking")}>
          Create Booking
        </Link>

        <Link to="/bw-my-bookings" className={linkClasses("/bw-my-bookings")}>
          My Bookings
        </Link>

        <Link to="/bw-admin-bookings" className={linkClasses("/bw-admin-bookings")}>
          Admin Bookings
        </Link>
      </nav>
    </aside>
  );
}

export default BWSidebar;