import React from 'react';
import { Card, Descriptions, Select, DatePicker, Avatar, Typography, theme } from 'antd';
import StatusChip from "@/components/StatusChip";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import dayjs from 'dayjs';
import { WorkOrder, Technician, Location } from '@/types/supabase';

const { Option } = Select;
const { Text } = Typography;
const { useToken } = theme;

const channelOptions = ['Call Center', 'Service Center', 'Social Media', 'Staff', 'Swap Station'];

interface WorkOrderDetailsInfoCardProps {
  workOrder: WorkOrder;
  technician: Technician | null;
  allTechnicians: Technician[];
  allLocations: Location[];
  handleUpdateWorkOrder: (updates: Partial<WorkOrder>) => void;
}

export const WorkOrderDetailsInfoCard: React.FC<WorkOrderDetailsInfoCardProps> = ({
  workOrder,
  technician,
  allTechnicians,
  handleUpdateWorkOrder,
}) => {
  const { token } = useToken();
  const [cardHover, setCardHover] = React.useState(false);
  const cardStyle = {
    borderRadius: 16,
    background: token.colorBgContainer,
    border: `1px solid ${cardHover ? token.colorBorder : token.colorSplit}`,
    boxShadow: cardHover ? token.boxShadowSecondary : token.boxShadowTertiary,
    transition: 'box-shadow 0.18s, border 0.18s, background 0.18s',
  } as React.CSSProperties;

  // Colors handled by StatusChip; keep token for local usage if needed

  return (
  <Card size="small" title="Work Order Details" style={cardStyle} bodyStyle={{ padding: 12 }} onMouseEnter={() => setCardHover(true)} onMouseLeave={() => setCardHover(false)}>
    <Descriptions column={1} bordered size="small"> {/* Added bordered prop here */}
        <Descriptions.Item label="Status" labelStyle={{ width: '150px' }}>
          <Select
            value={workOrder.status || 'Open'}
            onChange={(value) => handleUpdateWorkOrder({ status: value })}
            style={{ width: 180 }}
            bordered={false}
            suffixIcon={null}
          >
            <Option value="Open"><StatusChip kind="status" value="Open" /></Option>
            <Option value="Confirmation"><StatusChip kind="status" value="Confirmation" /></Option>
            <Option value="Ready"><StatusChip kind="status" value="Ready" /></Option>
            <Option value="In Progress"><StatusChip kind="status" value="In Progress" /></Option>
            <Option value="On Hold"><StatusChip kind="status" value="On Hold" /></Option>
            <Option value="Completed"><StatusChip kind="status" value="Completed" /></Option>
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label="Priority" labelStyle={{ width: '150px' }}>
          <Select
            value={workOrder.priority || 'Low'}
            onChange={(value) => handleUpdateWorkOrder({ priority: value })}
            style={{ width: 100 }}
            bordered={false}
            suffixIcon={null}
          >
            <Option value="High"><StatusChip kind="priority" value="High" /></Option>
            <Option value="Medium"><StatusChip kind="priority" value="Medium" /></Option>
            <Option value="Low"><StatusChip kind="priority" value="Low" /></Option>
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label="Channel" labelStyle={{ width: '150px' }}>
          <Select
            value={workOrder.channel}
            onChange={(value) => handleUpdateWorkOrder({ channel: value })}
            style={{ width: '100%' }}
            bordered={false}
            allowClear
            placeholder="Select channel"
            suffixIcon={null}
          >
            {channelOptions.map(c => <Option key={c} value={c}>{c}</Option>)}
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label={<><Icon icon="ph:calendar-fill" /> SLA Due</>} labelStyle={{ width: '150px' }}>
          <DatePicker
            showTime={{ format: 'HH', use12Hours: false, minuteStep: 30 }}
            format="YYYY-MM-DD HH"
            value={workOrder.slaDue ? dayjs(workOrder.slaDue) : null}
            onChange={(date) => { handleUpdateWorkOrder({ slaDue: date ? date.toISOString() : null }); }}
            bordered={false}
            style={{ width: '100%' }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Appointment Date" labelStyle={{ width: '150px' }}>
          <DatePicker
            showTime={{ format: 'HH', use12Hours: false, minuteStep: 30 }}
            format="YYYY-MM-DD HH"
            value={workOrder.appointmentDate ? dayjs(workOrder.appointmentDate) : null}
            onChange={(date) => handleUpdateWorkOrder({ appointmentDate: date ? date.toISOString() : null })}
            bordered={false}
            style={{ width: '100%' }}
          />
        </Descriptions.Item>
        <Descriptions.Item label={<><Icon icon="ph:wrench-fill" /> Assigned To</>} labelStyle={{ width: '150px' }}>
          <Select
            value={workOrder.assignedTechnicianId}
            onChange={(value) => handleUpdateWorkOrder({ assignedTechnicianId: value })}
            style={{ width: '100%' }}
            bordered={false}
            allowClear
            placeholder="Unassigned"
            suffixIcon={null}
          >
            {(allTechnicians || []).map(t => (
              <Option key={t.id} value={t.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar size="small" src={t.avatar || undefined}>{t.name.split(' ').map(n => n[0]).join('')}</Avatar>
                  <Text>{t.name}</Text>
                </div>
              </Option>
            ))}
          </Select>
        </Descriptions.Item>
        {technician && (
          <Descriptions.Item label={<><Icon icon="ph:phone-fill" /> Tech Phone</>} labelStyle={{ width: '150px' }}>
            <a href={`tel:${technician.phone}`}>{technician.phone || 'N/A'}</a>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};