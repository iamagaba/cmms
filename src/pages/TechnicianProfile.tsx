import { useParams, Link, useNavigate } from "react-router-dom";
import { technicians, workOrders, locations } from "@/data/mockData";
import { Avatar, Card, Col, Row, Typography, Tag, Descriptions, Table, Button, Space } from "antd";
import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, ToolOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import NotFound from "./NotFound";

const { Title, Text } = Typography;

const statusColorMap: Record<string, string> = {
  available: 'success',
  busy: 'warning',
  offline: 'default',
};

const statusTextMap: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
};

const priorityColors: Record<string, string> = {
    High: "red",
    Medium: "gold",
    Low: "green",
};

const TechnicianProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const technician = technicians.find(t => t.id === id);
  const assignedWorkOrders = workOrders.filter(wo => wo.assignedTechnicianId === id);

  if (!technician) {
    return <NotFound />;
  }

  const workOrderColumns = [
    { title: 'ID', dataIndex: 'id', render: (text: string) => <Link to={`/work-orders#${text}`}><Text code>{text}</Text></Link> },
    { title: 'Vehicle', dataIndex: 'vehicleId' },
    { title: 'Priority', dataIndex: 'priority', render: (priority: string) => <Tag color={priorityColors[priority]}>{priority}</Tag> },
    { title: 'Location', dataIndex: 'locationId', render: (locId: string) => locations.find(l => l.id === locId)?.name || 'N/A' },
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
                        <Avatar size={128} src={technician.avatar}>{technician.name.split(' ').map(n => n[0]).join('')}</Avatar>
                        <Title level={4} style={{ marginTop: 16 }}>{technician.name}</Title>
                        <Tag color={statusColorMap[technician.status]}>{statusTextMap[technician.status]}</Tag>
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
                    <Title level={5}>Assigned Work Orders ({assignedWorkOrders.length})</Title>
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