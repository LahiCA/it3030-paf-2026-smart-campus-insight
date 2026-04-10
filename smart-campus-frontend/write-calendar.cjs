const fs = require('fs');
const content = \import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  parseISO
} from 'date-fns';

function BWBookingCalendar({ bookings }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayBookings = (day) => {
    return bookings.filter(booking => {
      const bDate = parseISO(booking.bookingDate);
      return isSameDay(day, bDate);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CANCELLED': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'REJECTED': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 my-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-teal-800">Booking Calendar</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div className="px-4 py-2 bg-teal-50 text-teal-800 font-semibold rounded-lg border border-teal-100 min-w-[160px] text-center">
            {format(currentDate, dateFormat)}
          </div>
          <button onClick={nextMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="bg-slate-50 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            {dayName}
          </div>
        ))}
        
        {days.map((day, idx) => {
          const dayBookings = getDayBookings(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={day.toString() + idx} 
              className={\g-white min-h-[120px] p-2 transition-colors hover:bg-slate-50 \\}
            >
              <div className="flex justify-end mb-1">
                <span className={\	ext-sm font-semibold \\}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 overflow-hidden">
                {dayBookings.slice(0, 3).map((b) => (
                  <div key={b.id} className={\	ext-[10px] px-1.5 py-1 rounded truncate border \\} title={\\ - \\}>
                    <span className="font-bold">{b.startTime && b.startTime.slice(0,5)}</span> {b.resourceName}
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-[10px] text-center text-slate-500 font-semibold mt-1 hover:text-teal-600 cursor-pointer">
                    +{dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-wrap gap-4 mt-6 items-center text-sm font-medium text-slate-600 justify-center">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm border border-emerald-500"></span> Approved</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm border border-amber-500"></span> Pending</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400 shadow-sm border border-slate-500"></span> Cancelled</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400 shadow-sm border border-rose-500"></span> Rejected</div>
      </div>
    </div>
  );
}

export default BWBookingCalendar;
\;
fs.writeFileSync('src/components/BWBookingCalendar.jsx', content);
