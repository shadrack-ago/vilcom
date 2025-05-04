import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Schedule from "@/pages/schedule";
import Team from "@/pages/team";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ScheduleProvider } from "./contexts/schedule-context";

function Router() {
  const [location] = useLocation();
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar currentPath={location} />
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Switch>
          <Route path="/" component={Schedule} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/team" component={Team} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/admin" component={Admin} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
        <MobileNav currentPath={location} />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScheduleProvider>
        <Router />
        <Toaster />
      </ScheduleProvider>
    </QueryClientProvider>
  );
}

export default App;
