import { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../utils/axios-instance";
import { getUser } from "../services/storage";

// ─── Palette
const C = {
  teal:   "#14b8a6", tealDk: "#0f766e",
  amber:  "#f59e0b", rose:   "#f43f5e",
  indigo: "#6366f1", sky:    "#38bdf8",
  slate:  "#64748b", green:  "#22c55e",
};

// ─── Helpers
const fmt     = (v) => (v == null || v === "") ? "—" : String(v);

// Safe date formatter — handles "YYYY-MM-DD" LocalDate without UTC shift
const fmtDate = (s) => {
  if (!s) return "—";
  const match = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    return d.toLocaleDateString("en-GB", { dateStyle: "medium" });
  }
  // fallback for full ISO datetimes (tickets createdAt etc.)
  const d = new Date(s);
  return isNaN(d) ? String(s) : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
};

// Format LocalTime "HH:mm:ss" → "HH:mm"
const fmtTime = (t) => (t ? String(t).slice(0, 5) : "—");

const today   = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };

// inRange uses regex parse to avoid UTC shift on LocalDate strings
const inRange = (s, from, to) => {
  if (!s) return false;
  // Extract YYYY-MM-DD portion regardless of whether it's a date or datetime string
  const match = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return false;
  const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  if (isNaN(d)) return false;
  const fromOk = !from || d >= new Date(from);
  const toOk   = !to   || d <= new Date(to);
  return fromOk && toOk;
};

// ─── CSV download
const downloadCSV = (filename, headers, rows) => {
  const esc = (v) => { const s = fmt(v); return (s.includes(",") || s.includes('"') || s.includes("\n")) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers, ...rows].map(r => r.map(esc).join(",")).join("\n");
  const a   = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })), download: filename });
  a.click(); URL.revokeObjectURL(a.href);
};

// ─── PDF export
const exportPDF = ({ title, period, statusFilter, headers, rows, filename, accent }) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFillColor(accent);
  doc.rect(0, 0, 297, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text("Smart Campus Operations Hub", 12, 9);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text(title, 12, 16);

  doc.setTextColor(100, 116, 139); doc.setFontSize(7.5);
  doc.text(
    `Period: ${period}   |   Status: ${statusFilter}   |   Generated: ${new Date().toLocaleString("en-GB")}   |   ${rows.length} records`,
    12, 27
  );

  autoTable(doc, {
    startY: 31,
    head: [headers], body: rows,
    styles: { fontSize: 7.5, cellPadding: 2.2, overflow: "linebreak" },
    headStyles: { fillColor: accent, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    tableLineColor: [226, 232, 240], tableLineWidth: 0.1,
    margin: { left: 10, right: 10 },
  });

  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(6.5); doc.setTextColor(160);
    doc.text(`Page ${i} of ${pages}`, 285, 205, { align: "right" });
    doc.text("Confidential — Smart Campus Operations Hub", 12, 205);
  }
  doc.save(filename);
};

// ─── Shared UI atoms
function SectionHead({ label, accent }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-7 rounded-full" style={{ background: accent }} />
      <h2 className="text-sm font-bold tracking-widest uppercase" style={{ color: accent }}>{label}</h2>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-5 py-4 flex flex-col gap-1">
      <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{label}</span>
      <span className="text-3xl font-black" style={{ color }}>{value}</span>
    </div>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <input type="date" value={value} onChange={e => onChange(e.target.value)}
        className="border border-emerald-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white
                   focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
    </div>
  );
}

function StatusSelect({ value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="border border-emerald-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white
                   focus:outline-none focus:ring-2 focus:ring-teal-400 transition min-w-[150px]">
        {options.map(s => <option key={s} value={s}>{s === "ALL" ? "All statuses" : s}</option>)}
      </select>
    </div>
  );
}

