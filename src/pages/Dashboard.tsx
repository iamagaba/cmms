import { useState } from "react";
import { Row, Col, Typography, Segmented, Badge, Space } from "antd";
import KpiCard from "@/components/KpiCard";
import TechnicianStatusList from "@/components/TechnicianStatusList";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { workOrders, locations, technicians, WorkOrder } from "../data/mockData";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, ToolOutlined } from "@ant-design/icons";
import UrgentWorkOrders from "@/components/UrgentWorkOrders";
import { showSuccess } from "@/utils/toast";

const { Title } = Typography;

// Mock data for sparkline charts
const generateChartData = () => Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 100) }));

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [allWorkOrders, setAllWorkOrders] = useState(workOrders);

  const handleUpdateWorkOrder = (id: string, field: keyof WorkOrder, value: any) => {
    setAllWorkOrders(prevOrders =>
      prevOrders.map(wo =>
        wo.id === id ? { ...wo, [field]: value } : wo
      )
    );
    showSuccess(`Work order ${id} ${String(field)} updated.`);
  };

  const filteredWorkOrders = selectedLocation === 'all'
    ? allWorkOrders
    : allWorkOrders.filter(wo => wo.locationId === selectedLocation);

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
          <Badge count={allWorkOrders.length} showZero color="#1677ff" />
        </Space>
      ), 
      value: 'all' 
    },
    ...locations.map(loc => {
      const count = allWorkOrders.filter(wo => wo.locationId === loc.id).length;
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
      <UrgentWorkOrders workOrders={allWorkOrders} technicians={technicians} />
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
          <Col xs={24} sm={12} md={12} lg={6} className="fade-in" style={{ animationDelay: '0ms' }}>
            <KpiCard title="Total Work Orders" value={totalOrders.toString()} icon={<ToolOutlined />} trend="+5%" trendDirection="up" chartData={generateChartData()} />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6} className="fade-in" style={{ animationDelay: '100ms' }}>
            <KpiCard title="Open Work Orders" value={openOrders.toString()} icon={<ExclamationCircleOutlined />} trend="+3" trendDirection="up" isUpGood={false} chartData={generateChartData()} />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6} className="fade-in" style={{ animationDelay: '200ms' }}>
            <KpiCard title="SLA Performance" value={`${slaPerformance}%`} icon={<CheckCircleOutlined />} trend="+1.2%" trendDirection="up" chartData={generateChartData()} />
          </Col>
          <Col xs={24} sm={12} md={12} lg={6} className="fade-in" style={{ animationDelay: '300ms' }}>
            <KpiCard title="Avg. Completion Time" value="3.2 Days" icon={<ClockCircleOutlined />} trend="-0.2 Days" trendDirection="down" isUpGood={false} chartData={generateChartData()} />
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
            onUpdateWorkOrder={handleUpdateWorkOrder}
          />
        </Col>
        <Col xs={24} xl={8}>
          <Title level={4}>Team Status</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TechnicianStatusList />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;