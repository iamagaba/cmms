import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Space, Typography, Descriptions, Skeleton, Table } from "antd";
import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, PlusOutlined } from "@ant-design/icons";
import NotFound from "./NotFound";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Vehicle, WorkOrder, Technician, Location } from "@/types/supabase";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import { CreateWorkOrderDialog } from "@/components/CreateWorkOrderDialog";
import { WorkOrderFormDrawer } from "@/components/WorkOrderFormDrawer";

const { Title, Text } = Typography;

type VehicleWithCustomer = Vehicle & { customers: Customer | null };

const CustomerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<WorkOrder> | null>(null);

  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer | null>({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles', { customerId: id }],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('vehicles').select('*').eq('customer_id', id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders', { customerId: id }],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('work_orders').select('*').eq('customer_id', id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });

  const isLoading = isLoadingCustomer || isLoadingVehicles || isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations;

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
    setPrefillData({
      vehicleId: selectedVehicle.id,
      customerId: selectedVehicle.customer_id,
      customerName: selectedVehicle.customers?.name,
      customerPhone: selectedVehicle.customers?.phone,
      vehicleModel: `${selectedVehicle.make} ${selectedVehicle.model}`,
    });
    setIsFormDrawerOpen(true);
  };

  const handleSaveWorkOrder = () => {
    queryClient.invalidateQueries({ queryKey: ['work_orders', { customerId: id }] });
    setIsFormDrawerOpen(false);
    setPrefillData(null);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <PageHeader
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>
              Back to Customers
            </Button>
            <Title level={4} style={{ margin: 0 }}>Customer Details</Title>
          </Space>
        }
        hideSearch
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateDialogOpen(true)}>
            Create Work Order
          </Button>
        }
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Title level={4}>{customer.name}</Title>
            <Descriptions column={1} bordered>
              <Descriptions.Item label={<MailOutlined />}>
                <a href={`mailto:${customer.email}`}>{customer.email}</a>
              </Descriptions.Item>
              <Descriptions.Item label={<PhoneOutlined />}>
                <a href={`tel:${customer.phone}`}>{customer.phone || 'N/A'}</a>
              </Descriptions.Item>
              <Descriptions.Item label={<EnvironmentOutlined />}>
                {customer.address || 'N/A'}
                <br />
                {customer.city && `${customer.city}, `}{customer.state && `${customer.state} `}{customer.zip_code}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="Associated Assets">
              <Table
                dataSource={vehicles}
                columns={vehicleColumns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
            <Card title="Work Order History">
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
        prefillData={prefillData}
      />
    </Space>
  );
};

export default CustomerDetailsPage;