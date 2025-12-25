import { useState, useMemo } from "react";
import { Button, Space, Spin, Segmented, Alert } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { TechnicianFormDialog } from "@/components/TechnicianFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Technician, WorkOrder, Location } from "@/types/supabase";

import { snakeToCamelCase, camelToSnakeCase } from "@/utils/data-helpers";
import { showSuccess, showError } from "@/utils/toast";

// Removed custom primary button style to match Customers page buttons
import { TableFiltersBar } from "@/components/TableFiltersBar";
import { TechnicianCard, TechnicianCardData } from "@/components/TechnicianCard";
import { TechnicianDataTable } from "@/components/TechnicianDataTable";
import AppBreadcrumb from "@/components/Breadcrumbs";
import Fab from "@/components/Fab";


const TechniciansPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<'card' | 'list'>('card');
  const [transformError, setTransformError] = useState<string | null>(null);

  const { data: technicians, isLoading: isLoadingTechnicians, error, refetch } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*').order('name');
      if (error) throw new Error(error.message);
      try {
        return (data || []).map(technician => {
          try {
            const transformed = snakeToCamelCase(technician) as any;
            // Fix location_id conversion issue - keep it as location_id
            if (technician.location_id !== undefined) {
              transformed.location_id = technician.location_id;
            }

            return transformed as Technician;
          } catch (err) {
            console.error('Technician transformation error:', err, technician);
            setTransformError('Error transforming technician data. See console for details.');
            return {} as Technician;
          }
        });
      } catch (err) {
        console.error('Technicians array transformation error:', err, data);
        setTransformError('Error transforming technicians array. See console for details.');
        return [];
      }
    }
  });

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(workOrder => snakeToCamelCase(workOrder) as WorkOrder);
    }
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(location => snakeToCamelCase(location) as Location);
    }
  });

  const technicianMutation = useMutation({
    mutationFn: async (technicianData: Partial<Technician>) => {
      const snakeCaseData = camelToSnakeCase(technicianData); // Convert to snake_case for Supabase
      
      // Remove undefined values that could cause issues
      const cleanData = Object.fromEntries(
        Object.entries(snakeCaseData).filter(([_, value]) => value !== undefined)
      );
      console.log('Clean data for Supabase:', cleanData);
      
      if (technicianData.id && technicians?.some(t => t.id === technicianData.id)) {
        // Update existing technician
        const { data, error } = await supabase
          .from('technicians')
          .update(cleanData)
          .eq('id', technicianData.id)
          .select();
        if (error) throw new Error(error.message);
        console.log('Updated technician response:', data);
        if (data && data[0]) {
          console.log('Updated technician location_id:', data[0].location_id);
        }
      } else {
        // Insert new technician
        const { data, error } = await supabase.from('technicians').insert([cleanData]).select();
        if (error) throw new Error(error.message);
        console.log('Inserted technician response:', data);
      }
    },
    onSuccess: async () => {
      // Verify what's actually in the database after update
      const { data: verifyData } = await supabase
        .from('technicians')
        .select('id, name, location_id')
        .limit(5);
      console.log('Current technicians in DB (sample):', verifyData);
      
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      showSuccess('Technician has been saved.');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      showError(error.message);
    },
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

  const handleSave = (technicianData: Partial<Technician>) => {
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

  const handleUpdateStatus = async (id: string, status: Technician['status']) => {
    const { data: currentTechnicianRaw, error: fetchError } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      showError(`Failed to fetch technician data: ${fetchError.message}`);
      return;
    }
    if (!currentTechnicianRaw) {
      showError("Technician not found.");
      return;
    }

    // Convert raw snake_case data to camelCase Technician object
    const currentTechnician = snakeToCamelCase(currentTechnicianRaw) as Technician;

    // Create a new object with the updated status, preserving all other fields
    const updatedTechnicianData: Partial<Technician> = {
      ...currentTechnician,
      status: status,
    };

    technicianMutation.mutate(updatedTechnicianData); // Pass camelCase data
  };

  const technicianData: TechnicianCardData[] = useMemo(() => {
    if (!technicians || !workOrders || !locations) return [];
    const locationMap = new Map(locations.map(loc => [loc.id, loc]));
    const result = technicians.map(tech => {
      const location = tech.location_id ? locationMap.get(tech.location_id) || null : null;
      console.log(`Technician ${tech.name}: location_id=${tech.location_id}, location=`, location);
      return {
        ...tech,
        openTasks: workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length,
        location
      };
    });
    console.log('All locations:', locations);
    return result;
  }, [technicians, workOrders, locations]);

  const filteredTechnicians = useMemo(() => {
    if (!technicianData) return [];
    return technicianData.filter(tech =>
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tech.specializations && tech.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) // Adjust for specializations array
    );
  }, [technicianData, searchTerm]);

  const isLoading = isLoadingTechnicians || isLoadingWorkOrders || isLoadingLocations;

  // Filter chips for search term
  const filterChips = searchTerm
    ? [{ label: `Search: ${searchTerm}`, onClose: () => setSearchTerm("") }]
    : [];

  const handleClearAll = () => {
    setSearchTerm("");
  };

  const pageActions = (
    <Space size="middle" align="center">
      <Segmented
        options={[
          { value: 'card', icon: <Icon icon="ant-design:appstore-filled" /> },
          { value: 'list', icon: <Icon icon="ant-design:unordered-list-outlined" /> },
        ]}
        value={view}
        onChange={(value) => setView(value as 'card' | 'list')}
      />
      <Button
        className="primary-action-btn"
        type="primary"
        icon={<Icon icon="ant-design:plus-outlined" width={16} height={16} />}
        onClick={() => { setEditingTechnician(null); setIsDialogOpen(true); }}
      >
        Add Technician
      </Button>
    </Space>
  );


  // User-friendly error message with retry button
  if (error) {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <AppBreadcrumb actions={pageActions} />
        <div className="sticky-header-secondary">
          <TableFiltersBar
            compact
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterChips={filterChips}
            onClearAll={handleClearAll}
            placeholder="Search technicians..."
          />
        </div>
        <Alert
          message="Error Loading Technicians"
          description={error.message}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </Space>
    );
  }

  if (transformError) {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <AppBreadcrumb actions={pageActions} />
        <div className="sticky-header-secondary">
          <TableFiltersBar
            compact
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterChips={filterChips}
            onClearAll={handleClearAll}
            placeholder="Search technicians..."
          />
        </div>
        <div style={{ color: 'red', fontWeight: 'bold' }}>{transformError}</div>
      </Space>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <AppBreadcrumb actions={pageActions} />
      <div className="sticky-header-secondary">
        <TableFiltersBar
          compact
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterChips={filterChips}
          onClearAll={handleClearAll}
          placeholder="Search technicians..."
        />
      </div>
      {isLoading ? (
        <Spin tip="Loading technicians..." size="large" style={{ width: '100%', margin: '40px 0' }} />
      ) : (
        view === 'card' ? (
          <div className="card-grid">
            {filteredTechnicians.map(tech => (
              <div key={tech.id} className="tap-target">
                <TechnicianCard 
                  technician={tech}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
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

      {/* Mobile FAB for quick add */}
      <div className="hide-on-desktop">
        <Fab label="Add Technician" onClick={() => { setEditingTechnician(null); setIsDialogOpen(true); }} />
      </div>
    </div>
  );
};

export default TechniciansPage;