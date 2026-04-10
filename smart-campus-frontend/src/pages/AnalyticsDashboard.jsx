import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import axiosInstance from "../utils/axios-instance";
import { getUser } from "../services/storage";

// ─── Theme colour tokens ──────────────────────────────────────────────────────
const C = {
  teal:    "#14b8a6",
  tealLt:  "#ccfbf1",
  tealMd:  "#2dd4bf",
  tealDk:  "#0f766e",
  tealXdk: "#0d9488",
  slate:   "#64748b",
};

const STATUS_COLORS   = { AVAILABLE:"#22c55e", OCCUPIED:"#f59e0b", MAINTENANCE:"#ef4444", OUT_OF_SERVICE:"#64748b", ACTIVE:"#14b8a6" };
const BOOKING_COLORS  = { PENDING:"#f59e0b", APPROVED:"#14b8a6", REJECTED:"#ef4444", CANCELLED:"#64748b" };
const TICKET_COLORS   = { OPEN:"#3b82f6", IN_PROGRESS:"#f59e0b", RESOLVED:"#22c55e", CLOSED:"#64748b", REJECTED:"#ef4444" };
const PRIORITY_COLORS = { LOW:"#14b8a6", MEDIUM:"#f59e0b", HIGH:"#ef4444", CRITICAL:"#7c3aed" };
const BAR_PALETTE     = ["#14b8a6", "#0d9488", "#0f766e", "#99f6e4", "#5eead4", "#2dd4bf", "#ccfbf1", "#0e7490"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const groupBy = (arr, key) =>
  arr.reduce((a, i) => { const k = i[key] || "UNKNOWN"; a[k] = (a[k] || 0) + 1; return a; }, {});

const toChart = (obj, colorMap = {}) =>
  Object.entries(obj).map(([name, value]) => ({ name, value, fill: colorMap[name] || C.teal }));

const groupByMonth = (arr, key) => {
  const m = {};
  const monthKeys = [];
  arr.forEach(i => {
    const raw = i[key];
    if (!raw) return;
    const match = String(raw).match(/^(\d{4})-(\d{2})/);
    if (!match) return;
    const year  = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const label = new Date(year, month, 1)
      .toLocaleString("default", { month: "short", year: "2-digit" });
    if (!m[label]) { m[label] = 0; monthKeys.push({ year, month, label }); }
    m[label]++;
  });
  if (!monthKeys.length) return [];
  monthKeys.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  const orderedLabels = [...new Set(monthKeys.map(k => k.label))];
  if (orderedLabels.length === 1) {
    const { year, month } = monthKeys[0];
    const prev = new Date(year, month - 1, 1).toLocaleString("default", { month: "short", year: "2-digit" });
    const next = new Date(year, month + 1, 1).toLocaleString("default", { month: "short", year: "2-digit" });
    return [
      { month: prev,             count: 0 },
      { month: orderedLabels[0], count: m[orderedLabels[0]] },
      { month: next,             count: 0 },
    ];
  }
  return orderedLabels.map(label => ({ month: label, count: m[label] }));
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = C.teal, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-5 flex flex-col gap-1 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10" style={{ background: accent }} />
      {icon && <span className="absolute top-4 right-5 text-2xl opacity-20">{icon}</span>}
      <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">{label}</span>
      <span className="text-4xl font-black mt-1" style={{ color: accent }}>{value}</span>
      {sub && <span className="text-xs text-slate-400 mt-0.5">{sub}</span>}
    </div>
  );
}

