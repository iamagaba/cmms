import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Space, Typography, Descriptions, Skeleton, Table } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import NotFound from "./NotFound";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Vehicle, WorkOrder, Technician, Location, Profile, ServiceCategory } from "@/types/supabase"; // Import Profile and ServiceCategory
import { Link } from "react-router-dom";
import { useState } from "react";
import { CreateWorkOrderDialog } from "@/components/CreateWorkOrderDialog";
import { WorkOrderFormDrawer } from "@/components/WorkOrderFormDrawer";
import { snakeToCamelCase } from "@/utils/data-helpers";
// import { showSuccess } from "@/utils/toast";
import dayjs from "dayjs";
// import { useSession } from "@/context/SessionContext";
import AppBreadcrumb from "@/components/Breadcrumbs";

const { Title } = Typography;

type VehicleWithCustomer = Vehicle & { customers: Customer | null };

const CustomerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // const { session } = useSession();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<WorkOrder> | null>(null);

  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer | null>({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data ? snakeToCamelCase(data) as Customer : null;
    },
    enabled: !!id,
  });

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles', { customerId: id }],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('vehicles').select('*').eq('customer_id', id);
      if (error) throw new Error(error.message);
      return (data || []).map(vehicle => snakeToCamelCase(vehicle) as Vehicle);
    },
    enabled: !!id,
  });

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders', { customerId: id }],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('work_orders').select('*').eq('customer_id', id);
      if (error) throw new Error(error.message);
      return (data || []).map(workOrder => snakeToCamelCase(workOrder) as WorkOrder);
    },
    enabled: !!id,
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return (data || []).map(tech => snakeToCamelCase(tech) as Technician); } });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return (data || []).map(location => snakeToCamelCase(location) as Location); } });
  const { isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*'); // Select all fields for Profile type
      if (error) throw new Error(error.message);
      return (data || []).map(profile => snakeToCamelCase(profile) as Profile);
    }
  });
  const { data: serviceCategories, isLoading: isLoadingServiceCategories } = useQuery<ServiceCategory[]>({ queryKey: ['service_categories'], queryFn: async () => { const { data, error } = await supabase.from('service_categories').select('*'); if (error) throw new Error(error.message); return (data || []).map(category => snakeToCamelCase(category) as ServiceCategory); } });


  // Note: Inline work order updates were removed in this page to reduce duplication; details tables link to Work Order views.


  const isLoading = isLoadingCustomer || isLoadingVehicles || isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations || isLoadingProfiles || isLoadingServiceCategories;

  if (isLoading) {
    return <Skeleton active />;
  }

  if (!customer) {
    return <NotFound />;
  }

  const vehicleColumns = [
    { title: 'License Plate', dataIndex: 'license_plate', render: (text: string, record: Vehicle) => <Link to={`/assets/${record.id}`}>{text}</Link> },
    { title: 'Vehicle', dataIndex: 'make', render: (_: any, record: Vehicle) => `${record.year} ${record.make} ${record.model}` },
    { title: 'VIN', dataIndex: 'vin' },
  ];

  const workOrderColumns = [
    { title: 'ID', dataIndex: 'workOrderNumber', render: (text: string, record: WorkOrder) => <Link to={`/work-orders/${record.id}`}>{text}</Link> },
    { title: 'Service', dataIndex: 'service' },
    { title: 'Status', dataIndex: 'status' },
    { title: 'Date Created', dataIndex: 'createdAt', render: (text: string) => new Date(text).toLocaleDateString() },
  ];

  const handleProceedFromCreateDialog = (selectedVehicle: VehicleWithCustomer) => {
    setIsCreateDialogOpen(false);
    const initialSlaDue = dayjs().add(15, 'minutes').toISOString(); // Default 15 min for first response
    setPrefillData({
      vehicleId: selectedVehicle.id,
      customerId: selectedVehicle.customer_id,
      customerName: selectedVehicle.customers?.name || '', // Ensure it's a string
      customerPhone: selectedVehicle.customers?.phone || '', // Ensure it's a string
      vehicleModel: `${selectedVehicle.make} ${selectedVehicle.model}`,
      slaDue: initialSlaDue, // Add default SLA due date
    });
    setIsFormDrawerOpen(true);
  };

  const handleSaveWorkOrder = () => {
    queryClient.invalidateQueries({ queryKey: ['work_orders', { customerId: id }] });
    setIsFormDrawerOpen(false);
    setPrefillData(null);
  };

  const backButton = (
    <Button icon={<Icon icon="ph:arrow-left-fill" />} onClick={() => navigate('/customers')} />
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
  <AppBreadcrumb backButton={backButton} />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card size="small">
            <Title level={4}>{customer.name}</Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={<Icon icon="ph:envelope-fill" />}>
                <a href={`mailto:${customer.email}`}>{customer.email}</a>
              </Descriptions.Item>
              <Descriptions.Item label={<Icon icon="ph:phone-fill" />}>
                <a href={`tel:${customer.phone}`}>{customer.phone || 'N/A'}</a>
              </Descriptions.Item>
              <Descriptions.Item label={<Icon icon="ph:map-pin-fill" />}>
                {customer.address || 'N/A'}
                <br />
                {customer.city && `${customer.city}, `}{customer.state && `${customer.state} `}{customer.zip_code}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card size="small" title="Associated Assets">
              <Table
                dataSource={vehicles}
                columns={vehicleColumns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
            <Card size="small" title="Work Order History">
              <Table
                dataSource={workOrders}
                columns={workOrderColumns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Space>
        </Col>
      </Row>
      <CreateWorkOrderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onProceed={handleProceedFromCreateDialog}
        initialCustomerId={customer.id} // Pass the current customer ID for filtering
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

export default CustomerDetailsPage;