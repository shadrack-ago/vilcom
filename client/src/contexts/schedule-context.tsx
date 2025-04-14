import { createContext, useContext, ReactNode, useState } from "react";

type ViewType = "week" | "month";

interface ScheduleContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>("week");

  return (
    <ScheduleContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}
