import { Row, Col, Typography } from "antd";
import KpiCard from "@/components/KpiCard";
import LocationList from "@/components/LocationList";
import TechnicianList from "@/components/TechnicianList";
import WorkOrderKanban from "@/components/WorkOrderKanban";
import { workOrders } from "../data/mockData";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, ToolOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Dashboard = () => {
  const totalOrders = workOrders.length;
  const openOrders = workOrders.filter(o => o.status === 'Open' || o.status === 'In Progress').length;
  const completedOrders = workOrders.filter(o => o.status === 'Completed').length;
  const slaMet = workOrders.filter(o => o.status === 'Completed' && new Date(o.slaDue) >= new Date()).length;
  const slaPerformance = completedOrders > 0 ? ((slaMet / completedOrders) * 100).toFixed(0) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <Title level={4}>Overview</Title>
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
          <WorkOrderKanban workOrders={workOrders} />
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