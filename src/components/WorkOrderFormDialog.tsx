import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrder, technicians, locations } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  vehicleModel: z.string().min(1, "Vehicle Model is required"),
  customerName: z.string().min(1, "Customer Name is required"),
  service: z.string().min(1, "Service description is required"),
  status: z.enum(["Open", "In Progress", "On Hold", "Completed"]),
  priority: z.enum(["High", "Medium", "Low"]),
  assignedTechnicianId: z.string().nullable(),
  locationId: z.string().min(1, "Location is required"),
  slaDue: z.date(),
});

interface WorkOrderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkOrder) => void;
  workOrder?: WorkOrder | null;
}

export const WorkOrderFormDialog = ({ isOpen, onClose, onSave, workOrder }: WorkOrderFormDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: workOrder?.vehicleId || "",
      vehicleModel: workOrder?.vehicleModel || "",
      customerName: workOrder?.customerName || "",
      service: workOrder?.service || "",
      status: workOrder?.status || "Open",
      priority: workOrder?.priority || "Medium",
      assignedTechnicianId: workOrder?.assignedTechnicianId || null,
      locationId: workOrder?.locationId || "",
      slaDue: workOrder ? new Date(workOrder.slaDue) : new Date(),
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const newId = workOrder?.id || `WO-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const workOrderToSave: WorkOrder = {
      id: newId,
      vehicleId: values.vehicleId,
      vehicleModel: values.vehicleModel,
      customerName: values.customerName,
      status: values.status,
      priority: values.priority,
      assignedTechnicianId: values.assignedTechnicianId,
      locationId: values.locationId,
      service: values.service,
      slaDue: values.slaDue.toISOString(),
    };
    onSave(workOrderToSave);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{workOrder ? "Edit Work Order" : "Create Work Order"}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {workOrder ? "update the" : "create a new"} work order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <FormField control={form.control} name="vehicleId" render={({ field }) => (
              <FormItem><FormLabel>Vehicle ID</FormLabel><FormControl><Input placeholder="e.g. GOGO-123" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="vehicleModel" render={({ field }) => (
              <FormItem><FormLabel>Vehicle Model</FormLabel><FormControl><Input placeholder="e.g. GOGO S1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="customerName" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Customer Name</FormLabel><FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="service" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Service Description</FormLabel><FormControl><Textarea placeholder="Describe the issue or service required..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="On Hold">On Hold</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="priority" render={({ field }) => (
              <FormItem><FormLabel>Priority</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="locationId" render={({ field }) => (
              <FormItem><FormLabel>Location</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger></FormControl><SelectContent>{locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="assignedTechnicianId" render={({ field }) => (
              <FormItem><FormLabel>Assigned Technician</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl><SelectContent><SelectItem value="">Unassigned</SelectItem>{technicians.map(tech => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="slaDue" render={({ field }) => (
              <FormItem className="flex flex-col md:col-span-2"><FormLabel>SLA Due Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
            )} />
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Work Order</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};