import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameMonth, isSameDay,
  isWithinInterval,
} from 'date-fns';

const CalendarWidget = ({ onDateSelect, selectedRange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState(selectedRange?.start || null);
  const [rangeEnd, setRangeEnd] = useState(selectedRange?.end || null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const handleDayClick = (day) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day);
      setRangeEnd(null);
      onDateSelect?.({ start: day, end: null });
    } else {
      const end = day >= rangeStart ? day : rangeStart;
      const start = day >= rangeStart ? rangeStart : day;
      setRangeEnd(end);
      setRangeStart(start);
      onDateSelect?.({ start, end });
    }
  };

  const clearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
    onDateSelect?.(null);
  };

  const isInRange = (day) => {
    if (!rangeStart || !rangeEnd) return false;
    return isWithinInterval(day, { start: rangeStart, end: rangeEnd });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 animate-scale-in w-full font-sans">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all text-slate-500 flex items-center justify-center"
          title="Previous Month">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight font-outfit">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all text-slate-500 flex items-center justify-center"
          title="Next Month">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2.5 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs font-extrabold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1 place-items-center">
        {days.map((day) => {
          const isStart = rangeStart && isSameDay(day, rangeStart);
          const isEnd = rangeEnd && isSameDay(day, rangeEnd);
          const inRange = isInRange(day);
          const inMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={`
                h-9 w-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all duration-200
                ${!inMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-sky-50 hover:text-sky-600'}
                ${(isStart || isEnd) ? 'bg-gradient-to-tr from-sky-500 via-sky-600 to-indigo-600 text-white font-extrabold shadow-md shadow-sky-500/25 scale-105' : ''}
                ${inRange && !isStart && !isEnd ? 'bg-sky-100/80 text-sky-800 rounded-none font-bold' : ''}
                ${isToday && !isStart && !isEnd ? 'ring-2 ring-sky-400 font-extrabold text-sky-700' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Clear filter button & active range indicator */}
      {rangeStart && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 truncate">
            {format(rangeStart, 'MMM d')}
            {rangeEnd ? ` – ${format(rangeEnd, 'MMM d, yyyy')}` : ' (pick end date)'}
          </span>
          <button onClick={clearRange}
            className="inline-flex items-center gap-1 text-xs font-extrabold text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors shrink-0">
            <X size={13} /> <span>Clear</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;



