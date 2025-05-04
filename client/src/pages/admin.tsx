import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMembersAdmin } from "@/components/admin/team-members-admin";
import { ShiftTypesAdmin } from "@/components/admin/shift-types-admin";
import { ShiftsAdmin } from "@/components/admin/shifts-admin";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("team-members");

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        
        <div className="w-full overflow-hidden rounded-lg border bg-white shadow">
          <Tabs defaultValue="team-members" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b bg-gray-50 px-4">
              <TabsList className="bg-transparent">
                <TabsTrigger value="team-members">Team Members</TabsTrigger>
                <TabsTrigger value="shift-types">Shift Types</TabsTrigger>
                <TabsTrigger value="shifts">Shifts</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="team-members" className="p-4">
              <TeamMembersAdmin />
            </TabsContent>
            
            <TabsContent value="shift-types" className="p-4">
              <ShiftTypesAdmin />
            </TabsContent>
            
            <TabsContent value="shifts" className="p-4">
              <ShiftsAdmin />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}