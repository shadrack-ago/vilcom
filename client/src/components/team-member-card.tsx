import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { TeamMember } from "@shared/schema";
import { Link } from "wouter";

interface TeamMemberCardProps {
  member: TeamMember;
  shiftsCount: number;
  hoursCount: number;
}

export function TeamMemberCard({ member, shiftsCount, hoursCount }: TeamMemberCardProps) {
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pto':
      case 'pto_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pto':
        return 'PTO';
      case 'pto_soon':
        return 'PTO Soon';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <AvatarWithFallback 
            src={member.avatarUrl} 
            name={member.name} 
            className="h-12 w-12"
          />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {member.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {member.position}
            </p>
          </div>
          
          <div className="inline-flex items-center text-base font-semibold text-gray-900">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(member.status)}`}>
              {getStatusText(member.status)}
            </span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <span className="block text-gray-500 text-xs">This Week</span>
            <span className="font-medium">{shiftsCount} Shifts</span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="block text-gray-500 text-xs">Hours</span>
            <span className="font-medium">{hoursCount}h</span>
          </div>
        </div>
        
        <div className="mt-4">
          <Link href={`/schedule?member=${member.id}`}>
            <Button variant="outline" className="w-full">
              View Schedule
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
