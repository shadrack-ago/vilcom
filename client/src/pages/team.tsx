import { useQuery } from "@tanstack/react-query";
import { MainHeader } from "@/components/layout/main-header";
import { TeamMemberCard } from "@/components/team-member-card";
import { useState } from "react";
import { ShiftType, TeamMember } from "@shared/schema";

export default function Team() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);

  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["/api/shifts"],
  });

  const { data: shiftTypes = [] } = useQuery<ShiftType[]>({
    queryKey: ["/api/shift-types"],
  });

  // Filter team members based on search term
  const filteredMembers = teamMembers.filter(member => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.position.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower)
    );
  });

  // Calculate shifts and hours for each team member
  const getMemberStats = (memberId: number) => {
    const memberShifts = shifts.filter(shift => shift.teamMemberId === memberId);
    
    // This is a simplified calculation - in a real app, you would calculate actual hours
    // based on shift type start and end times
    const totalHours = memberShifts.length * 8; // Assuming 8 hours per shift
    
    return {
      shiftsCount: memberShifts.length,
      hoursCount: totalHours
    };
  };

  return (
    <>
      <MainHeader 
        title="SOC Team Members" 
        onAddClick={() => setShowAddMemberDialog(true)}
        searchPlaceholder="Search team members..."
        onSearch={setSearchTerm}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50 focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p>Loading team members...</p>
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map(member => {
                  const { shiftsCount, hoursCount } = getMemberStats(member.id);
                  return (
                    <TeamMemberCard 
                      key={member.id} 
                      member={member}
                      shiftsCount={shiftsCount}
                      hoursCount={hoursCount}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p>No team members found. {searchTerm && "Try a different search term."}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* In a complete app, we would implement a dialog for adding team members here */}
    </>
  );
}