function QuickRange({ onSelect }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick range</label>
      <div className="flex gap-2">
        {[{ l: "7d", d: 7 }, { l: "30d", d: 30 }, { l: "90d", d: 90 }, { l: "1y", d: 365 }].map(p => (
          <button key={p.l} onClick={() => onSelect(p.d)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-200
                       text-slate-500 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition bg-white">
            {p.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExportBtn({ label, icon, onClick, accent, disabled, spinning }) {
  return (
    <button onClick={onClick} disabled={disabled || spinning}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm
                 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
      style={{ background: accent, color: "#fff" }}>
      {spinning
        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        : <span>{icon}</span>}
      {label}
    </button>
  );
}

function PreviewTable({ headers, rows, accent }) {
  if (!rows.length) return (
    <div className="text-center py-14 text-slate-400 text-sm">No records match the selected filters.</div>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-emerald-100">
      <table className="w-full text-xs">
        <thead>
          <tr style={{ background: accent }}>
            {headers.map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-white font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-[200px] truncate" title={String(cell ?? "")}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 50 && (
        <p className="text-center py-2 text-xs text-slate-400 bg-slate-50 border-t border-emerald-100">
          Showing first 50 of {rows.length} records — export to see all
        </p>
      )}
    </div>
  );
}

function FiltersCard({ accent, children }) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
      <SectionHead label="Filters & Export" accent={accent} />
      <div className="flex flex-wrap gap-4 items-end">{children}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Bookings
// ══════════════════════════════════════════════════════════════════════════════
function BookingsTab({ bookings }) {
  const [from,   setFrom]   = useState(daysAgo(90));
  const [to,     setTo]     = useState(today());
  const [status, setStatus] = useState("ALL");
  const [spin,   setSpin]   = useState(null);

  // Filter on bookingDate (LocalDate "YYYY-MM-DD"), NOT startTime (LocalTime "HH:mm:ss")
  const rows = useMemo(() =>
    bookings.filter(b => {
      const dateOk   = inRange(b.bookingDate, from, to);
      const statusOk = status === "ALL" || b.status === status;
      return dateOk && statusOk;
    }), [bookings, from, to, status]);

  const toRow = (b) => [
    fmt(b.id),
    fmt(b.resourceName || b.resourceId),
    fmt(b.userId),
    fmt(b.purpose),
    fmt(b.status),
    fmtDate(b.bookingDate),          // LocalDate → readable date
    fmtTime(b.startTime),            // LocalTime "HH:mm:ss" → "HH:mm"
    fmtTime(b.endTime),
    fmt(b.expectedAttendees),
    fmt(b.rejectionReason || b.cancelReason || b.reason),
  ];

  const handleCSV = () => {
    setSpin("csv");
    downloadCSV(
      `bookings-${today()}.csv`,
      ["Booking ID", "Resource", "User ID", "Purpose", "Status", "Date", "Start Time", "End Time", "Attendees", "Reason"],
      rows.map(toRow)
    );
    setTimeout(() => setSpin(null), 600);
  };

  const handlePDF = () => {
    setSpin("pdf");
    exportPDF({
      title: "Booking History Report",
      period: `${from} → ${to}`,
      statusFilter: status,
      headers: ["ID", "Resource", "User", "Purpose", "Status", "Date", "Start", "End", "Attendees", "Reason"],
      rows: rows.map(toRow),
      filename: `bookings-${today()}.pdf`,
      accent: "#0d9488",
    });
    setTimeout(() => setSpin(null), 600);
  };

  const approved = rows.filter(b => b.status === "APPROVED").length;
  const pending  = rows.filter(b => b.status === "PENDING").length;
  const rejected = rows.filter(b => b.status === "REJECTED").length;
  const rate     = rows.length ? Math.round(approved / rows.length * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total"    value={rows.length}              color={C.indigo} />
        <StatCard label="Approved" value={`${approved} (${rate}%)`} color={C.green}  />
        <StatCard label="Pending"  value={pending}                  color={C.amber}  />
        <StatCard label="Rejected" value={rejected}                 color={C.rose}   />
      </div>

      <FiltersCard accent={C.teal}>
        <DateInput label="From" value={from} onChange={setFrom} />
        <DateInput label="To"   value={to}   onChange={setTo}   />
        <QuickRange onSelect={d => { setFrom(daysAgo(d)); setTo(today()); }} />
        <StatusSelect value={status} onChange={setStatus}
          options={["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"]} />
        <div className="flex-1" />
        <ExportBtn label="CSV" icon="📊" onClick={handleCSV} accent={C.tealDk} disabled={!rows.length} spinning={spin === "csv"} />
        <ExportBtn label="PDF" icon="📄" onClick={handlePDF} accent={C.tealDk} disabled={!rows.length} spinning={spin === "pdf"} />
      </FiltersCard>

      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <SectionHead label="Booking History Preview" accent={C.teal} />
          <span className="text-xs text-slate-400 -mt-3">{rows.length} record{rows.length !== 1 ? "s" : ""} matched</span>
        </div>
        <PreviewTable
          headers={["ID", "Resource", "User", "Purpose", "Status", "Date", "Start", "End", "Attendees", "Reason"]}
          rows={rows.map(toRow)}
          accent={C.tealDk}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Tickets
// ══════════════════════════════════════════════════════════════════════════════
function TicketsTab({ tickets }) {
  const [from,     setFrom]     = useState(daysAgo(90));
  const [to,       setTo]       = useState(today());
  const [status,   setStatus]   = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [spin,     setSpin]     = useState(null);

  const rows = useMemo(() =>
    tickets.filter(t => {
      const dateOk     = inRange(t.createdAt, from, to);
      const statusOk   = status   === "ALL" || t.status   === status;
      const priorityOk = priority === "ALL" || t.priority === priority;
      return dateOk && statusOk && priorityOk;
    }), [tickets, from, to, status, priority]);

  const toRow = (t) => [
    fmt(t.id), fmt(t.title), fmt(t.category), fmt(t.priority),
    fmt(t.status), fmt(t.reporterName || t.userId),
    fmt(t.assignedTo), fmtDate(t.createdAt), fmtDate(t.resolvedAt || t.updatedAt),
    fmt(t.resolutionNotes),
  ];
  const toPDFRow = (t) => toRow(t).slice(0, 9);

  const handleCSV = () => {
    setSpin("csv");
    downloadCSV(
      `tickets-${today()}.csv`,
      ["Ticket ID", "Title", "Category", "Priority", "Status", "Reporter", "Assigned To", "Created", "Resolved", "Resolution Notes"],
      rows.map(toRow)
    );
    setTimeout(() => setSpin(null), 600);
  };

  const handlePDF = () => {
    setSpin("pdf");
    exportPDF({
      title: "Incident Summary Report",
      period: `${from} → ${to}`,
      statusFilter: `Status: ${status}  Priority: ${priority}`,
      headers: ["ID", "Title", "Category", "Priority", "Status", "Reporter", "Assigned", "Created", "Resolved"],
      rows: rows.map(toPDFRow),
      filename: `tickets-${today()}.pdf`,
      accent: "#0d9488",
    });
    setTimeout(() => setSpin(null), 600);
  };

  const open       = rows.filter(t => t.status === "OPEN").length;
  const inProgress = rows.filter(t => t.status === "IN_PROGRESS").length;
  const resolved   = rows.filter(t => ["RESOLVED", "CLOSED"].includes(t.status)).length;
  const resRate    = rows.length ? Math.round(resolved / rows.length * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total"           value={rows.length}                color={C.amber}  />
        <StatCard label="Open"            value={open}                       color={C.rose}   />
        <StatCard label="In Progress"     value={inProgress}                 color={C.sky}    />
        <StatCard label="Resolved/Closed" value={`${resolved} (${resRate}%)`} color={C.green} />
      </div>

      <FiltersCard accent={C.teal}>
        <DateInput label="From" value={from} onChange={setFrom} />
        <DateInput label="To"   value={to}   onChange={setTo}   />
        <QuickRange onSelect={d => { setFrom(daysAgo(d)); setTo(today()); }} />
        <StatusSelect value={status} onChange={setStatus}
          options={["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"]} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}
            className="border border-emerald-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white
                       focus:outline-none focus:ring-2 focus:ring-teal-400 transition min-w-[130px]">
            {["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map(p => (
              <option key={p} value={p}>{p === "ALL" ? "All priorities" : p}</option>
            ))}
          </select>
        </div>
        <div className="flex-1" />
        <ExportBtn label="CSV" icon="📊" onClick={handleCSV} accent={C.tealDk}  disabled={!rows.length} spinning={spin === "csv"} />
        <ExportBtn label="PDF" icon="📄" onClick={handlePDF} accent={C.tealDk} disabled={!rows.length} spinning={spin === "pdf"} />
      </FiltersCard>

      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <SectionHead label="Incident Summary Preview" accent={C.tealDk} />
          <span className="text-xs text-slate-400 -mt-3">{rows.length} record{rows.length !== 1 ? "s" : ""} matched</span>
        </div>
        <PreviewTable
          headers={["ID", "Title", "Category", "Priority", "Status", "Reporter", "Assigned", "Created", "Resolved"]}
          rows={rows.map(toPDFRow)}
          accent={C.tealDk}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Resources
// ══════════════════════════════════════════════════════════════════════════════
function ResourcesTab({ resources, bookings }) {
  const [status, setStatus] = useState("ALL");
  const [type,   setType]   = useState("ALL");
  const [spin,   setSpin]   = useState(null);

  const allTypes = useMemo(() => ["ALL", ...new Set(resources.map(r => r.type).filter(Boolean))], [resources]);

  const rows = useMemo(() =>
    resources.filter(r => {
      const statusOk = status === "ALL" || r.status === status;
      const typeOk   = type   === "ALL" || r.type   === type;
      return statusOk && typeOk;
    }), [resources, status, type]);

  const bookingCount = (r) =>
    bookings.filter(b => b.resourceId === r.id || b.resourceName === r.name).length;

  const toRow = (r) => [
    fmt(r.id), fmt(r.name), fmt(r.type), fmt(r.location),
    fmt(r.capacity), fmt(r.status),
    fmt(r.availabilityWindows || r.availability),
    bookingCount(r),
  ];

  const handleCSV = () => {
    setSpin("csv");
    downloadCSV(
      `resources-${today()}.csv`,
      ["Resource ID", "Name", "Type", "Location", "Capacity", "Status", "Availability", "Total Bookings"],
      rows.map(toRow)
    );
    setTimeout(() => setSpin(null), 600);
  };

  const handlePDF = () => {
    setSpin("pdf");
    exportPDF({
      title: "Resource Utilization Report",
      period: "All time",
      statusFilter: `Status: ${status}  Type: ${type}`,
      headers: ["ID", "Name", "Type", "Location", "Capacity", "Status", "Availability", "Bookings"],
      rows: rows.map(toRow),
      filename: `resources-${today()}.pdf`,
      accent: "#0d9488",
    });
    setTimeout(() => setSpin(null), 600);
  };

  const available = rows.filter(r => ["AVAILABLE", "ACTIVE"].includes(r.status)).length;
  const maint     = rows.filter(r => ["MAINTENANCE", "OUT_OF_SERVICE"].includes(r.status)).length;
  const totalCap  = rows.reduce((s, r) => s + (r.capacity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Resources" value={rows.length} color={C.teal}   />
        <StatCard label="Available"       value={available}   color={C.green}  />
        <StatCard label="In Maintenance"  value={maint}       color={C.rose}   />
        <StatCard label="Total Capacity"  value={totalCap}    color={C.indigo} />
      </div>

      <FiltersCard accent={C.teal}>
        <StatusSelect value={status} onChange={setStatus}
          options={["ALL", "AVAILABLE", "ACTIVE", "OCCUPIED", "MAINTENANCE", "OUT_OF_SERVICE"]} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="border border-emerald-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white
                       focus:outline-none focus:ring-2 focus:ring-teal-400 transition min-w-[150px]">
            {allTypes.map(t => <option key={t} value={t}>{t === "ALL" ? "All types" : t}</option>)}
          </select>
        </div>
        <div className="flex-1" />
        <ExportBtn label="CSV" icon="📊" onClick={handleCSV} accent={C.teal}   disabled={!rows.length} spinning={spin === "csv"} />
        <ExportBtn label="PDF" icon="📄" onClick={handlePDF} accent={C.tealDk} disabled={!rows.length} spinning={spin === "pdf"} />
      </FiltersCard>

      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
        <SectionHead label="Utilization Summary" accent={C.teal} />
        <div className="space-y-3">
          {rows.map(r => {
            const bkCnt  = bookingCount(r);
            const maxBk  = Math.max(...rows.map(x => bookingCount(x)), 1);
            const pct    = Math.round(bkCnt / maxBk * 100);
            const isAvail = ["AVAILABLE", "ACTIVE"].includes(r.status);
            return (
              <div key={r.id} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: isAvail ? C.green : C.rose }} />
                <span className="w-44 text-xs text-slate-600 truncate shrink-0" title={r.name}>{r.name || r.id}</span>
                <span className="w-20 text-xs text-slate-400 shrink-0">{r.type || "—"}</span>
                <div className="flex-1 bg-emerald-50 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: C.teal }} />
                </div>
                <span className="w-20 text-xs text-slate-500 text-right shrink-0">{bkCnt} booking{bkCnt !== 1 ? "s" : ""}</span>
              </div>
            );
          })}
          {rows.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-8">No resources match the selected filters.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <SectionHead label="Resource Utilization Preview" accent={C.tealDk} />
          <span className="text-xs text-slate-400 -mt-3">{rows.length} record{rows.length !== 1 ? "s" : ""} matched</span>
        </div>
        <PreviewTable
          headers={["ID", "Name", "Type", "Location", "Capacity", "Status", "Availability", "Bookings"]}
          rows={rows.map(toRow)}
          accent={C.tealDk}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Root page
// ══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "bookings",  label: "Booking History",      icon: "📅", accent: C.teal },
  { id: "tickets",   label: "Incident Summary",     icon: "🔧", accent: C.teal },
  { id: "resources", label: "Resource Utilization", icon: "🏛️", accent: C.teal },
];

export default function ExportReports() {
  const [resources, setResources] = useState([]);
  const [bookings,  setBookings]  = useState([]);
  const [tickets,   setTickets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    const user = getUser() || {};
    Promise.all([
      axiosInstance.get("/resources").then(r => r.data),
      axiosInstance.get("/bookings").then(r => r.data),
      axiosInstance.get("/tickets", { headers: { role: user.role || "ADMIN" } }).then(r => r.data),
    ])
      .then(([r, b, t]) => { setResources(r); setBookings(b); setTickets(t); })
      .catch(e => setError(e?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-teal-700 font-semibold text-sm">Loading report data…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-rose-500 font-bold">{error}</p>
        <p className="text-slate-400 text-sm mt-2">Ensure your backend is running on the correct port.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">

      {/* Page header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-teal-800 tracking-tight">Export Reports</h1>
            <p className="text-slate-400 text-sm mt-1">Filter, preview and download operational data as PDF or CSV</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-emerald-100 rounded-2xl px-4 py-2 shadow-sm">
            <span className="text-xs text-slate-400">Snapshot</span>
            <span className="text-xs font-bold text-teal-700">
              {new Date().toLocaleDateString("en-GB", { dateStyle: "medium" })}
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-6 mb-6">
        <div className="flex bg-white rounded-2xl border border-emerald-100 shadow-sm p-1.5 gap-1.5 w-fit">
          {TABS.map(t => {
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={active
                  ? { background: t.accent, color: "#fff", boxShadow: "0 2px 8px " + t.accent + "55" }
                  : { color: C.slate }
                }>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 pb-12">
        {activeTab === "bookings"  && <BookingsTab  bookings={bookings} />}
        {activeTab === "tickets"   && <TicketsTab   tickets={tickets}   />}
        {activeTab === "resources" && <ResourcesTab resources={resources} bookings={bookings} />}
      </div>

      {/* Tip */}
      <div className="px-6 pb-12">
        <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4 flex gap-3 items-start">
          <span className="text-lg mt-0.5">💡</span>
          <div>
            <p className="text-sm font-semibold text-teal-800">Export tips</p>
            <p className="text-xs text-teal-600 mt-1 leading-relaxed">
              CSV opens directly in Excel or Google Sheets for further analysis.
              PDFs include a branded header, alternating row shading, and page numbers — ready to share with stakeholders.
              Each tab keeps its own filters independently so you can configure all three before exporting.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
