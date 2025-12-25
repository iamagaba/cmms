import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Space, Typography, Descriptions, Skeleton } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"; // Import useMutation
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, Customer, WorkOrder, Technician, Location, Profile, ServiceCategory } from "@/types/supabase"; // Import Profile and ServiceCategory
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable"; // Import WorkOrderDataTable
import { ALL_COLUMNS } from "@/components/work-order-columns-constants"; // Import ALL_COLUMNS
import { formatDistanceToNow } from 'date-fns';
import dayjs from 'dayjs';
import { CreateWorkOrderDialog } from "@/components/CreateWorkOrderDialog";
import { WorkOrderFormDrawer } from "@/components/WorkOrderFormDrawer";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import { useState, useMemo } from "react";
import { camelToSnakeCase } from "@/utils/data-helpers"; // Import camelToSnakeCase
import { showSuccess, showInfo, showError } from "@/utils/toast"; // Import toast utilities
import { RepairActivityTimeline } from "@/components/RepairActivityTimeline";
import { useSession } from "@/context/SessionContext";
import AppBreadcrumb from "@/components/Breadcrumbs";


const { Title, Text } = Typography;

type VehicleWithCustomer = Vehicle & { customers: Customer | null };

const AssetDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useSession();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [viewingWorkOrderId, setViewingWorkOrderId] = useState<string | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<WorkOrder> | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.value));
  // State for selected week in timeline
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);


  const { data: vehicle, isLoading: isLoadingVehicle, error: vehicleError } = useQuery<VehicleWithCustomer | null>({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      if (!id) throw new Error('No asset ID provided in URL.');
      const { data, error } = await supabase.from('vehicles').select('*, customers(*)').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer | null>({
    queryKey: ['customer', vehicle?.customer_id],
    queryFn: async () => {
      if (!vehicle?.customer_id) return null;
      const { data, error } = await supabase.from('customers').select('*').eq('id', vehicle.customer_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!vehicle?.customer_id,
  });

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders', { vehicleId: id }],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('work_orders').select('*').eq('vehicle_id', id);
      if (error) throw new Error(error.message);
      return (data || []).map((item: any) => ({
        ...item,
        createdAt: item.created_at,
        workOrderNumber: item.work_order_number,
        assignedTechnicianId: item.assigned_technician_id,
        locationId: item.location_id,
        initialDiagnosis: item.client_report,
        maintenanceNotes: item.maintenanceNotes,
        issueType: item.issueType,
        faultCode: item.faultCode,
        partsUsed: item.partsUsed,
        activityLog: item.activityLog,
        slaDue: item.slaDue,
        completedAt: item.completedAt,
        customerLat: item.customerLat,
        customerLng: item.customerLng,
        customerAddress: item.customerAddress,
        onHoldReason: item.onHoldReason,
        appointmentDate: item.appointmentDate,
        customerId: item.customerId,
        vehicleId: item.vehicleId,
        created_by: item.created_by,
        service_category_id: item.service_category_id,
        confirmed_at: item.confirmed_at,
        work_started_at: item.work_started_at,
        sla_timers_paused_at: item.sla_timers_paused_at,
        total_paused_duration_seconds: item.total_paused_duration_seconds
      })) || [];
    },
    enabled: !!id,
  });
  
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: allCustomers, isLoading: isLoadingAllCustomers } = useQuery<Customer[]>({ queryKey: ['customers'], queryFn: async () => { const { data, error } = await supabase.from('customers').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*'); // Select all fields for Profile type
      if (error) throw new Error(error.message);
      return data || [];
    }
  });
  const { data: serviceCategories, isLoading: isLoadingServiceCategories } = useQuery<ServiceCategory[]>({ queryKey: ['service_categories'], queryFn: async () => { const { data, error } = await supabase.from('service_categories').select('*'); if (error) throw new Error(error.message); return data || []; } });


  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const { error } = await supabase.from('work_orders').upsert([workOrderData]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders', { vehicleId: id }] });
      showSuccess('Work order has been updated.');
    },
    onError: (error) => showError(error.message),
  });

  const handleUpdateWorkOrder = (workOrderId: string, updates: Partial<WorkOrder>) => {
    const workOrder = workOrders?.find(wo => wo.id === workOrderId);
    if (!workOrder) return;

    const oldWorkOrder = { ...workOrder };
    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = '';

    if (updates.status && updates.status !== oldWorkOrder.status) {
      activityMessage = `Status changed from '${oldWorkOrder.status || 'N/A'}' to '${updates.status}'.`;
    } else if (updates.assignedTechnicianId && updates.assignedTechnicianId !== oldWorkOrder.assignedTechnicianId) {
      const oldTech = technicians?.find(t => t.id === oldWorkOrder.assignedTechnicianId)?.name || 'Unassigned';
      const newTech = technicians?.find(t => t.id === updates.assignedTechnicianId)?.name || 'Unassigned';
      activityMessage = `Assigned technician changed from '${oldTech}' to '${newTech}'.`;
    } else if (updates.slaDue && updates.slaDue !== oldWorkOrder.slaDue) {
      activityMessage = `SLA due date updated to '${dayjs(updates.slaDue).format('MMM D, YYYY h:mm A')}'.`;
    } else if (updates.appointmentDate && updates.appointmentDate !== oldWorkOrder.appointmentDate) {
      activityMessage = `Appointment date updated to '${dayjs(updates.appointmentDate).format('MMM D, YYYY h:mm A')}'.`;
    } else if (updates.service && updates.service !== oldWorkOrder.service) {
      activityMessage = `Service description updated.`;
    } else if (updates.serviceNotes && updates.serviceNotes !== oldWorkOrder.serviceNotes) {
      activityMessage = `Service notes updated.`;
    } else if (updates.priority && updates.priority !== oldWorkOrder.priority) {
      activityMessage = `Priority changed from '${oldWorkOrder.priority || 'N/A'}' to '${updates.priority}'.`;
    } else if (updates.locationId && updates.locationId !== oldWorkOrder.locationId) {
      const oldLoc = locations?.find(l => l.id === oldWorkOrder.locationId)?.name || 'N/A';
      const newLoc = locations?.find(l => l.id === updates.locationId)?.name || 'N/A';
      activityMessage = `Service location changed from '${oldLoc}' to '${newLoc}'.`;
    } else if (updates.customerAddress && updates.customerAddress !== oldWorkOrder.customerAddress) {
      activityMessage = `Client address updated to '${updates.customerAddress}'.`;
    } else if (updates.customerLat !== oldWorkOrder.customerLat || updates.customerLng !== oldWorkOrder.customerLng) {
      activityMessage = `Client coordinates updated.`;
    } else {
      activityMessage = 'Work order details updated.'; // Generic message for other changes
    }

    if (activityMessage) {
      newActivityLog.push({ timestamp: new Date().toISOString(), activity: activityMessage, userId: session?.user.id ?? null });
      updates.activityLog = newActivityLog;
    }

    if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Ready') {
      updates.status = 'In Progress';
      showInfo(`Work Order ${workOrder.workOrderNumber} automatically moved to In Progress.`);
    }
    
    workOrderMutation.mutate(camelToSnakeCase({ id: workOrder.id, ...updates }));
  };

  const isLoading = isLoadingVehicle || isLoadingCustomer || isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations || isLoadingAllCustomers || isLoadingProfiles || isLoadingServiceCategories;

  // Filter work orders by selected week (if any)
  const filteredWorkOrders = useMemo(() => {
    if (!workOrders) return [];
    if (!selectedWeek) return workOrders;
    return workOrders.filter(wo => {
      if (!wo.created_at) return false;
      return dayjs(wo.created_at).week() === selectedWeek;
    });
  }, [workOrders, selectedWeek]);


  if (isLoading) {
    return <Skeleton active />;
  }

  if (vehicleError) {
    // Log error for debugging
  console.error('AssetDetailsPage error:', vehicleError);
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <Typography.Title level={4} type="danger">Error loading asset</Typography.Title>
        <Typography.Text type="secondary">{vehicleError.message}</Typography.Text>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <Typography.Title level={4}>Asset Not Found</Typography.Title>
        <Typography.Text type="secondary">The asset you are looking for does not exist or has been deleted.</Typography.Text>
      </div>
    );
  }

  const assetAge = vehicle.release_date ? formatDistanceToNow(new Date(vehicle.release_date)) : 'N/A';

  const handleProceedFromCreateDialog = (selectedVehicle: VehicleWithCustomer) => {
    setIsCreateDialogOpen(false);
    const initialSlaDue = dayjs().add(15, 'minutes').toISOString(); // Default 15 min for first response
    const prefill = {
      vehicleId: selectedVehicle.id,
      customerId: selectedVehicle.customer_id,
      customerName: selectedVehicle.customers?.name || '', // Ensure it's a string
      customerPhone: selectedVehicle.customers?.phone || '', // Ensure it's a string
      vehicleModel: `${selectedVehicle.make} ${selectedVehicle.model}`,
      slaDue: initialSlaDue, // Add default SLA due date
    };
    setPrefillData(prefill);
    setIsFormDrawerOpen(true);
  };

  const handleSaveWorkOrder = () => {
    queryClient.invalidateQueries({ queryKey: ['work_orders', { vehicleId: id }] });
    setIsFormDrawerOpen(false);
    setPrefillData(null);
  };



  const backButton = (
  <Button icon={<Icon icon="ant-design:arrow-left-outlined" />} onClick={() => navigate('/assets')} />
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <AppBreadcrumb backButton={backButton} />
      {/* 1. Asset details and owner info (full width) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 0 }}>
        <Col span={24}>
          <Card size="small">
            <div style={{ width: '100%' }}>
              <Title level={4}>{vehicle.license_plate}</Title>
              <Text type="secondary">{`${vehicle.year} ${vehicle.make} ${vehicle.model}`}</Text>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start', width: '100%', marginTop: 16 }}>
                <div style={{ flex: 2, minWidth: 0 }}>
                  <Title level={5}>Vehicle Information</Title>
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="VIN / Chassis Number">{vehicle.vin}</Descriptions.Item>
                    <Descriptions.Item label="Motor Number">{vehicle.motor_number || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Mileage">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} KMs` : 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Manufacture Date">{vehicle.date_of_manufacture ? dayjs(vehicle.date_of_manufacture).format('MMMM D, YYYY') : 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Release Date">{vehicle.release_date ? dayjs(vehicle.release_date).format('MMMM D, YYYY') : 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Asset Age">{assetAge}</Descriptions.Item>
                    <Descriptions.Item label="Battery (kWh)">{vehicle.battery_capacity || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </div>
                {customer && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Title level={5}>Owner Information</Title>
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label={<Icon icon="ant-design:user-outlined" />}>{customer.name}</Descriptions.Item>
                      <Descriptions.Item label={<Icon icon="ant-design:mail-outlined" />}><a href={`mailto:${customer.email}`}>{customer.email}</a></Descriptions.Item>
                      <Descriptions.Item label={<Icon icon="ant-design:phone-outlined" />}><a href={`tel:${customer.phone}`}>{customer.phone}</a></Descriptions.Item>
                    </Descriptions>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      {/* 2. Repair Activity Timeline (full width) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 0 }}>
        <Col span={24}>
          <RepairActivityTimeline
            workOrders={(workOrders || []).filter(wo => typeof wo.created_at === 'string') as { created_at: string }[]}
            selectedWeek={selectedWeek}
            onSelectWeek={setSelectedWeek}
          />
        </Col>
      </Row>
      {/* 3. Service history table (full width, own line) */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Title level={5}>Service History {selectedWeek ? `(Week ${selectedWeek})` : ''}</Title>
            <WorkOrderDataTable
              workOrders={filteredWorkOrders}
              technicians={technicians || []}
              locations={locations || []}
              customers={allCustomers || []}
              vehicles={vehicle ? [vehicle] : []}
              onEdit={(wo) => {
                setEditingWorkOrder(wo);
                setIsFormDrawerOpen(true);
              }}
              onDelete={() => {}}
              onUpdateWorkOrder={handleUpdateWorkOrder}
              onViewDetails={(id) => {
                setViewingWorkOrderId(id);
              }}
              profiles={profiles || []}
              visibleColumns={visibleColumns || []}
              onVisibleColumnsChange={setVisibleColumns}
            />
          </Card>
        </Col>
      </Row>
      <CreateWorkOrderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onProceed={handleProceedFromCreateDialog}
        initialVehicle={vehicle}
      />
      <WorkOrderFormDrawer
        isOpen={isFormDrawerOpen}
        onClose={() => {
          setIsFormDrawerOpen(false);
          setEditingWorkOrder(null);
          setPrefillData(null);
        }}
        onSave={() => {
          handleSaveWorkOrder();
          setEditingWorkOrder(null);
        }}
        workOrder={editingWorkOrder}
        technicians={technicians || []}
        locations={locations || []}
        serviceCategories={serviceCategories || []}
        prefillData={prefillData}
      />
      <WorkOrderDetailsDrawer
        onClose={() => setViewingWorkOrderId(null)}
        workOrderId={viewingWorkOrderId}
        open={!!viewingWorkOrderId}
      />
    </Space>
  );
};

export default AssetDetailsPage;