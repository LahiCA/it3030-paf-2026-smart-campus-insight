import React, { useState } from 'react';
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

/**

 * Renders an interactive Calendar to visualize current bookings across the university.
 * Uses Date-Fns to parse bookings and display visual indicators and tooltips on dates.
 */
function BWBookingCalendar({ bookings, onBookingClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 my-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Booking Calendar</h2>
          <p className="text-xs text-slate-500">Overview of facility reservations</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={prevMonth} className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 transition">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div className="px-3 py-1.5 bg-slate-50 text-slate-700 text-sm font-semibold rounded border border-slate-200 min-w-[140px] text-center">
            {format(currentDate, dateFormat)}
          </div>
          <button onClick={nextMonth} className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 transition">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {dayName}
          </div>
        ))}
        
        {days.map((day, idx) => {
          const dayBookings = getDayBookings(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={day.toString() + idx} 
              className={'bg-white min-h-[90px] p-1.5 transition-colors hover:bg-slate-50 cursor-pointer ' + (!isCurrentMonth ? 'opacity-40 bg-slate-50/50' : '')}
              onClick={() => setSelectedDay(day)}
            >
              <div className="flex justify-end mb-1">
                <span className={'text-xs font-semibold ' + (isSameDay(day, new Date()) ? 'bg-teal-500 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-sm' : 'text-slate-500 pr-1')}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayBookings.slice(0, 2).map((b) => (
                  <div key={b.id} className={'text-[9px] px-1 py-0.5 leading-tight rounded truncate border ' + getStatusColor(b.status)} title={b.resourceName + ' - ' + b.status}>
                    <span className="font-bold">{b.startTime && b.startTime.slice(0,5)}</span> {b.resourceName}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div 
                    className="text-[9px] text-center text-slate-400 font-semibold hover:text-teal-600 mt-0.5"
                  >
                    +{dayBookings.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4 items-center text-xs font-medium text-slate-500 justify-center">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-400"></span> Approved</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-400"></span> Pending</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-400"></span> Cancelled</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-rose-400"></span> Rejected</div>
      </div>

      {/* Daily Bookings Modal */}
      {selectedDay && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Bookings for {format(selectedDay, 'MMM d, yyyy')}
                </h3>
                <p className="text-xs text-slate-500">{getDayBookings(selectedDay).length} total bookings</p>
              </div>
              <button 
                onClick={() => setSelectedDay(null)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-full transition shadow-sm border border-slate-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-col gap-3">
                {getDayBookings(selectedDay).map(b => (
                  <div 
                    key={b.id} 
                    onClick={() => {
                      if (onBookingClick) {
                        onBookingClick(b.id);
                        setSelectedDay(null); // Close modal when navigating
                      }
                    }}
                    className={'flex items-center justify-between p-3 rounded-xl border ' + getStatusColor(b.status).replace('border-', 'border-l-4 border-') + ' bg-white shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all'}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{b.resourceName}</span>
                      <span className="text-xs font-semibold text-slate-500">{b.startTime && b.startTime.slice(0,5)} - {b.endTime && b.endTime.slice(0,5)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className={'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ' + getStatusColor(b.status)}>
                         {b.status}
                       </span>
                       <span className="text-xs text-slate-400 font-mono">{b.userId}</span>
                    </div>
                  </div>
                ))}
                {getDayBookings(selectedDay).length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    No bookings found for this day.
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setSelectedDay(null)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BWBookingCalendar;
