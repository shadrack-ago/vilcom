import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Pencil, Trash2, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types based on shared schema
type TeamMember = {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  userId: number | null;
};

type ShiftType = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  description: string | null;
};

type Shift = {
  id: number;
  date: string;
  teamMemberId: number | null;
  shiftTypeId: number;
  notes: string | null;
  needsCoverage: boolean;
  createdAt: string;
};

type ShiftWithDetails = Shift & {
  teamMember: TeamMember | null;
  shiftType: ShiftType;
};

type ShiftFormData = {
  date: string;
  teamMemberId: number | null;
  shiftTypeId: number;
  notes: string;
  needsCoverage: boolean;
};

export function ShiftsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<ShiftWithDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState<ShiftFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    teamMemberId: null,
    shiftTypeId: 0,
    notes: "",
    needsCoverage: false
  });

  // Fetch shifts for the current week
  const { data: weekSchedule, isLoading: isLoadingSchedule, error: scheduleError } = useQuery({
    queryKey: ['/api/schedule/week'],
    retry: 1
  });

  // Fetch team members
  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } = useQuery({
    queryKey: ['/api/team-members'],
    retry: 1
  });

  // Fetch shift types
  const { data: shiftTypes = [], isLoading: isLoadingShiftTypes } = useQuery({
    queryKey: ['/api/shift-types'],
    retry: 1
  });

  // Add shift mutation
  const addMutation = useMutation({
    mutationFn: (data: ShiftFormData) => {
      return apiRequest('POST', '/api/shifts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/week'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Shift added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add shift",
        variant: "destructive",
      });
      console.error("Error adding shift:", error);
    }
  });

  // Update shift mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ShiftFormData> }) => {
      return apiRequest('PATCH', `/api/shifts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/week'] });
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Shift updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update shift",
        variant: "destructive",
      });
      console.error("Error updating shift:", error);
    }
  });

  // Delete shift mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/shifts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule/week'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Shift deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete shift",
        variant: "destructive",
      });
      console.error("Error deleting shift:", error);
    }
  });

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData((prev) => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'teamMemberId' ? (value === '' ? null : parseInt(value, 10)) : parseInt(value, 10)
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      needsCoverage: checked
    }));
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      teamMemberId: null,
      shiftTypeId: Array.isArray(shiftTypes) && shiftTypes.length > 0 ? shiftTypes[0].id : 0,
      notes: "",
      needsCoverage: false
    });
    setCurrentShift(null);
  };

  // Open edit dialog with shift data
  const handleEditClick = (shift: ShiftWithDetails) => {
    setCurrentShift(shift);
    setFormData({
      date: shift.date,
      teamMemberId: shift.teamMemberId,
      shiftTypeId: shift.shiftTypeId,
      notes: shift.notes || "",
      needsCoverage: shift.needsCoverage
    });
    setSelectedDate(new Date(shift.date));
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (shift: ShiftWithDetails) => {
    setCurrentShift(shift);
    setIsDeleteDialogOpen(true);
  };

  // Handle add form submission
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  // Handle edit form submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentShift) {
      updateMutation.mutate({
        id: currentShift.id,
        data: formData
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (currentShift) {
      deleteMutation.mutate(currentShift.id);
    }
  };

  // Extract all shifts from the week schedule
  const allShifts: ShiftWithDetails[] = weekSchedule?.days?.flatMap((day: any) => day.shifts) || [];

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  // Format time for display (from HH:MM:SS to HH:MM AM/PM)
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const isPM = h >= 12;
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${isPM ? 'PM' : 'AM'}`;
  };

  const isLoading = isLoadingSchedule || isLoadingTeamMembers || isLoadingShiftTypes;

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading shifts data...</div>;
  }

  if (scheduleError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-500">
        Error loading shifts
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/schedule/week'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Shifts</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Add Shift</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Shift</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftTypeId">Shift Type</Label>
                {!Array.isArray(shiftTypes) || shiftTypes.length === 0 ? (
                  <div className="text-sm text-red-500">
                    No shift types available. Please create a shift type first.
                  </div>
                ) : (
                  <Select
                    value={formData.shiftTypeId ? formData.shiftTypeId.toString() : '0'}
                    onValueChange={(value) => handleSelectChange('shiftTypeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift type" />
                    </SelectTrigger>
                    <SelectContent>
                      {shiftTypes.map((type: ShiftType) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: type.color }}
                            />
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamMemberId">Team Member</Label>
                <Select
                  value={formData.teamMemberId?.toString() || ''}
                  onValueChange={(value) => handleSelectChange('teamMemberId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers.map((member: TeamMember) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  placeholder="Any special instructions or notes for this shift"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsCoverage"
                  checked={formData.needsCoverage}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="needsCoverage">Needs Coverage</Label>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={addMutation.isPending || formData.shiftTypeId === 0}
                >
                  {addMutation.isPending ? "Adding..." : "Add Shift"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {allShifts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No shifts found. Add one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Shift Type</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Team Member</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allShifts.map((shift: ShiftWithDetails) => (
                <TableRow key={shift.id}>
                  <TableCell>{formatDateDisplay(shift.date)}</TableCell>
                  <TableCell>
                    {shift.shiftType ? (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: shift.shiftType.color }}
                        />
                        <span>{shift.shiftType.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unknown shift type</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {shift.shiftType ? (
                      `${formatTime(shift.shiftType.startTime)} - ${formatTime(shift.shiftType.endTime)}`
                    ) : (
                      <span className="text-muted-foreground">No time information</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {shift.teamMember ? shift.teamMember.name : (
                      <span className="text-amber-600 font-medium">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {shift.needsCoverage ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Needs Coverage
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Assigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(shift)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(shift)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-shiftTypeId">Shift Type</Label>
              <Select
                value={formData.shiftTypeId ? formData.shiftTypeId.toString() : '0'}
                onValueChange={(value) => handleSelectChange('shiftTypeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift type" />
                </SelectTrigger>
                <SelectContent>
                  {shiftTypes.map((type: ShiftType) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-teamMemberId">Team Member</Label>
              <Select
                value={formData.teamMemberId?.toString() || ''}
                onValueChange={(value) => handleSelectChange('teamMemberId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {teamMembers.map((member: TeamMember) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                placeholder="Any special instructions or notes for this shift"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-needsCoverage"
                checked={formData.needsCoverage}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="edit-needsCoverage">Needs Coverage</Label>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the 
              {currentShift?.shiftType ? ` ${currentShift.shiftType.name} ` : " "}
              shift on{" "}
              {currentShift?.date ? formatDateDisplay(currentShift.date) : ""}?
            </p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}