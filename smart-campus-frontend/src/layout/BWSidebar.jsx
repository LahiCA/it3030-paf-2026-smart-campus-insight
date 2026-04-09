import { Link, useLocation } from "react-router-dom";

function BWSidebar() {
  const location = useLocation();

  const linkClasses = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${location.pathname === path
      ? "bg-[var(--primary-light)] text-[var(--primary-dark)] shadow-md"
      : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-[var(--primary)] to-[var(--primary-dark)] text-white p-6 shadow-xl flex flex-col">

      {/* HEADER */}
      <div className="mb-10 border-b border-white/20 pb-4">
        <h1 className="text-2xl font-bold tracking-wide">
          Smart Campus
        </h1>
        <p className="text-sm text-white/70 mt-1">
          Booking Workflow
        </p>
      </div>

      {/* NAV */}
      <nav className="space-y-2 flex-1">
        <Link to="/" className={linkClasses("/")}>
          🏠 Dashboard
        </Link>

        <Link to="/bw-create-booking" className={linkClasses("/bw-create-booking")}>
          ➕ Create Booking
        </Link>

        <Link to="/bw-my-bookings" className={linkClasses("/bw-my-bookings")}>
          📄 My Bookings
        </Link>

        <Link to="/bw-admin-bookings" className={linkClasses("/bw-admin-bookings")}>
          ⚙️ Admin Bookings
        </Link>
      </nav>

      {/* FOOTER */}
      <div className="mt-10 pt-4 border-t border-white/20 text-xs text-white/60">
        © 2026 Smart Campus
      </div>
    </aside>
  );
}

export default BWSidebar;