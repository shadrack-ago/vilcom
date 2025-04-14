import { MainHeader } from "@/components/layout/main-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, User, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

type Notification = {
  id: number;
  title: string;
  description: string;
  type: 'shift_change' | 'coverage_needed' | 'announcement';
  date: string;
  read: boolean;
};

export default function Notifications() {
  // In a real application, this would come from an API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Shift Coverage Needed",
      description: "Wednesday Night Shift (Oct 13) needs coverage. Please respond if you can take this shift.",
      type: "coverage_needed",
      date: "2023-10-11T14:32:00Z",
      read: false
    },
    {
      id: 2,
      title: "Schedule Update",
      description: "Your Morning Shift on Friday, Oct 15 has been confirmed.",
      type: "shift_change",
      date: "2023-10-10T09:15:00Z",
      read: true
    },
    {
      id: 3,
      title: "New SOC Procedure",
      description: "A new incident response procedure has been published. Please review it before your next shift.",
      type: "announcement",
      date: "2023-10-09T16:45:00Z",
      read: true
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotifications = notifications.filter(notification => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      notification.title.toLowerCase().includes(searchLower) ||
      notification.description.toLowerCase().includes(searchLower)
    );
  });

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true } 
        : notification
    ));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shift_change':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'coverage_needed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <MainHeader 
        title="Notifications" 
        onAddClick={() => {}}
        searchPlaceholder="Search notifications..."
        onSearch={setSearchTerm}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50 focus:outline-none">
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map(notification => (
                  <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium">
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  New
                                </span>
                              )}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {formatDate(notification.date)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {notification.description}
                          </p>
                          {!notification.read && (
                            <div className="mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No notifications</AlertTitle>
                <AlertDescription>
                  {searchTerm 
                    ? "No notifications match your search criteria." 
                    : "You're all caught up! No new notifications at this time."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
