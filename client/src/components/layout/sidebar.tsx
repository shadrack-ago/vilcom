import { Link } from "wouter";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Calendar, Users, Bell, Settings, User } from "lucide-react";

interface SidebarProps {
  currentPath: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
  const navItems = [
    { path: "/schedule", label: "Schedule", icon: Calendar },
    { path: "/team", label: "Team", icon: Users },
    { path: "/notifications", label: "Notifications", icon: Bell },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-blue-700 text-white">
        <div className="flex items-center justify-center h-16 px-4 border-b border-blue-600 bg-blue-800">
          <h1 className="text-xl font-bold">Vilcom Networks</h1>
        </div>
        
        <div className="flex flex-col justify-between flex-1 overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path === "/schedule" && currentPath === "/");
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive 
                      ? "bg-blue-900 text-white" 
                      : "text-blue-100 hover:bg-blue-600"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="px-4 py-4">
            <div className="flex items-center">
              <AvatarWithFallback 
                src="" 
                name="Alex Morgan" 
                className="h-8 w-8"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Alex Morgan</p>
                <p className="text-xs text-primary-200">SOC Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
