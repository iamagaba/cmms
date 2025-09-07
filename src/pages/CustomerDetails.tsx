import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Space, Typography, Descriptions, Skeleton, Table } from "antd";
import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from "@ant-design/icons";
import NotFound from "./NotFound";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Vehicle, WorkOrder } from "@/types/supabase";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const CustomerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  const isLoading = isLoadingCustomer || isLoadingVehicles || isLoadingWorkOrders;

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

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>
        Back to Customers
      </Button>
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
    </Space>
  );
};

export default CustomerDetailsPage;