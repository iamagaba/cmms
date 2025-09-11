import { useState, useMemo } from "react";
import { Button, Typography, Space, Skeleton, Row, Col, Segmented, Input } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { TechnicianFormDialog } from "@/components/TechnicianFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Technician, WorkOrder, Location } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import { camelToSnakeCase } from "@/utils/data-helpers";
import { TechnicianCard, TechnicianCardData } from "@/components/TechnicianCard";
import { TechnicianDataTable } from "@/components/TechnicianDataTable";
import Breadcrumbs from "@/components/Breadcrumbs"; // Import Breadcrumbs

const { Search } = Input;

const TechniciansPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<'card' | 'list'>('card');

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*').order('name');
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

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
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
    technicianMutation.mutate(camelToSnakeCase(technicianData));
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

  const handleUpdateStatus = (id: string, status: Technician['status']) => {
    technicianMutation.mutate({ id, status });
  };

  const technicianData: TechnicianCardData[] = useMemo(() => {
    if (!technicians || !workOrders) return [];
    return technicians.map(tech => ({
      ...tech,
      openTasks: workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length
    }));
  }, [technicians, workOrders]);

  const filteredTechnicians = useMemo(() => {
    if (!technicianData) return [];
    return technicianData.filter(tech =>
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tech.specialization && tech.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [technicianData, searchTerm]);

  const isLoading = isLoadingTechnicians || isLoadingWorkOrders || isLoadingLocations;

  const pageActions = (
    <Space size="middle" align="center">
      <Search
        placeholder="Search technicians..."
        onSearch={setSearchTerm}
        onChange={(e) => !e.target.value && setSearchTerm("")}
        style={{ width: 250 }}
        allowClear
      />
      <Segmented
        options={[
          { value: 'card', icon: <Icon icon="ph:grid-four-fill" /> },
          { value: 'list', icon: <Icon icon="ph:list-fill" /> },
        ]}
        value={view}
        onChange={(value) => setView(value as 'card' | 'list')}
      />
      <Button type="primary" icon={<Icon icon="ph:plus-fill" />} onClick={() => { setEditingTechnician(null); setIsDialogOpen(true); }}>
        Add Technician
      </Button>
    </Space>
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumbs actions={pageActions} />
      
      {isLoading ? <Skeleton active /> : (
        view === 'card' ? (
          <Row gutter={[16, 16]}>
            {filteredTechnicians.map(tech => (
              <Col key={tech.id} xs={24} sm={12} md={8} lg={6}>
                <TechnicianCard 
                  technician={tech}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <TechnicianDataTable
            technicians={filteredTechnicians}
            workOrders={workOrders || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus} // Pass the handler here
          />
        )
      )}

      {isDialogOpen && (
        <TechnicianFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          technician={editingTechnician}
          locations={locations || []}
        />
      )}
    </Space>
  );
};

export default TechniciansPage;