import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Space, Typography, Descriptions, Skeleton } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import NotFound from "./NotFound";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"; // Import useMutation
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, Customer, WorkOrder, Technician, Location, Profile, ServiceCategory } from "@/types/supabase"; // Import Profile and ServiceCategory
import { WorkOrderDataTable, ALL_COLUMNS } from "@/components/WorkOrderDataTable"; // Import ALL_COLUMNS
import { formatDistanceToNow } from 'date-fns';
import dayjs from 'dayjs';
import { CreateWorkOrderDialog } from "@/components/CreateWorkOrderDialog";
import { WorkOrderFormDrawer } from "@/components/WorkOrderFormDrawer";
import { useState, useMemo } from "react";
import { camelToSnakeCase } from "@/utils/data-helpers"; // Import camelToSnakeCase
import { showSuccess, showInfo, showError } from "@/utils/toast"; // Import toast utilities
import { getColumns } from "@/components/WorkOrderTableColumns"; // Import getColumns
import { useSession } from "@/context/SessionContext";
import Breadcrumbs from "@/components/Breadcrumbs"; // Import Breadcrumbs

const { Title, Text } = Typography;

type VehicleWithCustomer = Vehicle & { customers: Customer | null };

const AssetDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useSession();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<WorkOrder> | null>(null);

  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<VehicleWithCustomer | null>({
    queryKey: ['vehicle', id],
    queryFn: async () => {
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
      return (data || []).map((item: any) => ({ ...item, createdAt: item.created_at, workOrderNumber: item.work_order_number, assignedTechnicianId: item.assigned_technician_id, locationId: item.location_id, serviceNotes: item.service_notes, partsUsed: item.parts_used, activityLog: item.activity_log, slaDue: item.sla_due, completedAt: item.completed_at, customerLat: item.customer_lat, customerLng: item.customer_lng, customerAddress: item.customer_address, onHoldReason: item.on_hold_reason, appointmentDate: item.appointment_date, customerId: item.customer_id, vehicleId: item.vehicle_id, created_by: item.created_by, service_category_id: item.service_category_id, confirmed_at: item.confirmed_at, work_started_at: item.work_started_at, sla_timers_paused_at: item.sla_timers_paused_at, total_paused_duration_seconds: item.total_paused_duration_seconds, initialDiagnosis: item.client_report, issueType: item.issue_type, faultCode: item.fault_code, maintenanceNotes: item.maintenance_notes })) || [];
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

  if (isLoading) {
    return <Skeleton active />;
  }

  if (!vehicle) {
    return <NotFound />;
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

  const defaultVisibleColumns = ALL_COLUMNS.map(c => c.value); // Use ALL_COLUMNS for default visibility

  const backButton = (
    <Button icon={<Icon icon="ph:arrow-left-fill" />} onClick={() => navigate('/assets')} />
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Breadcrumbs backButton={backButton} />
        <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
                <Card>
                    <Title level={4}>{vehicle.license_plate}</Title>
                    <Text type="secondary">{vehicle.year} ${vehicle.make} ${vehicle.model}</Text>
                    <Descriptions column={1} bordered style={{ marginTop: 16 }}>
                        <Descriptions.Item label="VIN / Chassis Number">{vehicle.vin}</Descriptions.Item>
                        <Descriptions.Item label="Motor Number">{vehicle.motor_number || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Mileage">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} KMs` : 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Manufacture Date">{vehicle.date_of_manufacture ? dayjs(vehicle.date_of_manufacture).format('MMMM D, YYYY') : 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Release Date">{vehicle.release_date ? dayjs(vehicle.release_date).format('MMMM D, YYYY') : 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Asset Age">{assetAge}</Descriptions.Item>
                        <Descriptions.Item label="Battery (kWh)">{vehicle.battery_capacity || 'N/A'}</Descriptions.Item>
                    </Descriptions>
                </Card>
                {customer && (
                    <Card style={{ marginTop: 16 }}>
                        <Title level={5}>Owner Information</Title>
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label={<Icon icon="ph:user-fill" />}>{customer.name}</Descriptions.Item>
                            <Descriptions.Item label={<Icon icon="ph:envelope-fill" />}><a href={`mailto:${customer.email}`}>{customer.email}</a></Descriptions.Item>
                            <Descriptions.Item label={<Icon icon="ph:phone-fill" />}><a href={`tel:${customer.phone}`}>{customer.phone}</a></Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}
            </Col>
            <Col xs={24} md={16}>
                <Card>
                    <Title level={5}>Service History</Title>
                    <WorkOrderDataTable 
                        workOrders={workOrders || []}
                        technicians={technicians || []}
                        locations={locations || []}
                        customers={allCustomers || []}
                        vehicles={vehicle ? [vehicle] : []}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onUpdateWorkOrder={handleUpdateWorkOrder}
                        onViewDetails={(id) => navigate(`/work-orders/${id}`)}
                        profiles={profiles || []}
                        visibleColumns={defaultVisibleColumns}
                        onVisibleColumnsChange={() => {}} // Added missing prop
                    />
                </Card>
            </Col>
        </Row>
        <CreateWorkOrderDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onProceed={handleProceedFromCreateDialog}
          initialVehicle={vehicle} // Pass the current vehicle directly
        />
        <WorkOrderFormDrawer
          isOpen={isFormDrawerOpen}
          onClose={() => { setIsFormDrawerOpen(false); setPrefillData(null); }}
          onSave={handleSaveWorkOrder}
          technicians={technicians || []}
          locations={locations || []}
          serviceCategories={serviceCategories || []}
          prefillData={prefillData}
        />
    </Space>
  );
};

export default AssetDetailsPage;