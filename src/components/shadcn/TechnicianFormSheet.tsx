import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dayjs from "dayjs";
import { Technician, Location } from "@/types/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  location_id: z.string().uuid().nullable().optional(),
  status: z.enum(["available", "busy", "offline"], {
    required_error: "Status is required",
  }),
  specializations: z.string().min(1, "At least one specialization is required (comma-separated)"), // Changed to string
  join_date: z.date({
    required_error: "Join date is required",
  }),
});

interface TechnicianFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Technician) => void;
  technician?: Technician | null;
  locations: Location[];
}

export const TechnicianFormSheet = ({
  isOpen,
  onClose,
  onSave,
  technician,
  locations,
}: TechnicianFormSheetProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location_id: undefined,
      status: "offline",
      specializations: "", // Changed default to empty string
      join_date: new Date(),
    },
  });

  useEffect(() => {
    if (isOpen && technician) {
      form.reset({
        name: technician.name,
        email: technician.email || "",
        phone: technician.phone || "",
        location_id: technician.location_id || undefined,
        status: technician.status || "offline",
        specializations: (technician.specializations || []).join(', '), // Join array to string
        join_date: technician.join_date ? dayjs(technician.join_date).toDate() : new Date(),
      });
    } else if (isOpen && !technician) {
      form.reset({
        name: "",
        email: "",
        phone: "",
        location_id: undefined,
        status: "offline",
        specializations: "",
        join_date: new Date(),
      });
    }
  }, [isOpen, technician, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const technicianToSave: Technician = {
      id: technician?.id || "", // ID will be empty string for new, filled for edit
      name: values.name,
      email: values.email,
      phone: values.phone,
      location_id: values.location_id,
      status: values.status,
      specializations: values.specializations.split(',').map(s => s.trim()).filter(Boolean), // Split string to array
      join_date: dayjs(values.join_date).toISOString(),
      // Add other fields with default/null values as required by Technician interface
      avatar: technician?.avatar || null,
      lat: technician?.lat || null,
      lng: technician?.lng || null,
      max_concurrent_orders: technician?.max_concurrent_orders || null,
      created_at: technician?.created_at || undefined,
      updated_at: technician?.updated_at || undefined,
    };
    onSave(technicianToSave);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{technician ? "Edit Technician" : "Add Technician"}</SheetTitle>
          <SheetDescription>
            {technician ? "Update technician details." : "Add a new technician to your team."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. john.doe@gogo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. +256 772 123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Location</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specializations"
              render={({ field }) => ( // Changed to use Input
                <FormItem>
                  <FormLabel>Specializations (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Electrical, Mechanical" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="join_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Join Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            dayjs(field.value).format("MMM D, YYYY")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="mt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};