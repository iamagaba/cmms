import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCategory, SlaPolicy } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import { ServiceSlaFormSheet, ServiceSlaData } from "@/components/shadcn/ServiceSlaFormSheet";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, MoreHorizontal, Loader2 } from "lucide-react"; // Added Loader2
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ServiceSlaRow = ServiceCategory & { sla_policies: SlaPolicy | null };

const ServiceSlaManagement = () => {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingData, setEditingData] = useState<ServiceSlaData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data: services, isLoading } = useQuery<ServiceSlaRow[]>({
    queryKey: ['service_categories_with_sla'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_categories').select('*, sla_policies(*)');
      if (error) throw new Error(error.message);
      return (data || []).map(d => ({ ...d, sla_policies: d.sla_policies[0] || null }));
    }
  });

  const upsertCategoryMutation = useMutation({
    mutationFn: async (categoryData: Partial<ServiceCategory>) => {
      const { data, error } = await supabase.from('service_categories').upsert(categoryData).select().single();
      if (error) throw error;
      return data;
    },
  });

  const upsertSlaMutation = useMutation({
    mutationFn: async (slaData: Partial<SlaPolicy>) => {
      const { error } = await supabase.from('sla_policies').upsert(slaData);
      if (error) throw error;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_categories_with_sla'] });
      showSuccess('Service category has been deleted.');
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => showError(error.message),
  });

  const handleSave = async (categoryData: Partial<ServiceCategory>, slaData: Partial<SlaPolicy>) => {
    try {
      const savedCategory = await upsertCategoryMutation.mutateAsync(categoryData);
      if (savedCategory) {
        await upsertSlaMutation.mutateAsync({ ...slaData, service_category_id: savedCategory.id });
      }
      queryClient.invalidateQueries({ queryKey: ['service_categories_with_sla'] });
      showSuccess('Service & SLA have been saved.');
      setIsSheetOpen(false);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleEdit = (record: ServiceSlaRow) => {
    setEditingData(record);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Manage Service Categories & SLAs</CardTitle>
        <Button onClick={() => { setEditingData(null); setIsSheetOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </CardHeader>
      <div className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>First Response (mins)</TableHead>
                <TableHead>Response (hrs)</TableHead>
                <TableHead>Resolution (hrs)</TableHead>
                <TableHead>Expected Repair (hrs)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services?.length ? (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.sla_policies?.first_response_minutes || 'N/A'}</TableCell>
                    <TableCell>{service.sla_policies?.response_hours || 'N/A'}</TableCell>
                    <TableCell>{service.sla_policies?.resolution_hours || 'N/A'}</TableCell>
                    <TableCell>{service.sla_policies?.expected_repair_hours || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(service)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(service.id)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No service categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {isSheetOpen && (
        <ServiceSlaFormSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onSave={handleSave}
          serviceSlaData={editingData}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service category and its associated SLA policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ServiceSlaManagement;