function SectionHeading({ children, accent = C.teal }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 rounded-full" style={{ background: accent }} />
      <h2 className="text-sm font-bold tracking-widest uppercase" style={{ color: accent }}>{children}</h2>
    </div>
  );
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-teal-100 rounded-xl shadow-lg px-4 py-2 text-sm">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.stroke || C.teal }}>
          {p.name || p.dataKey}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function DonutLegend({ data }) {
  return (
    <div className="flex flex-col gap-2 justify-center">
      {data.map(d => (
        <div key={d.name} className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.fill }} />
          <span className="text-slate-500 uppercase tracking-wide">{d.name}</span>
          <span className="ml-auto font-bold text-slate-700">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl border border-teal-100 shadow-sm p-5 ${className}`}>{children}</div>;
}

function Skeleton({ h = "h-40" }) {
  return <div className={`animate-pulse bg-teal-50 rounded-2xl ${h}`} />;
}

// ════════════════════════════════════════════════════════════════════════════
export default function AnalyticsDashboard() {
  const [resources, setResources] = useState([]);
  const [bookings,  setBookings]  = useState([]);
  const [tickets,   setTickets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [tab,       setTab]       = useState("overview");

  useEffect(() => {
    const user = getUser() || {};
    Promise.all([
      axiosInstance.get("/resources").then(r => r.data),
      axiosInstance.get("/bookings").then(r => r.data),
      axiosInstance.get("/tickets", { headers: { role: user.role || "ADMIN" } }).then(r => r.data),
    ])
      .then(([r, b, t]) => { setResources(r); setBookings(b); setTickets(t); })
      .catch(e => setError(e?.message || "Failed to load analytics data"))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived: Resources ────────────────────────────────────────────────────
  const resByStatus   = toChart(groupBy(resources, "status"), STATUS_COLORS);
  const resByType     = toChart(groupBy(resources, "type"), {});
  const totalCapacity = resources.reduce((s, r) => s + (r.capacity || 0), 0);
  const availCount    = resources.filter(r => ["AVAILABLE", "ACTIVE"].includes(r.status)).length;
  const maintCount    = resources.filter(r => ["MAINTENANCE", "OUT_OF_SERVICE"].includes(r.status)).length;
  const capBuckets    = [
    { name: "Small (1–20)",       min: 1,   max: 20 },
    { name: "Medium (21–60)",     min: 21,  max: 60 },
    { name: "Large (61–150)",     min: 61,  max: 150 },
    { name: "Extra Large (150+)", min: 151, max: Infinity },
  ].map(b => ({
    name:  b.name,
    value: resources.filter(r => (r.capacity || 0) >= b.min && (r.capacity || 0) <= b.max).length,
    fill:  C.teal,
  }));

  // ── Derived: Bookings ─────────────────────────────────────────────────────
  const bkByStatus   = toChart(groupBy(bookings, "status"), BOOKING_COLORS);
  const approvedCnt  = bookings.filter(b => b.status === "APPROVED").length;
  const pendingCnt   = bookings.filter(b => b.status === "PENDING").length;
  const rejectedCnt  = bookings.filter(b => b.status === "REJECTED").length;
  const approvalRate = bookings.length ? Math.round(approvedCnt / bookings.length * 100) : 0;
  const bkByMonth    = groupByMonth(bookings, "bookingDate");

  const resBookingMap = {};
  bookings.forEach(b => { const k = b.resourceName || b.resourceId || "Unknown"; resBookingMap[k] = (resBookingMap[k] || 0) + 1; });
  const topResources = Object.entries(resBookingMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 18) + "…" : name, count }));

  const hourMap = Array(24).fill(0);
  bookings.forEach(b => {
    if (!b.startTime) return;
    const hour = parseInt(b.startTime.split(":")[0], 10);
    if (!isNaN(hour) && hour >= 0 && hour < 24) hourMap[hour]++;
  });
  const peakHour = hourMap.indexOf(Math.max(...hourMap));

  // ── Derived: Tickets ──────────────────────────────────────────────────────
  const tkByStatus   = toChart(groupBy(tickets, "status"),   TICKET_COLORS);
  const tkByPriority = toChart(groupBy(tickets, "priority"), PRIORITY_COLORS);
  const tkByCategory = toChart(groupBy(tickets, "category"), {});
  const openCnt      = tickets.filter(t => t.status === "OPEN").length;
  const resolvedCnt  = tickets.filter(t => ["RESOLVED", "CLOSED"].includes(t.status)).length;
  const tkByMonth    = groupByMonth(tickets, "createdAt");

  const resolvedTickets = tickets.filter(t =>
    ["RESOLVED", "CLOSED"].includes(t.status) && t.createdAt && (t.resolvedAt || t.updatedAt)
  );
  const avgResHrs = resolvedTickets.length
    ? Math.round(
        resolvedTickets.reduce((s, t) => {
          const end   = new Date(t.resolvedAt || t.updatedAt);
          const start = new Date(t.createdAt);
          return s + (end - start) / 3600000;
        }, 0) / resolvedTickets.length
      )
    : null;

  const TABS = [
    { id: "overview",  label: "Overview"  },
    { id: "resources", label: "Resources" },
    { id: "bookings",  label: "Bookings"  },
    { id: "tickets",   label: "Tickets"   },
  ];

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-teal-50 to-cyan-50 min-h-screen">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} h="h-28" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} h="h-64" />)}</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-teal-50">
      <div className="bg-white rounded-2xl p-8 shadow text-center">
        <p className="font-bold text-lg" style={{ color: C.red }}>{error}</p>
        <p className="text-slate-400 text-sm mt-2">Check your backend is running.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-white">

      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: C.tealDk }}>Campus Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Live operational intelligence — resources, bookings &amp; maintenance</p>
      </div>

      {/* Tab bar */}
      <div className="px-6 mb-6">
        <div className="inline-flex bg-white rounded-2xl border border-teal-100 shadow-sm p-1 gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={tab === t.id
                ? { background: C.teal, color: "#fff", boxShadow: "0 1px 4px rgba(20,184,166,0.4)" }
                : { color: C.slate }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-12 space-y-6">

        {/* ══════════════════ OVERVIEW ══════════════════ */}
        {tab === "overview" && (<>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Resources"  value={resources.length} sub={`${availCount} available`}                             accent={C.teal}    icon="🏛️" />
            <StatCard label="Total Bookings"   value={bookings.length}  sub={`${approvalRate}% approved`}                           accent={C.tealXdk} icon="📅" />
            <StatCard label="Open Tickets"     value={openCnt}          sub={`${tickets.length} total`}                             accent={C.tealMd}  icon="🔧" />
            <StatCard label="Resolved Tickets" value={resolvedCnt}      sub={avgResHrs != null ? `Avg ${avgResHrs}h` : "—"}         accent={C.tealDk}  icon="✅" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <SectionHeading accent={C.teal}>Booking Trend by Month</SectionHeading>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={bkByMonth}>
                  <defs>
                    <linearGradient id="bkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.teal} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.slate }} />
                  <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="count" stroke={C.teal} fill="url(#bkGrad)" strokeWidth={2} name="Bookings" dot={{ r: 3, fill: C.teal }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionHeading accent={C.tealXdk}>Ticket Trend by Month</SectionHeading>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={tkByMonth}>
                  <defs>
                    <linearGradient id="tkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.tealXdk} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C.tealXdk} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.slate }} />
                  <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="count" stroke={C.tealXdk} fill="url(#tkGrad)" strokeWidth={2} name="Tickets" dot={{ r: 3, fill: C.tealXdk }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <SectionHeading accent={C.teal}>Resource Status</SectionHeading>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={resByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {resByStatus.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip content={<Tip />} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutLegend data={resByStatus} />
              </div>
            </Card>

            <Card>
              <SectionHeading accent={C.tealXdk}>Booking Status</SectionHeading>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={bkByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {bkByStatus.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip content={<Tip />} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutLegend data={bkByStatus} />
              </div>
            </Card>
          </div>
        </>)}

        {/* ══════════════════ RESOURCES ══════════════════ */}
        {tab === "resources" && (<>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Resources" value={resources.length} sub="All registered assets"                                                          accent={C.teal}    />
            <StatCard label="Available"       value={availCount}       sub={`${resources.length ? Math.round(availCount / resources.length * 100) : 0}% of total`} accent={C.tealMd}  />
            <StatCard label="Total Capacity"  value={totalCapacity}    sub="Combined seat count"                                                             accent={C.tealXdk} />
            <StatCard label="In Maintenance"  value={maintCount}       sub="Unavailable right now"                                                           accent={C.tealDk}  />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <SectionHeading accent={C.teal}>Resources by Type</SectionHeading>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={resByType} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: C.slate }} width={110} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Count">
                    {resByType.map((_, i) => <Cell key={i} fill={BAR_PALETTE[i % 8]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionHeading accent={C.teal}>Status Breakdown</SectionHeading>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={resByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {resByStatus.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip content={<Tip />} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutLegend data={resByStatus} />
              </div>
            </Card>
          </div>

          <Card>
            <SectionHeading accent={C.teal}>Capacity Distribution</SectionHeading>
            <div className="space-y-3 mt-2">
              {capBuckets.map(b => (
                <div key={b.name} className="flex items-center gap-4">
                  <span className="w-44 text-sm text-slate-500 shrink-0">{b.name}</span>
                  <div className="flex-1 rounded-full h-3 overflow-hidden" style={{ background: C.tealLt }}>
                    <div className="h-3 rounded-full transition-all duration-700"
                      style={{ width: `${resources.length ? (b.value / resources.length) * 100 : 0}%`, background: C.teal }} />
                  </div>
                  <span className="w-6 text-sm font-bold" style={{ color: C.tealDk }}>{b.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </>)}

        {/* ══════════════════ BOOKINGS ══════════════════ */}
        {tab === "bookings" && (<>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Bookings" value={bookings.length} sub="All time"                                                                                       accent={C.teal}    />
            <StatCard label="Approved"       value={approvedCnt}     sub={`${approvalRate}% approval rate`}                                                               accent={C.tealMd}  />
            <StatCard label="Pending Review" value={pendingCnt}      sub="Awaiting admin action"                                                                          accent={C.tealXdk} />
            <StatCard label="Rejected"       value={rejectedCnt}     sub={`${bookings.length ? Math.round(rejectedCnt / bookings.length * 100) : 0}% rejection rate`}    accent={C.tealDk}  />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <SectionHeading accent={C.teal}>Monthly Booking Volume</SectionHeading>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={bkByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.slate }} />
                  <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="count" fill={C.teal} radius={[6, 6, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionHeading accent={C.tealXdk}>Status Breakdown</SectionHeading>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={bkByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {bkByStatus.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip content={<Tip />} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutLegend data={bkByStatus} />
              </div>
            </Card>
          </div>

          <Card>
            <SectionHeading accent={C.teal}>Top Booked Resources</SectionHeading>
            {topResources.length === 0
              ? <p className="text-slate-400 text-sm">No booking data yet.</p>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topResources}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.slate }} />
                    <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Bookings">
                      {topResources.map((_, i) => <Cell key={i} fill={BAR_PALETTE[i % 6]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </Card>

          <Card>
            <SectionHeading accent={C.teal}>Peak Booking Hours</SectionHeading>
            <p className="text-xs text-slate-400 mb-4">
              Busiest hour: <strong style={{ color: C.tealDk }}>{peakHour}:00 – {peakHour + 1}:00</strong> ({hourMap[peakHour]} bookings)
            </p>
            <div className="flex gap-1">
              {hourMap.map((count, h) => {
                const max = Math.max(...hourMap) || 1;
                const intensity = count / max;
                return (
                  <div key={h} title={`${h}:00 — ${count} bookings`} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full rounded" style={{
                      height: 48,
                      background: `rgba(20,184,166,${0.08 + intensity * 0.88})`,
                      border: `1px solid rgba(20,184,166,${0.12 + intensity * 0.4})`,
                    }} />
                    <span className="text-slate-400" style={{ fontSize: 9 }}>{h}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </>)}

        {/* ══════════════════ TICKETS ══════════════════ */}
        {tab === "tickets" && (<>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Tickets"   value={tickets.length} sub="All time"                                                                                    accent={C.teal}    />
            <StatCard label="Open"            value={openCnt}         sub="Needs attention"                                                                             accent={C.tealDk}  />
            <StatCard label="Resolved/Closed" value={resolvedCnt}     sub={`${tickets.length ? Math.round(resolvedCnt / tickets.length * 100) : 0}% resolution rate`}  accent={C.tealMd}  />
            <StatCard label="Avg Resolution"  value={avgResHrs != null ? `${avgResHrs}h` : "—"} sub="Open → Resolved"                                                  accent={C.tealXdk} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <SectionHeading accent={C.teal}>Status Breakdown</SectionHeading>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={tkByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {tkByStatus.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip content={<Tip />} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutLegend data={tkByStatus} />
              </div>
            </Card>

            <Card>
              <SectionHeading accent={C.tealDk}>Priority Distribution</SectionHeading>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tkByPriority}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.slate }} />
                  <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Tickets">
                    {tkByPriority.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <SectionHeading accent={C.tealXdk}>Monthly Ticket Volume</SectionHeading>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={tkByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.slate }} />
                  <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="count" fill={C.tealXdk} radius={[6, 6, 0, 0]} name="Tickets" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionHeading accent={C.tealMd}>Tickets by Category</SectionHeading>
              {tkByCategory.length === 0
                ? <p className="text-slate-400 text-sm">No category data.</p>
                : <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={tkByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: C.slate }} width={120} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Tickets">
                        {tkByCategory.map((_, i) => <Cell key={i} fill={BAR_PALETTE[i % 8]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </Card>
          </div>

          <Card>
            <SectionHeading accent={C.teal}>Resolution Rate by Priority</SectionHeading>
            <div className="space-y-4 mt-2">
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(p => {
                const total    = tickets.filter(t => t.priority === p).length;
                const resolved = tickets.filter(t => t.priority === p && ["RESOLVED", "CLOSED"].includes(t.status)).length;
                const pct      = total ? Math.round((resolved / total) * 100) : 0;
                return (
                  <div key={p} className="flex items-center gap-4">
                    <span className="w-20 text-sm font-semibold shrink-0" style={{ color: PRIORITY_COLORS[p] }}>{p}</span>
                    <div className="flex-1 rounded-full h-3 overflow-hidden" style={{ background: C.tealLt }}>
                      <div className="h-3 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: PRIORITY_COLORS[p] }} />
                    </div>
                    <span className="w-24 text-sm text-slate-500 text-right">{resolved}/{total} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </>)}

      </div>
    </div>
  );
}




// import { useState, useEffect } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, AreaChart, Area,
// } from "recharts";
// import axiosInstance from "../utils/axios-instance";
// import { getUser } from "../services/storage";

// // ─── Colour tokens ────────────────────────────────────────────────────────────
// const C = {
//   teal:   "#0d9488", tealLt: "#14b8a6",
//   amber:  "#f59e0b", rose:   "#f43f5e",
//   indigo: "#6366f1", sky:    "#38bdf8",
//   slate:  "#64748b", green:  "#22c55e",
//   orange: "#f97316", purple: "#a855f7",
// };

// const STATUS_COLORS   = { AVAILABLE:"#22c55e", OCCUPIED:"#f59e0b", MAINTENANCE:"#f43f5e", OUT_OF_SERVICE:"#64748b", ACTIVE:"#0d9488" };
// const BOOKING_COLORS  = { PENDING:"#f59e0b", APPROVED:"#0d9488", REJECTED:"#f43f5e", CANCELLED:"#64748b" };
// const TICKET_COLORS   = { OPEN:"#38bdf8", IN_PROGRESS:"#f59e0b", RESOLVED:"#22c55e", CLOSED:"#64748b", REJECTED:"#f43f5e" };
// const PRIORITY_COLORS = { LOW:"#0d9488", MEDIUM:"#f59e0b", HIGH:"#f43f5e", CRITICAL:"#a855f7" };
// const BAR_PALETTE     = [C.teal,C.indigo,C.amber,C.rose,C.sky,C.green,C.purple,C.orange];

// // ─── Helpers ─────────────────────────────────────────────────────────────────
// const groupBy = (arr, key) =>
//   arr.reduce((a, i) => { const k = i[key]||"UNKNOWN"; a[k]=(a[k]||0)+1; return a; }, {});

// const toChart = (obj, colorMap={}) =>
//   Object.entries(obj).map(([name,value]) => ({ name, value, fill: colorMap[name]||C.teal }));

// const monthLabel = (s) => {
//   if (!s) return null;
//   const d = new Date(s);
//   return isNaN(d) ? null : d.toLocaleString("default", { month: "short", year: "2-digit" });
// };

// const groupByMonth = (arr, key) => {
//   const m = {};
//   const dates = [];
//   arr.forEach(i => {
//     const raw = i[key];
//     if (!raw) return;
//     const d = new Date(raw);
//     if (isNaN(d)) return;
//     dates.push(d);
//     const l = d.toLocaleString("default", { month: "short", year: "2-digit" });
//     m[l] = (m[l] || 0) + 1;
//   });
//   if (!dates.length) return [];
//   dates.sort((a, b) => a - b);
//   const orderedLabels = [...new Set(
//     dates.map(d => d.toLocaleString("default", { month: "short", year: "2-digit" }))
//   )];
//   // Pad with zero months either side when only 1 month exists
//   if (orderedLabels.length === 1) {
//     const d = dates[0];
//     const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1)
//       .toLocaleString("default", { month: "short", year: "2-digit" });
//     const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
//       .toLocaleString("default", { month: "short", year: "2-digit" });
//     return [
//       { month: prev, count: 0 },
//       { month: orderedLabels[0], count: m[orderedLabels[0]] },
//       { month: next, count: 0 },
//     ];
//   }
//   return orderedLabels.map(month => ({ month, count: m[month] || 0 }));
// };


// // ─── Sub-components ───────────────────────────────────────────────────────────
// function StatCard({ label, value, sub, accent=C.teal, icon }) {
//   return (
//     <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 flex flex-col gap-1 relative overflow-hidden">
//       <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5" style={{background:accent}}/>
//       {icon && <span className="absolute top-4 right-5 text-2xl opacity-20">{icon}</span>}
//       <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">{label}</span>
//       <span className="text-4xl font-black mt-1" style={{color:accent}}>{value}</span>
//       {sub && <span className="text-xs text-slate-400 mt-0.5">{sub}</span>}
//     </div>
//   );
// }

// function SectionHeading({ children, accent=C.teal }) {
//   return (
//     <div className="flex items-center gap-3 mb-4">
//       <div className="w-1 h-6 rounded-full" style={{background:accent}}/>
//       <h2 className="text-sm font-bold tracking-widest uppercase" style={{color:accent}}>{children}</h2>
//     </div>
//   );
// }

// function Tip({ active, payload, label }) {
//   if (!active||!payload?.length) return null;
//   return (
//     <div className="bg-white border border-emerald-100 rounded-xl shadow-lg px-4 py-2 text-sm">
//       <p className="font-semibold text-slate-600 mb-1">{label}</p>
//       {payload.map((p,i)=>(
//         <p key={i} style={{color:p.fill||p.stroke||C.teal}}>
//           {p.name||p.dataKey}: <strong>{p.value}</strong>
//         </p>
//       ))}
//     </div>
//   );
// }

// function DonutLegend({ data }) {
//   return (
//     <div className="flex flex-col gap-2 justify-center">
//       {data.map(d=>(
//         <div key={d.name} className="flex items-center gap-2 text-xs">
//           <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:d.fill}}/>
//           <span className="text-slate-500 uppercase tracking-wide">{d.name}</span>
//           <span className="ml-auto font-bold text-slate-700">{d.value}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// function Card({ children, className="" }) {
//   return <div className={`bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 ${className}`}>{children}</div>;
// }

// function Skeleton({ h="h-40" }) {
//   return <div className={`animate-pulse bg-emerald-50 rounded-2xl ${h}`}/>;
// }

// // ════════════════════════════════════════════════════════════════════════════
// export default function AnalyticsDashboard() {
//   const [resources, setResources] = useState([]);
//   const [bookings,  setBookings]  = useState([]);
//   const [tickets,   setTickets]   = useState([]);
//   const [loading,   setLoading]   = useState(true);
//   const [error,     setError]     = useState(null);
//   const [tab,       setTab]       = useState("overview");

//   useEffect(() => {
//     const user = getUser()||{};
//     Promise.all([
//       axiosInstance.get("/resources").then(r=>r.data),
//       axiosInstance.get("/bookings").then(r=>r.data),
//       axiosInstance.get("/tickets", { headers:{ role: user.role||"ADMIN" } }).then(r=>r.data),
//     ])
//     .then(([r,b,t]) => { setResources(r); setBookings(b); setTickets(t); })
//     .catch(e => setError(e?.message||"Failed to load analytics data"))
//     .finally(()=>setLoading(false));
//   }, []);

//   // ── Derived: Resources ───────────────────────────────────────────────────
//   const resByStatus   = toChart(groupBy(resources,"status"), STATUS_COLORS);
//   const resByType     = toChart(groupBy(resources,"type"),   {});
//   const totalCapacity = resources.reduce((s,r)=>s+(r.capacity||0),0);
//   const availCount    = resources.filter(r=>["AVAILABLE","ACTIVE"].includes(r.status)).length;
//   const maintCount    = resources.filter(r=>["MAINTENANCE","OUT_OF_SERVICE"].includes(r.status)).length;
//   const capBuckets    = [
//     {name:"Small (1–20)",       min:1,   max:20},
//     {name:"Medium (21–60)",     min:21,  max:60},
//     {name:"Large (61–150)",     min:61,  max:150},
//     {name:"Extra Large (150+)", min:151, max:Infinity},
//   ].map(b=>({
//     name:b.name,
//     value:resources.filter(r=>(r.capacity||0)>=b.min&&(r.capacity||0)<=b.max).length,
//     fill:C.teal,
//   }));

//   // ── Derived: Bookings ────────────────────────────────────────────────────
//   const bkByStatus    = toChart(groupBy(bookings,"status"), BOOKING_COLORS);
//   const approvedCnt   = bookings.filter(b=>b.status==="APPROVED").length;
//   const pendingCnt    = bookings.filter(b=>b.status==="PENDING").length;
//   const rejectedCnt   = bookings.filter(b=>b.status==="REJECTED").length;
//   const approvalRate  = bookings.length ? Math.round(approvedCnt/bookings.length*100) : 0;
//   const bkByMonth     = groupByMonth(bookings, "bookingDate");

//   const resBookingMap = {};
//   bookings.forEach(b=>{ const k=b.resourceName||b.resourceId||"Unknown"; resBookingMap[k]=(resBookingMap[k]||0)+1; });
//   const topResources  = Object.entries(resBookingMap).sort((a,b)=>b[1]-a[1]).slice(0,6)
//     .map(([name,count])=>({ name: name.length>18 ? name.slice(0,18)+"…" : name, count }));

//   const hourMap = Array(24).fill(0);
//   bookings.forEach(b => {
//     if (!b.startTime) return;
//     const hour = parseInt(b.startTime.split(":")[0], 10);
//     if (!isNaN(hour) && hour >= 0 && hour < 24) hourMap[hour]++;
//     }); 
// const peakHour = hourMap.indexOf(Math.max(...hourMap));

//   // ── Derived: Tickets ─────────────────────────────────────────────────────
//   const tkByStatus   = toChart(groupBy(tickets,"status"),   TICKET_COLORS);
//   const tkByPriority = toChart(groupBy(tickets,"priority"), PRIORITY_COLORS);
//   const tkByCategory = toChart(groupBy(tickets,"category"), {});
//   const openCnt      = tickets.filter(t=>t.status==="OPEN").length;
//   const resolvedCnt  = tickets.filter(t=>["RESOLVED","CLOSED"].includes(t.status)).length;
//   const tkByMonth    = groupByMonth(tickets,"createdAt");

//  // AFTER
// const toMs = (v) => {
//   if (!v) return NaN;
//   if (Array.isArray(v)) {
//     // [year, month, day, hour, minute, second?, nano?]
//     const [yr, mo, day, hr = 0, min = 0, sec = 0] = v;
//     return new Date(yr, mo - 1, day, hr, min, sec).getTime();
//   }
//   return new Date(v).getTime();
// };

// const resolvedTickets = tickets.filter(t =>
//   ["RESOLVED", "CLOSED"].includes(t.status) &&
//   t.createdAt &&
//   (t.resolvedAt || t.updatedAt)
// );

// const avgResHrs = resolvedTickets.length
//   ? Math.round(
//       resolvedTickets.reduce((s, t) => {
//         const end = new Date(t.resolvedAt || t.updatedAt);
//         const start = new Date(t.createdAt);
//         return s + (end - start) / 3600000;
//       }, 0) / resolvedTickets.length
//     )
//   : null;

//   const TABS = [
//     {id:"overview",  label:"Overview"},
//     {id:"resources", label:"Resources"},
//     {id:"bookings",  label:"Bookings"},
//     {id:"tickets",   label:"Tickets"},
//   ];

//   // ── Loading / Error ──────────────────────────────────────────────────────
//   if (loading) return (
//     <div className="p-8 space-y-6 bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><Skeleton key={i} h="h-28"/>)}</div>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[...Array(4)].map((_,i)=><Skeleton key={i} h="h-64"/>)}</div>
//     </div>
//   );

//   if (error) return (
//     <div className="flex items-center justify-center min-h-screen bg-emerald-50">
//       <div className="bg-white rounded-2xl p-8 shadow text-center">
//         <p className="text-rose-500 font-bold text-lg">{error}</p>
//         <p className="text-slate-400 text-sm mt-2">Check your backend is running.</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">

//       {/* Header */}
//       <div className="px-6 pt-8 pb-4">
//         <h1 className="text-3xl font-black text-teal-800 tracking-tight">Campus Analytics</h1>
//         <p className="text-slate-400 text-sm mt-1">Live operational intelligence — resources, bookings & maintenance</p>
//       </div>

//       {/* Tab bar */}
//       <div className="px-6 mb-6">
//         <div className="inline-flex bg-white rounded-2xl border border-emerald-100 shadow-sm p-1 gap-1">
//           {TABS.map(t=>(
//             <button key={t.id} onClick={()=>setTab(t.id)}
//               className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
//                 tab===t.id ? "bg-teal-600 text-white shadow" : "text-slate-500 hover:text-teal-700 hover:bg-emerald-50"
//               }`}
//             >{t.label}</button>
//           ))}
//         </div>
//       </div>

//       <div className="px-6 pb-12 space-y-6">

//         {/* ══════════════════ OVERVIEW ══════════════════ */}
//         {tab==="overview" && (<>
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             <StatCard label="Total Resources"  value={resources.length} sub={`${availCount} available`}    accent={C.teal}   icon="🏛️"/>
//             <StatCard label="Total Bookings"   value={bookings.length}  sub={`${approvalRate}% approved`}  accent={C.indigo} icon="📅"/>
//             <StatCard label="Open Tickets"     value={openCnt}           sub={`${tickets.length} total`}    accent={C.amber}  icon="🔧"/>
//             <StatCard label="Resolved Tickets" value={resolvedCnt}       sub={avgResHrs!=null?`Avg ${avgResHrs}h`:"—"} accent={C.green} icon="✅"/>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <SectionHeading accent={C.indigo}>Booking Trend by Month</SectionHeading>
//               <ResponsiveContainer width="100%" height={220}>
//                 <AreaChart data={bkByMonth}>
//                   <defs><linearGradient id="bkGrad" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor={C.indigo} stopOpacity={0.2}/>
//                     <stop offset="95%" stopColor={C.indigo} stopOpacity={0}/>
//                   </linearGradient></defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
//                   <XAxis dataKey="month" tick={{fontSize:11,fill:C.slate}}/>
//                   <YAxis tick={{fontSize:11,fill:C.slate}} allowDecimals={false}/>
//                   <Tooltip content={<Tip/>}/>
//                   <Area type="monotone" dataKey="count" stroke={C.indigo} fill="url(#bkGrad)" strokeWidth={2} name="Bookings" dot={{r:3,fill:C.indigo}}/>
//                 </AreaChart>
//               </ResponsiveContainer>
//             </Card>

//             <Card>
//               <SectionHeading accent={C.amber}>Ticket Trend by Month</SectionHeading>
//               <ResponsiveContainer width="100%" height={220}>
//                 <AreaChart data={tkByMonth}>
//                   <defs><linearGradient id="tkGrad" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%"  stopColor={C.amber} stopOpacity={0.2}/>
//                     <stop offset="95%" stopColor={C.amber} stopOpacity={0}/>
//                   </linearGradient></defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
//                   <XAxis dataKey="month" tick={{fontSize:11,fill:C.slate}}/>
//                   <YAxis tick={{fontSize:11,fill:C.slate}} allowDecimals={false}/>
//                   <Tooltip content={<Tip/>}/>
//                   <Area type="monotone" dataKey="count" stroke={C.amber} fill="url(#tkGrad)" strokeWidth={2} name="Tickets" dot={{r:3,fill:C.amber}}/>
//                 </AreaChart>
//               </ResponsiveContainer>
//             </Card>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <SectionHeading>Resource Status</SectionHeading>
//               <div className="flex items-center gap-6">
//                 <ResponsiveContainer width={180} height={180}>
//                   <PieChart><Pie data={resByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
//                     {resByStatus.map((d,i)=><Cell key={i} fill={d.fill}/>)}
//                   </Pie><Tooltip content={<Tip/>}/></PieChart>
//                 </ResponsiveContainer>
//                 <DonutLegend data={resByStatus}/>
//               </div>
//             </Card>

//             <Card>
//               <SectionHeading accent={C.indigo}>Booking Status</SectionHeading>
//               <div className="flex items-center gap-6">
//                 <ResponsiveContainer width={180} height={180}>
//                   <PieChart><Pie data={bkByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
//                     {bkByStatus.map((d,i)=><Cell key={i} fill={d.fill}/>)}
//                   </Pie><Tooltip content={<Tip/>}/></PieChart>
//                 </ResponsiveContainer>
//                 <DonutLegend data={bkByStatus}/>
//               </div>
//             </Card>
//           </div>
//         </>)}

//         {/* ══════════════════ RESOURCES ══════════════════ */}
//         {tab==="resources" && (<>
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             <StatCard label="Total Resources" value={resources.length} sub="All registered assets"         accent={C.teal}  />
//             <StatCard label="Available"       value={availCount}        sub={`${resources.length?Math.round(availCount/resources.length*100):0}% of total`} accent={C.green}/>
//             <StatCard label="Total Capacity"  value={totalCapacity}     sub="Combined seat count"           accent={C.indigo}/>
//             <StatCard label="In Maintenance"  value={maintCount}        sub="Unavailable right now"         accent={C.rose}  />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <SectionHeading>Resources by Type</SectionHeading>
//               <ResponsiveContainer width="100%" height={260}>
//                 <BarChart data={resByType} layout="vertical" margin={{left:10}}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
//                   <XAxis type="number" tick={{fontSize:11,fill:C.slate}} allowDecimals={false}/>
//                   <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:C.slate}} width={110}/>
//                   <Tooltip content={<Tip/>}/>
//                   <Bar dataKey="value" radius={[0,6,6,0]} name="Count">
//                     {resByType.map((_,i)=><Cell key={i} fill={BAR_PALETTE[i%8]}/>)}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>

//             <Card>
//               <SectionHeading>Status Breakdown</SectionHeading>
//               <div className="flex items-center gap-6">
//                 <ResponsiveContainer width={200} height={200}>
//                   <PieChart><Pie data={resByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
//                     {resByStatus.map((d,i)=><Cell key={i} fill={d.fill}/>)}
//                   </Pie><Tooltip content={<Tip/>}/></PieChart>
//                 </ResponsiveContainer>
//                 <DonutLegend data={resByStatus}/>
//               </div>
//             </Card>
//           </div>

//           <Card>
//             <SectionHeading accent={C.indigo}>Capacity Distribution</SectionHeading>
//             <div className="space-y-3 mt-2">
//               {capBuckets.map(b=>(
//                 <div key={b.name} className="flex items-center gap-4">
//                   <span className="w-44 text-sm text-slate-500 shrink-0">{b.name}</span>
//                   <div className="flex-1 bg-emerald-50 rounded-full h-3 overflow-hidden">
//                     <div className="h-3 rounded-full transition-all duration-700"
//                       style={{width:`${resources.length?(b.value/resources.length)*100:0}%`,background:C.teal}}/>
//                   </div>
//                   <span className="w-6 text-sm font-bold text-teal-700">{b.value}</span>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </>)}

//         {/* ══════════════════ BOOKINGS ══════════════════ */}
//         {tab==="bookings" && (<>
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             <StatCard label="Total Bookings"  value={bookings.length} sub="All time"                                     accent={C.indigo}/>
//             <StatCard label="Approved"        value={approvedCnt}      sub={`${approvalRate}% approval rate`}             accent={C.green} />
//             <StatCard label="Pending Review"  value={pendingCnt}       sub="Awaiting admin action"                        accent={C.amber} />
//             <StatCard label="Rejected"        value={rejectedCnt}      sub={`${bookings.length?Math.round(rejectedCnt/bookings.length*100):0}% rejection rate`} accent={C.rose}/>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <SectionHeading accent={C.indigo}>Monthly Booking Volume</SectionHeading>
//               <ResponsiveContainer width="100%" height={240}>
//                 <BarChart data={bkByMonth}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
//                   <XAxis dataKey="month" tick={{fontSize:11,fill:C.slate}}/>
//                   <YAxis tick={{fontSize:11,fill:C.slate}} allowDecimals={false}/>
//                   <Tooltip content={<Tip/>}/>
//                   <Bar dataKey="count" fill={C.indigo} radius={[6,6,0,0]} name="Bookings"/>
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>

//             <Card>
//               <SectionHeading accent={C.indigo}>Status Breakdown</SectionHeading>
//               <div className="flex items-center gap-6">
//                 <ResponsiveContainer width={200} height={200}>
//                   <PieChart><Pie data={bkByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
//                     {bkByStatus.map((d,i)=><Cell key={i} fill={d.fill}/>)}
//                   </Pie><Tooltip content={<Tip/>}/></PieChart>
//                 </ResponsiveContainer>
//                 <DonutLegend data={bkByStatus}/>
//               </div>
//             </Card>
//           </div>

//           <Card>
//             <SectionHeading accent={C.teal}>Top Booked Resources</SectionHeading>
//             {topResources.length===0
//               ? <p className="text-slate-400 text-sm">No booking data yet.</p>
//               : <ResponsiveContainer width="100%" height={220}>
//                   <BarChart data={topResources}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
//                     <XAxis dataKey="name" tick={{fontSize:11,fill:C.slate}}/>
//                     <YAxis tick={{fontSize:11,fill:C.slate}} allowDecimals={false}/>
//                     <Tooltip content={<Tip/>}/>
//                     <Bar dataKey="count" radius={[6,6,0,0]} name="Bookings">
//                       {topResources.map((_,i)=><Cell key={i} fill={BAR_PALETTE[i%6]}/>)}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//             }
//           </Card>

//           <Card>
//             <SectionHeading accent={C.sky}>Peak Booking Hours</SectionHeading>
//             <p className="text-xs text-slate-400 mb-4">
//               Busiest hour: <strong className="text-teal-700">{peakHour}:00 – {peakHour+1}:00</strong> ({hourMap[peakHour]} bookings)
//             </p>
//             <div className="flex gap-1">
//               {hourMap.map((count,h)=>{
//                 const max=Math.max(...hourMap)||1;
//                 const intensity=count/max;
//                 return (
//                   <div key={h} title={`${h}:00 — ${count} bookings`} className="flex flex-col items-center gap-1 flex-1">
//                     <div className="w-full rounded" style={{
//                       height:48,
//                       background:`rgba(13,148,136,${0.08+intensity*0.9})`,
//                       border:`1px solid rgba(13,148,136,${0.1+intensity*0.4})`,
//                     }}/>
//                     <span className="text-slate-400" style={{fontSize:9}}>{h}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </Card>
//         </>)}

//         {/* ══════════════════ TICKETS ══════════════════ */}
//         {tab==="tickets" && (<>
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             <StatCard label="Total Tickets"   value={tickets.length}   sub="All time"                       accent={C.amber} />
//             <StatCard label="Open"            value={openCnt}           sub="Needs attention"                accent={C.rose}  />
//             <StatCard label="Resolved/Closed" value={resolvedCnt}       sub={`${tickets.length?Math.round(resolvedCnt/tickets.length*100):0}% resolution rate`} accent={C.green}/>
//             <StatCard label="Avg Resolution"  value={avgResHrs!=null?`${avgResHrs}h`:"—"} sub="Open → Resolved" accent={C.indigo}/>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <SectionHeading accent={C.amber}>Status Breakdown</SectionHeading>
//               <div className="flex items-center gap-6">
//                 <ResponsiveContainer width={200} height={200}>
//                   <PieChart><Pie data={tkByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
//                     {tkByStatus.map((d,i)=><Cell key={i} fill={d.fill}/>)}
//                   </Pie><Tooltip content={<Tip/>}/></PieChart>
//                 </ResponsiveContainer>
//                 <DonutLegend data={tkByStatus}/>
//               </div>
//             </Card>

//             <Card>
//               <SectionHeading accent={C.rose}>Priority Distribution</SectionHeading>
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart data={tkByPriority}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
//                   <XAxis dataKey="name" tick={{fontSize:11,fill:C.slate}}/>
//                   <YAxis tick={{fontSize:11,fill:C.slate}} allowDecimals={false}/>
//                   <Tooltip content={<Tip/>}/>
//                   <Bar dataKey="value" radius={[6,6,0,0]} name="Tickets">
//                     {tkByPriority.map((d,i)=><Cell key={i} fill={d.fill}/>)}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <SectionHeading accent={C.amber}>Monthly Ticket Volume</SectionHeading>
//               <ResponsiveContainer width="100%" height={220}>
//                 <BarChart data={tkByMonth}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
//                   <XAxis dataKey="month" tick={{fontSize:11,fill:C.slate}}/>
//                   <YAxis tick={{fontSize:11,fill:C.slate}} allowDecimals={false}/>
//                   <Tooltip content={<Tip/>}/>
//                   <Bar dataKey="count" fill={C.amber} radius={[6,6,0,0]} name="Tickets"/>
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>

//             <Card>
//               <SectionHeading accent={C.purple}>Tickets by Category</SectionHeading>
//               {tkByCategory.length===0
//                 ? <p className="text-slate-400 text-sm">No category data.</p>
//                 : <ResponsiveContainer width="100%" height={220}>
//                     <BarChart data={tkByCategory} layout="vertical">
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
//                       <XAxis type="number" tick={{fontSize:11,fill:C.slate}} allowDecimals={false}/>
//                       <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:C.slate}} width={120}/>
//                       <Tooltip content={<Tip/>}/>
//                       <Bar dataKey="value" radius={[0,6,6,0]} name="Tickets">
//                         {tkByCategory.map((_,i)=><Cell key={i} fill={BAR_PALETTE[i%8]}/>)}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//               }
//             </Card>
//           </div>

//           <Card>
//             <SectionHeading accent={C.green}>Resolution Rate by Priority</SectionHeading>
//             <div className="space-y-4 mt-2">
//               {["LOW","MEDIUM","HIGH","CRITICAL"].map(p=>{
//                 const total    = tickets.filter(t=>t.priority===p).length;
//                 const resolved = tickets.filter(t=>t.priority===p&&["RESOLVED","CLOSED"].includes(t.status)).length;
//                 const pct      = total ? Math.round((resolved/total)*100) : 0;
//                 return (
//                   <div key={p} className="flex items-center gap-4">
//                     <span className="w-20 text-sm font-semibold shrink-0" style={{color:PRIORITY_COLORS[p]}}>{p}</span>
//                     <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
//                       <div className="h-3 rounded-full transition-all duration-700"
//                         style={{width:`${pct}%`,background:PRIORITY_COLORS[p]}}/>
//                     </div>
//                     <span className="w-24 text-sm text-slate-500 text-right">{resolved}/{total} ({pct}%)</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </Card>
//         </>)}

//       </div>
//     </div>
//   );
// }
