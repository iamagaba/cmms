import { useState } from "react";
import { Row, Col, Typography, Segmented, Badge, Space } from "antd";
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0 }}>Overview</Title>
          <Segmented
            options={locationOptions}
            value={selectedLocation}
            onChange={(value) => setSelectedLocation(value as string)}
          />
        </div>
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
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Title level={4}>Work Order Board</Title>
          <WorkOrderKanban 
            workOrders={filteredWorkOrders} 
            groupBy="status"
            columns={kanbanColumns}
          />
        </Col>
        <Col xs={24} xl={8}>
          <Title level={4}>Team & Locations</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TechnicianList />
            <LocationList />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;