import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const STATUS_COLORS = {
  AVAILABLE: '#4ade80',
  OCCUPIED:  '#facc15',
  MAINTENANCE: '#f87171',
};

const CAP_BUCKETS = [
  { label: 'Small (1–20)',       min: 1,   max: 20  },
  { label: 'Medium (21–60)',     min: 21,  max: 60  },
  { label: 'Large (61–150)',     min: 61,  max: 150 },
  { label: 'Extra large (150+)', min: 151, max: Infinity },
];
const CAP_COLORS = ['#818cf8', '#6366f1', '#4f46e5', '#3730a3'];

export default function ResourceAnalytics({ resources = [] }) {
  const [open, setOpen] = useState(false);
  const pieRef  = useRef(null);
  const barRef  = useRef(null);
  const pieInst = useRef(null);
  const barInst = useRef(null);

  const stats = useMemo(() => {
    const byStatus = {}, byType = {};
    let totalCap = 0;
    resources.forEach(r => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      byType[r.type]     = (byType[r.type]     || 0) + 1;
      totalCap += r.capacity || 0;
    });
    return { total: resources.length, byStatus, byType, totalCap };
  }, [resources]);

  useEffect(() => {
    if (!open) return;
    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const textColor = isDark ? '#b0b0a8' : '#73726c';

    // Pie chart
    if (pieInst.current) pieInst.current.destroy();
    const sLabels = Object.keys(stats.byStatus);
    pieInst.current = new Chart(pieRef.current, {
      type: 'doughnut',
      data: {
        labels: sLabels,
        datasets: [{
          data: sLabels.map(k => stats.byStatus[k]),
          backgroundColor: sLabels.map(k => STATUS_COLORS[k] || '#94a3b8'),
          borderWidth: 2,
          borderColor: isDark ? '#1a1a18' : '#ffffff',
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} (${Math.round(ctx.parsed / stats.total * 100)}%)` } },
        },
      },
    });

    // Bar chart
    if (barInst.current) barInst.current.destroy();
    const tLabels = Object.keys(stats.byType).map(t => t.replace(/_/g, ' '));
    barInst.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: tLabels,
        datasets: [{
          label: 'Resources',
          data: Object.values(stats.byType),
          backgroundColor: '#6366f1cc',
          borderColor: '#6366f1',
          borderWidth: 1,
          borderRadius: 5,
          hoverBackgroundColor: '#4f46e5',
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        scales: {
          x: { grid: { color: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)' }, ticks: { color: textColor, font: { size: 11 }, stepSize: 1 }, border: { display: false } },
          y: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } }, border: { display: false } },
        },
        plugins: { legend: { display: false } },
      },
    });

    return () => {
      pieInst.current?.destroy();
      barInst.current?.destroy();
    };
  }, [open, stats]);

  const available  = stats.byStatus['AVAILABLE']  || 0;
  const occupied   = stats.byStatus['OCCUPIED']   || 0;
  const maintenance = stats.byStatus['MAINTENANCE'] || 0;
  const utilRate   = stats.total ? Math.round((occupied / stats.total) * 100) : 0;

  const capCounts  = CAP_BUCKETS.map(b => resources.filter(r => r.capacity >= b.min && r.capacity <= b.max).length);
  const capMax     = Math.max(...capCounts, 1);

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

  return (
    <div className="mb-6">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:bg-slate-50 transition text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="8" width="3" height="7" rx="1"/><rect x="6" y="5" width="3" height="10" rx="1"/><rect x="11" y="2" width="3" height="13" rx="1"/>
          </svg>
        </div>
        <span className="flex-1 text-sm font-semibold text-slate-800">Resource Analytics</span>
        <span className="text-xs text-slate-400">{stats.total} resource{stats.total !== 1 ? 's' : ''}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { label: 'Total resources', value: stats.total, sub: `${Object.keys(stats.byType).length} types`, color: 'text-slate-800' },
              { label: 'Available',       value: available,   sub: `${stats.total ? Math.round(available / stats.total * 100) : 0}% of total`, color: 'text-green-600' },
              { label: 'Occupied',        value: occupied,    sub: `${utilRate}% utilisation`, color: 'text-amber-600' },
              { label: 'Total capacity',  value: stats.totalCap.toLocaleString(), sub: `${maintenance} in maintenance`, color: 'text-slate-800' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-4">
                <p className="text-[11px] uppercase tracking-[.07em] font-semibold text-slate-400 mb-1">{s.label}</p>
                <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pie */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-[11px] uppercase tracking-[.07em] font-semibold text-slate-400 mb-3">Status breakdown</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(stats.byStatus).map(([k, v]) => (
                  <span key={k} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: STATUS_COLORS[k] || '#94a3b8' }} />
                    {k} <strong className="text-slate-700">{v}</strong>
                  </span>
                ))}
              </div>
              <div className="relative h-44">
                <canvas ref={pieRef} aria-label="Pie chart of resource status breakdown" role="img">Status breakdown chart.</canvas>
              </div>
            </div>

            {/* Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-[11px] uppercase tracking-[.07em] font-semibold text-slate-400 mb-3">Resources by type</p>
              <div className="relative" style={{ height: Math.max(180, Object.keys(stats.byType).length * 36 + 40) + 'px' }}>
                <canvas ref={barRef} aria-label="Bar chart of resource count by type" role="img">Type breakdown chart.</canvas>
              </div>
            </div>
          </div>

          {/* Capacity distribution */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-[11px] uppercase tracking-[.07em] font-semibold text-slate-400 mb-4">Capacity distribution</p>
            <div className="space-y-3">
              {CAP_BUCKETS.map((b, i) => (
                <div key={b.label} className="flex items-center gap-3 text-sm">
                  <span className="w-36 text-[12px] text-slate-500 shrink-0">{b.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((capCounts[i] / capMax) * 100)}%`, background: CAP_COLORS[i] }}
                    />
                  </div>
                  <span className="w-6 text-right text-[12px] text-slate-400 shrink-0">{capCounts[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}