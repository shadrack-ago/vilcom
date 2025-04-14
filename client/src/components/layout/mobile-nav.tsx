import { Link } from "wouter";
import { Calendar, Users, Bell, User } from "lucide-react";

interface MobileNavProps {
  currentPath: string;
}

export function MobileNav({ currentPath }: MobileNavProps) {
  const navItems = [
    { path: "/schedule", label: "Schedule", icon: Calendar },
    { path: "/team", label: "Team", icon: Users },
    { path: "/notifications", label: "Notifications", icon: Bell },
    { path: "/settings", label: "Profile", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path === "/schedule" && currentPath === "/");
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`inline-flex flex-col items-center justify-center py-3 hover:bg-blue-50 ${
                isActive ? "text-blue-600 font-medium" : "text-gray-500"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "text-blue-600" : ""}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
