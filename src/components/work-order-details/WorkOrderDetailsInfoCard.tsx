import React from 'react';
import { Card, Descriptions, Select, DatePicker, Avatar, Tag, Typography, theme } from 'antd';
import { CalendarOutlined, ToolOutlined, PhoneOutlined } from '@ant-design/icons';
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
  allLocations,
  handleUpdateWorkOrder,
}) => {
  const { token } = useToken();

  const statusColors: Record<string, string> = { 
    Open: token.colorInfo,
    "Confirmation": token.cyan6,
    "Ready": token.colorTextSecondary,
    "In Progress": token.colorWarning,
    "On Hold": token.orange6,
    Completed: token.colorSuccess
  };
  const priorityColors: Record<string, string> = { High: token.colorError, Medium: token.colorWarning, Low: token.colorSuccess };

  return (
    <Card title="Work Order Details">
      <Descriptions column={1}>
        <Descriptions.Item label="Status">
          <Select
            value={workOrder.status || 'Open'}
            onChange={(value) => handleUpdateWorkOrder({ status: value })}
            style={{ width: 180 }}
            bordered={false}
            size="small"
            suffixIcon={null}
          >
            <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
            <Option value="Confirmation"><Tag color={statusColors["Confirmation"]}>Confirmation</Tag></Option>
            <Option value="Ready"><Tag color={statusColors["Ready"]}>Ready</Tag></Option>
            <Option value="In Progress"><Tag color={statusColors["In Progress"]}>In Progress</Tag></Option>
            <Option value="On Hold"><Tag color={statusColors["On Hold"]}>On Hold</Tag></Option>
            <Option value="Completed"><Tag color={statusColors["Completed"]}>Completed</Tag></Option>
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label="Priority">
          <Select
            value={workOrder.priority || 'Low'}
            onChange={(value) => handleUpdateWorkOrder({ priority: value })}
            style={{ width: 100 }}
            bordered={false}
            size="small"
            suffixIcon={null}
          >
            <Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option>
            <Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option>
            <Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option>
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label="Channel">
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
        <Descriptions.Item label={<><CalendarOutlined /> SLA Due</>}>
          <DatePicker
            showTime
            value={workOrder.slaDue ? dayjs(workOrder.slaDue) : null}
            onChange={(date) => { handleUpdateWorkOrder({ slaDue: date ? date.toISOString() : null }); }}
            bordered={false}
            style={{ width: '100%' }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Appointment Date">
          <DatePicker
            showTime
            value={workOrder.appointmentDate ? dayjs(workOrder.appointmentDate) : null}
            onChange={(date) => handleUpdateWorkOrder({ appointmentDate: date ? date.toISOString() : null })}
            bordered={false}
            style={{ width: '100%' }}
          />
        </Descriptions.Item>
        <Descriptions.Item label={<><ToolOutlined /> Assigned To</>}>
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
          <Descriptions.Item label={<><PhoneOutlined /> Tech Phone</>}>
            <a href={`tel:${technician.phone}`}>{technician.phone || 'N/A'}</a>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};