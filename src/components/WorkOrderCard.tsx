import { Card, Avatar, Typography, Tooltip, theme } from "antd";
import { WorkOrder, Technician, Vehicle, Location } from "@/types/supabase";
import SlaCountdown from "./SlaCountdown";
import "./WorkOrderCard.css";
const { Text } = Typography;

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  vehicle: Vehicle | undefined;
  location?: Location;
  onViewDetails: () => void;
}

const WorkOrderCard = ({ order, technician, vehicle, location, onViewDetails }: WorkOrderCardProps) => {
  const { token } = theme.useToken();
  const cardStyle = {
    height: '100%',
    cursor: 'pointer',
    padding: 0,
    minWidth: 0,
    borderRadius: token.borderRadius,
    background: token.colorBgContainer,
    border: `1px solid ${token.colorSplit}`,
    boxShadow: 'none',
    transition: 'box-shadow 0.18s, border 0.18s',
  } as React.CSSProperties;


  // Only show initial diagnosis
  const diagnosis = order.initialDiagnosis || '';
  const truncatedDiagnosis = diagnosis.length > 90 ? diagnosis.slice(0, 87) + '…' : diagnosis;

  return (
    <Card
      size="small"
      hoverable
      className="work-order-card"
      style={cardStyle}
      bodyStyle={{ padding: 10, minHeight: 100 }}
      onClick={onViewDetails}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <Text code style={{ fontSize: 13, padding: 1 }}>{order.workOrderNumber}</Text>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{vehicle ? vehicle.license_plate : 'N/A'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <SlaCountdown slaDue={order.slaDue} status={order.status} completedAt={order.completedAt} />
        <Tooltip title={technician ? `Assigned to ${technician.name}` : 'Unassigned'}>
          <Avatar size={20} src={technician?.avatar || undefined} style={{ fontSize: 11 }}>
            {technician ? technician.name.split(' ').map(n => n[0]).join('') : '?'}
          </Avatar>
        </Tooltip>
        <span style={{ fontSize: 12, color: token.colorTextTertiary }}>{location ? location.name.replace(' Service Center', '') : ''}</span>
      </div>
      <div style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2, minHeight: 32, maxHeight: 32, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-line' }}>
        {truncatedDiagnosis}
      </div>
    </Card>
  );
};

export default WorkOrderCard;
