import { useParams, Link, useNavigate } from "react-router-dom";
import { Avatar, Card, Col, Row, Typography, Tag, Descriptions, Table, Button, Space, Skeleton } from "antd";
import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, ToolOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Technician, WorkOrder, Location } from "@/types/supabase";

const { Title, Text } = Typography;

const statusColorMap: Record<string, string> = { available: 'success', busy: 'warning', offline: 'default' };
const statusTextMap: Record<string, string> = { available: 'Available', busy: 'Busy', offline: 'Offline' };
const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };

const TechnicianProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: technician, isLoading: isLoadingTechnician } = useQuery<Technician | null>({
    queryKey: ['technician', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  const { data: assignedWorkOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders', { technicianId: id }],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*').eq('assigned_technician_id', id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const isLoading = isLoadingTechnician || isLoadingWorkOrders || isLoadingLocations;

  if (isLoading) {
    return <Skeleton active />;
  }

  if (!technician) {
    return <NotFound />;
  }

  const workOrderColumns = [
    { title: 'ID', dataIndex: 'workOrderNumber', render: (text: string, record: WorkOrder) => <Link to={`/work-orders/${record.id}`}><Text code>{text}</Text></Link> },
    { title: 'Vehicle', dataIndex: 'vehicleId' },
    { title: 'Priority', dataIndex: 'priority', render: (priority: string) => <Tag color={priorityColors[priority]}>{priority}</Tag> },
    { title: 'Location', dataIndex: 'locationId', render: (locId: string) => locations?.find(l => l.id === locId)?.name || 'N/A' },
    { title: 'Due Date', dataIndex: 'slaDue', render: (date: string) => dayjs(date).format('MMM D, YYYY') },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/technicians')}>
            Back to Technicians
        </Button>
        <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
                <Card>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Avatar size={128} src={technician.avatar || undefined}>{technician.name.split(' ').map(n => n[0]).join('')}</Avatar>
                        <Title level={4} style={{ marginTop: 16 }}>{technician.name}</Title>
                        <Tag color={statusColorMap[technician.status || 'offline']}>{statusTextMap[technician.status || 'offline']}</Tag>
                    </div>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label={<><MailOutlined /> Email</>}><a href={`mailto:${technician.email}`}>{technician.email}</a></Descriptions.Item>
                        <Descriptions.Item label={<><PhoneOutlined /> Phone</>}><a href={`tel:${technician.phone}`}>{technician.phone}</a></Descriptions.Item>
                        <Descriptions.Item label={<><ToolOutlined /> Specialization</>}>{technician.specialization}</Descriptions.Item>
                        <Descriptions.Item label={<><CalendarOutlined /> Member Since</>}>{dayjs(technician.joinDate).format('MMMM YYYY')}</Descriptions.Item>
                    </Descriptions>
                </Card>
            </Col>
            <Col xs={24} md={16}>
                <Card>
                    <Title level={5}>Assigned Work Orders ({assignedWorkOrders?.length || 0})</Title>
                    <Table 
                        dataSource={assignedWorkOrders} 
                        columns={workOrderColumns} 
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                    />
                </Card>
            </Col>
        </Row>
    </Space>
  );
};

export default TechnicianProfilePage;