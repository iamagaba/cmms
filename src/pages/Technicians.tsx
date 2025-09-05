import { useState } from "react";
import { Button, Typography, Space, Skeleton } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { TechnicianDataTable } from "@/components/TechnicianDataTable";
import { TechnicianFormDialog } from "@/components/TechnicianFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Technician, WorkOrder } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";

const { Title } = Typography;

const TechniciansPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const technicianMutation = useMutation({
    mutationFn: async (technicianData: Partial<Technician>) => {
      const { error } = await supabase.from('technicians').upsert(technicianData);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      showSuccess('Technician has been saved.');
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('technicians').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      showSuccess('Technician has been deleted.');
    },
    onError: (error) => showError(error.message),
  });

  const handleSave = (technicianData: Technician) => {
    technicianMutation.mutate(technicianData);
    setIsDialogOpen(false);
    setEditingTechnician(null);
  };

  const handleDelete = (technicianData: Technician) => {
    deleteMutation.mutate(technicianData.id);
  };

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician);
    setIsDialogOpen(true);
  };

  const isLoading = isLoadingTechnicians || isLoadingWorkOrders;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>Technician Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTechnician(null); setIsDialogOpen(true); }}>
          Add Technician
        </Button>
      </div>
      
      {isLoading ? <Skeleton active /> : (
        <TechnicianDataTable 
          technicians={technicians || []} 
          workOrders={workOrders || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isDialogOpen && (
        <TechnicianFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          technician={editingTechnician}
        />
      )}
    </Space>
  );
};

export default TechniciansPage;