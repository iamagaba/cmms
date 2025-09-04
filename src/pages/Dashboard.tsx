import { useState } from "react";
import { Row, Col, Typography, Segmented, Badge, Space, Card } from "antd";
import KpiCard from "@/components/KpiCard";
import LocationList from "@/components/LocationList";
import TechnicianList from "@/components/TechnicianList";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { workOrders, locations } from "../data/mockData";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, ToolOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const filteredWorkOrders = selectedLocation === 'all'
    ? workOrders
    : workOrders.filter(wo => wo.locationId === selectedLocation);

  const totalOrders = filteredWorkOrders.length;
  const openOrders = filteredWorkOrders.filter(o => o.status === 'Open' || o.status === 'In Progress').length;
  const completedOrders = filteredWorkOrders.filter(o => o.status === 'Completed').length;
  const slaMet = filteredWorkOrders.filter(o => o.status === 'Completed' && new Date(o.slaDue) >= new Date()).length;
  const slaPerformance = completedOrders > 0 ? ((slaMet / completedOrders) * 100).toFixed(0) : 0;

  const kanbanColumns = [
    { id: 'Open', title: 'Open' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'On Hold', title: 'On Hold' },
    { id: 'Completed', title: 'Completed' },
  ];

  const locationOptions = [
    { 
      label: (
        <Space>
          <span>All Locations</span>
          <Badge count={workOrders.length} showZero color="#1677ff" />
        </Space>
      ), 
      value: 'all' 
    },
    ...locations.map(loc => {
      const count = workOrders.filter(wo => wo.locationId === loc.id).length;
      return {
        label: (
          <Space>
            <span>{loc.name}</span>
            <Badge count={count} showZero color="#1677ff" />
          </Space>
        ),
        value: loc.id
      }
    })
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>Overview</Title>
          </Col>
          <Col>
            <Segmented
              options={locationOptions}
              value={selectedLocation}
              onChange={(value) => setSelectedLocation(value as string)}
            />
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard title="Total Work Orders" value={totalOrders.toString()} icon={<ToolOutlined />} />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard title="Open Work Orders" value={openOrders.toString()} icon={<ExclamationCircleOutlined />} />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard title="SLA Performance" value={`${slaPerformance}%`} icon={<CheckCircleOutlined />} />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <KpiCard title="Avg. Completion Time" value="3.2 Days" icon={<ClockCircleOutlined />} />
          </Col>
        </Row>
      </Card>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Card title="Work Order Board">
            <WorkOrderKanban
              workOrders={filteredWorkOrders}
              groupBy="status"
              columns={kanbanColumns}
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="Team & Locations">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <TechnicianList />
              <LocationList />
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default Dashboard;