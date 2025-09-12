import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ServiceCategory, SlaPolicy } from "@/types/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Service category name is required"),
  description: z.string().nullable().optional(),
  first_response_minutes: z.coerce.number().int().min(0).nullable().optional(),
  response_hours: z.coerce.number().int().min(0).nullable().optional(),
  resolution_hours: z.coerce.number().int().min(0).nullable().optional(),
  expected_repair_hours: z.coerce.number().int().min(0).nullable().optional(),
});

export type ServiceSlaData = ServiceCategory & { sla_policies: Partial<SlaPolicy> | null };

interface ServiceSlaFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Partial<ServiceCategory>, slaData: Partial<SlaPolicy>) => void;
  serviceSlaData?: ServiceSlaData | null;
}

export const ServiceSlaFormSheet = ({
  isOpen,
  onClose,
  onSave,
  serviceSlaData,
}: ServiceSlaFormSheetProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      first_response_minutes: null, // Default to null for nullable optional numbers
      response_hours: null,
      resolution_hours: null,
      expected_repair_hours: null,
    },
  });

  useEffect(() => {
    if (isOpen && serviceSlaData) {
      form.reset({
        name: serviceSlaData.name,
        description: serviceSlaData.description || "",
        first_response_minutes: serviceSlaData.sla_policies?.first_response_minutes ?? null,
        response_hours: serviceSlaData.sla_policies?.response_hours ?? null,
        resolution_hours: serviceSlaData.sla_policies?.resolution_hours ?? null,
        expected_repair_hours: serviceSlaData.sla_policies?.expected_repair_hours ?? null,
      });
    } else if (isOpen && !serviceSlaData) {
      form.reset({
        name: "",
        description: "",
        first_response_minutes: null,
        response_hours: null,
        resolution_hours: null,
        expected_repair_hours: null,
      });
    }
  }, [isOpen, serviceSlaData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const categoryData: Partial<ServiceCategory> = {
      id: serviceSlaData?.id,
      name: values.name,
      description: values.description,
    };
    const slaData: Partial<SlaPolicy> = {
      id: serviceSlaData?.sla_policies?.id,
      service_category_id: serviceSlaData?.id, // This will be updated after category is saved
      first_response_minutes: values.first_response_minutes,
      response_hours: values.response_hours,
      resolution_hours: values.resolution_hours,
      expected_repair_hours: values.expected_repair_hours,
    };
    onSave(categoryData, slaData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{serviceSlaData ? "Edit Service & SLA" : "Add Service & SLA"}</SheetTitle>
          <SheetDescription>
            {serviceSlaData ? "Update service category and SLA policies." : "Create a new service category with associated SLA policies."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Critical Battery Failure" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe when this category should be used." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h3 className="text-lg font-semibold mt-4">SLA Policies</h3>
            <FormField
              control={form.control}
              name="first_response_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Response (mins)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 15" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="response_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Time (hrs)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 4" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resolution_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution Time (hrs)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 12" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expected_repair_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Repair (hrs)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                  </FormControl>
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