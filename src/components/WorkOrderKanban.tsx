import { workOrders, technicians, locations, WorkOrder } from "../data/mockData";
import WorkOrderCard from "./WorkOrderCard";
import { Row, Col, Typography, Tag } from "antd";

const { Title } = Typography;

const columns: WorkOrder['status'][] = ['Open', 'In Progress', 'On Hold', 'Completed'];

const statusColors = {
  Open: "blue",
  "In Progress": "gold",
  "On Hold": "orange",
  Completed: "green",
};

const WorkOrderKanban = () => {
  const getColumnOrders = (status: WorkOrder['status']) => {
    return workOrders.filter(order => order.status === status);
  };

  return (
    <Row gutter={[16, 16]}>
      {columns.map(status => (
        <Col key={status} xs={24} md={12} lg={6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: `2px solid ${statusColors[status]}`, paddingBottom: 8 }}>
            <Title level={5} style={{ margin: 0 }}>{status}</Title>
            <Tag color={statusColors[status]}>{getColumnOrders(status).length}</Tag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 22rem)', overflowY: 'auto', paddingRight: 8 }}>
            {getColumnOrders(status).map(order => {
              const technician = technicians.find(t => t.id === order.assignedTechnicianId);
              const location = locations.find(l => l.id === order.locationId);
              return <WorkOrderCard key={order.id} order={order} technician={technician} location={location} />;
            })}
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default WorkOrderKanban;