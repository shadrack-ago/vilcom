import { Badge } from "@/components/ui/badge";
import { ShiftWithDetails } from "@shared/schema";
import { AvatarWithFallback } from "./avatar-with-fallback";
import { AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";

interface ShiftCardProps {
  shift: any; // Using any temporarily to handle the current API response structure
  onClick: () => void;
}

export function ShiftCard({ shift, onClick }: ShiftCardProps) {
  const { teamMember, needsCoverage } = shift;
  
  // Determine card color based on shift type
  const getBgColor = () => {
    if (needsCoverage) return 'bg-red-100 border-l-4 border-red-500';
    
    // Since we don't have shift types yet in the API response, use a vibrant blue color
    return 'bg-blue-100 border-l-4 border-blue-600 shadow-sm hover:shadow-md';
  };

  // Format date for display
  const formatShiftDate = (dateStr?: string) => {
    if (!dateStr) return "No date";
    try {
      const date = new Date(dateStr);
      return format(date, "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      className={`mb-2 p-2 rounded-lg text-sm cursor-pointer transition-transform hover:-translate-y-1 ${getBgColor()}`}
      onClick={onClick}
    >
      <div className="font-medium text-gray-800">
        {shift.date ? formatShiftDate(shift.date) : "Unscheduled Shift"}
      </div>
      
      <div className="text-xs text-gray-600 flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        <span>Standard shift hours</span>
      </div>
      
      <div className="mt-1 flex items-center">
        {teamMember ? (
          <>
            <AvatarWithFallback 
              src={teamMember.avatarUrl} 
              name={teamMember.name} 
              className="h-6 w-6" 
            />
            <span className="ml-1 text-xs">{teamMember.name}</span>
          </>
        ) : (
          <>
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-200 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <span className="ml-1 text-xs font-medium text-red-600">Needs Coverage</span>
          </>
        )}
      </div>
    </div>
  );
}
