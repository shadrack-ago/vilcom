import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertShiftSchema } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  teamMemberId: z.string().nullable(),
  shiftTypeId: z.string().min(1, "Shift type is required"),
  notes: z.string().optional(),
  needsCoverage: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface AddShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  onSuccess?: () => void;
}

export function AddShiftDialog({ 
  open, 
  onOpenChange,
  initialDate = new Date().toISOString().split('T')[0],
  onSuccess
}: AddShiftDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [needsCoverage, setNeedsCoverage] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: initialDate,
      teamMemberId: needsCoverage ? null : "",
      shiftTypeId: "",
      notes: "",
      needsCoverage: false,
    },
  });

  // Query team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["/api/team-members"],
  });

  // Query shift types
  const { data: shiftTypes = [] } = useQuery({
    queryKey: ["/api/shift-types"],
  });

  // Create shift mutation
  const createShift = useMutation({
    mutationFn: async (values: FormValues) => {
      // Convert form values to the right types
      const payload = {
        date: values.date,
        teamMemberId: values.needsCoverage ? null : Number(values.teamMemberId),
        shiftTypeId: Number(values.shiftTypeId),
        notes: values.notes || "",
        needsCoverage: values.needsCoverage,
      };

      const res = await apiRequest("POST", "/api/shifts", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/week"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Shift has been added to the schedule",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not create shift. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    createShift.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Shift</DialogTitle>
          <DialogDescription>
            Create a new shift assignment for the SOC team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="shiftTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a shift type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shiftTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name} ({type.startTime.slice(0, 5)} - {type.endTime.slice(0, 5)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="needsCoverage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Needs Coverage</FormLabel>
                    <FormDescription>
                      Toggle if this shift needs coverage
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setNeedsCoverage(checked);
                        if (checked) {
                          form.setValue("teamMemberId", null);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!needsCoverage && (
              <FormField
                control={form.control}
                name="teamMemberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name} - {member.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any important details about this shift"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={createShift.isPending}
              >
                {createShift.isPending ? "Adding..." : "Add Shift"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
