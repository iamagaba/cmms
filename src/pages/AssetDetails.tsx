import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Space, Typography, Descriptions, Skeleton } from "antd";
import { ArrowLeftOutlined, UserOutlined, MailOutlined, PhoneOutlined, PlusOutlined } from "@ant-design/icons";
import NotFound from "./NotFound";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, Customer, WorkOrder, Technician, Location } from "@/types/supabase";
import { WorkOrderDataTable } from "@/components/WorkOrderDataTable";
import { formatDistanceToNow } from 'date-fns';
import dayjs from 'dayjs';
import PageHeader from "@/components/PageHeader";
import { CreateWorkOrderDialog } from "@/components/CreateWorkOrderDialog";
import { WorkOrderFormDrawer } from "@/components/WorkOrderFormDrawer";
import { useState } from "react";

const { Title, Text } = Typography;

type VehicleWithCustomer = Vehicle & { customers: Customer | null };

const AssetDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      const { data, error } = await supabase.from('work_orders').select('*').eq('vehicle_id', id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!id,
  });
  
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({ queryKey: ['technicians'], queryFn: async () => { const { data, error } = await supabase.from('technicians').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: allCustomers, isLoading: isLoadingAllCustomers } = useQuery<Customer[]>({ queryKey: ['customers'], queryFn: async () => { const { data, error } = await supabase.from('customers').select('*'); if (error) throw new Error(error.message); return data || []; } });


  const isLoading = isLoadingVehicle || isLoadingCustomer || isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations || isLoadingAllCustomers;

  if (isLoading) {
    return <Skeleton active />;
  }

  if (!vehicle) {
    return <NotFound />;
  }

  const assetAge = vehicle.release_date ? formatDistanceToNow(new Date(vehicle.release_date)) : 'N/A';

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
    queryClient.invalidateQueries({ queryKey: ['work_orders', { vehicleId: id }] });
    setIsFormDrawerOpen(false);
    setPrefillData(null);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <PageHeader
          title={
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/assets')}>
                Back to Assets
              </Button>
              <Title level={4} style={{ margin: 0 }}>Asset Details</Title>
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
                    <Title level={4}>{vehicle.license_plate}</Title>
                    <Text type="secondary">{vehicle.year} {vehicle.make} {vehicle.model}</Text>
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
                            <Descriptions.Item label={<UserOutlined />}>{customer.name}</Descriptions.Item>
                            <Descriptions.Item label={<MailOutlined />}><a href={`mailto:${customer.email}`}>{customer.email}</a></Descriptions.Item>
                            <Descriptions.Item label={<PhoneOutlined />}><a href={`tel:${customer.phone}`}>{customer.phone}</a></Descriptions.Item>
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
                        onUpdateWorkOrder={() => {}}
                        onViewDetails={(id) => navigate(`/work-orders/${id}`)}
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
          prefillData={prefillData}
        />
    </Space>
  );
};

export default AssetDetailsPage;