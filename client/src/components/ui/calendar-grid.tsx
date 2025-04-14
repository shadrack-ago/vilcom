import { Badge } from "@/components/ui/badge";
import { format, isToday, parseISO } from "date-fns";
import { ShiftCard } from "./shift-card";
import { ShiftWithDetails } from "@shared/schema";

interface CalendarDay {
  date: string | Date;
  shifts: ShiftWithDetails[];
}

interface CalendarGridProps {
  days: CalendarDay[];
  onShiftClick: (shift: ShiftWithDetails) => void;
  currentDate?: Date;
}

export function CalendarGrid({ days, onShiftClick, currentDate = new Date() }: CalendarGridProps) {
  // Convert string dates to Date objects
  const formatDate = (date: string | Date): Date => {
    if (date instanceof Date) return date;
    return parseISO(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-200">
      {/* Calendar Header (days of week) */}
      <div className="grid grid-cols-7 border-b border-blue-200">
        {days.map((day) => {
          const dateObj = formatDate(day.date);
          return (
            <div
              key={dateObj.toISOString()}
              className="min-h-[30px] flex justify-center items-center bg-blue-50 font-medium text-blue-700"
            >
              {format(dateObj, "EEE d")}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid (shifts) */}
      <div className="grid grid-cols-7 bg-white">
        {days.map((day) => {
          const dateObj = formatDate(day.date);
          const isCurrentDay = isToday(dateObj);
          return (
            <div
              key={dateObj.toISOString()}
              className={`min-h-[100px] p-2 border-b border-r border-blue-100 ${
                isCurrentDay ? "bg-blue-50 shadow-inner" : ""
              }`}
            >
              {day.shifts.map((shift) => (
                <ShiftCard 
                  key={shift.id} 
                  shift={shift} 
                  onClick={() => onShiftClick(shift)} 
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
