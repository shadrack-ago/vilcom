import { MainHeader } from "@/components/layout/main-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  
  return (
    <>
      <MainHeader 
        title="Settings" 
        onAddClick={() => {}}
        searchPlaceholder="Search settings..."
      />

      <main className="flex-1 overflow-y-auto bg-gray-50 focus:outline-none">
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            <Tabs defaultValue="account" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="team">Team Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <AvatarWithFallback
                        name="Alex Morgan"
                        className="h-20 w-20"
                      />
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          Change Avatar
                        </Button>
                        <p className="text-xs text-gray-500">
                          PNG, JPG or GIF. Maximum size 2MB.
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="Alex Morgan" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="alex.morgan@vilcomnetworks.com" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" defaultValue="SOC Manager" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" type="tel" defaultValue="555-987-6543" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Shift Assignments</h4>
                          <p className="text-sm text-gray-500">Get notified when you're assigned to a new shift</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Schedule Changes</h4>
                          <p className="text-sm text-gray-500">Get notified when your schedule changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Coverage Requests</h4>
                          <p className="text-sm text-gray-500">Get notified when a shift needs coverage</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Team Announcements</h4>
                          <p className="text-sm text-gray-500">Get notified about general team announcements</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="team" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Settings</CardTitle>
                    <CardDescription>
                      Manage team-wide settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Automatic Shift Rotation</h4>
                          <p className="text-sm text-gray-500">Automatically rotate shifts based on predefined patterns</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Allow Shift Swapping</h4>
                          <p className="text-sm text-gray-500">Allow team members to swap shifts with each other</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label htmlFor="min-hours">Minimum Hours Between Shifts</Label>
                        <Input id="min-hours" type="number" defaultValue="12" min="8" max="24" />
                        <p className="text-xs text-gray-500">
                          The minimum number of hours a team member must have between shifts
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button>Save Team Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
}
