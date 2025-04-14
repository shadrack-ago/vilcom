import { useQuery } from "@tanstack/react-query";
import { MainHeader } from "@/components/layout/main-header";
import { Button } from "@/components/ui/button";
import { CalendarGrid } from "@/components/ui/calendar-grid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { ShiftWithDetails, WeekSchedule } from "@shared/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { AddShiftDialog } from "@/components/add-shift-dialog";
import { useSchedule } from "@/contexts/schedule-context";
import { useLocation, useSearch } from "wouter";

export default function Schedule() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const memberFilter = params.get("member");
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftWithDetails | null>(null);
  const { currentView, setCurrentView } = useSchedule();

  const { data: scheduleData, isLoading, error } = useQuery<WeekSchedule>({
    queryKey: ["/api/schedule/week", { date: selectedDate.toISOString() }],
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["/api/team-members"],
  });

  // Filter shifts based on team member if specified in URL
  useEffect(() => {
    if (memberFilter && scheduleData) {
      setSelectedTeam(memberFilter);
    }
  }, [memberFilter, scheduleData]);

  const handlePrevious = () => {
    setSelectedDate((date) => subWeeks(date, 1));
  };

  const handleNext = () => {
    setSelectedDate((date) => addWeeks(date, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleAddShiftClick = () => {
    setSelectedShift(null);
    setAddShiftOpen(true);
  };

  const handleShiftClick = (shift: ShiftWithDetails) => {
    setSelectedShift(shift);
    // In a more complete app, we would show edit dialog here
    // For now, let's just console log the selected shift
    console.log("Selected shift:", shift);
  };

  // Filter the schedule days if needed
  const filteredSchedule = scheduleData ? {
    ...scheduleData,
    days: scheduleData.days.map(day => {
      // Filter shifts based on team member and search term
      const filteredShifts = day.shifts.filter(shift => {
        // Filter by team member
        if (selectedTeam !== "all" && shift.teamMemberId !== parseInt(selectedTeam)) {
          return false;
        }
        
        // Filter by search term (if any)
        if (searchTerm && searchTerm.length > 0) {
          const lowerSearch = searchTerm.toLowerCase();
          const matchesType = shift.shiftType?.name.toLowerCase().includes(lowerSearch);
          const matchesMember = shift.teamMember?.name.toLowerCase().includes(lowerSearch);
          return matchesType || matchesMember;
        }
        
        return true;
      });
      
      return {
        ...day,
        shifts: filteredShifts
      };
    })
  } : null;

  const dateRangeText = scheduleData 
    ? `${format(scheduleData.start, "MMMM d")} - ${format(scheduleData.end, "d, yyyy")}`
    : "Loading...";

  return (
    <>
      <MainHeader 
        title="SOC Team Schedule" 
        onAddClick={handleAddShiftClick}
        searchPlaceholder="Search team or shifts..."
        onSearch={setSearchTerm}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50 focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Calendar Navigation */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Today
                </Button>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={handlePrevious}>
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleNext}>
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </Button>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  {dateRangeText}
                </h2>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex border rounded overflow-hidden">
                  <Button 
                    variant={currentView === "week" ? "default" : "ghost"}
                    className="px-4 py-1.5"
                    onClick={() => setCurrentView("week")}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={currentView === "month" ? "default" : "ghost"}
                    className="px-4 py-1.5"
                    onClick={() => setCurrentView("month")}
                  >
                    Month
                  </Button>
                </div>
                
                <div>
                  <Select 
                    value={selectedTeam} 
                    onValueChange={setSelectedTeam}
                  >
                    <SelectTrigger className="min-w-[140px]">
                      <SelectValue placeholder="All Teams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Weekly Calendar View */}
            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p>Loading schedule...</p>
              </div>
            ) : filteredSchedule ? (
              <CalendarGrid 
                days={filteredSchedule.days} 
                onShiftClick={handleShiftClick}
                currentDate={selectedDate}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-red-500">Error loading schedule. Please try again.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddShiftDialog 
        open={addShiftOpen} 
        onOpenChange={setAddShiftOpen}
        initialDate={selectedDate.toISOString().split('T')[0]}
      />
    </>
  );
}
