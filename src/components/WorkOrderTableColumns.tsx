import { Avatar, Button, Dropdown, Menu, Typography, Select, Space } from "antd"; // Added Space
import StatusChip from "@/components/StatusChip";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from "@/types/supabase";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import SlaCountdown from "./SlaCountdown";

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography; // Added Paragraph
const { Option } = Select;

export type WorkOrderRow = WorkOrder & {
  technician?: Technician;
  location?: Location;
  customer?: Customer;
  vehicle?: Vehicle;
  createdByProfile?: Profile; // Added for created by user
};

const priorityOrder: Record<string, number> = { 'High': 1, 'Medium': 2, 'Low': 3 };

interface GetColumnsProps {
  onEdit: (record: WorkOrderRow) => void;
  onDelete: (record: WorkOrderRow) => void;
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  allTechnicians: Technician[];
  allProfiles: Profile[];
  columnWidths: Record<string, number>;
  onColumnResize: (key: string, width: number) => void;
  visibleColumns: string[];
}

export const getColumns = ({
  onEdit,
  onDelete,
  onUpdateWorkOrder,
  allTechnicians,
  allProfiles,
  columnWidths,
  onColumnResize,
  visibleColumns,
}: GetColumnsProps) => {
  // const { token } = useToken();

  const allColumns = [
    {
      key: "workOrderNumber",
      title: "ID",
      dataIndex: "workOrderNumber",
      render: (text: string, record: WorkOrderRow) => {
        // Make the ID clickable to open the drawer
        return (
          <Typography.Link
            style={{ cursor: 'pointer', maxWidth: '80px' }}
            ellipsis
            onClick={e => {
              e.stopPropagation();
              if (typeof window !== 'undefined' && (window as any).onWorkOrderIdClick) {
                (window as any).onWorkOrderIdClick(record.id);
              }
              // Fallback: try to call a global handler or do nothing
            }}
            title={text || record.id.substring(0, 6)}
          >
            {text || record.id.substring(0, 6)}
          </Typography.Link>
        );
      },
      width: 150, // Adjust width to accommodate the button
      sorter: (a: WorkOrderRow, b: WorkOrderRow) => (a.workOrderNumber || "").localeCompare(b.workOrderNumber || ""),
    },
    {
      key: "licensePlate",
      title: "License Plate",
      dataIndex: "vehicle",
      render: (_: any, record: WorkOrderRow) => (
        <div>
          <Typography.Text strong ellipsis={{ tooltip: record.vehicle?.license_plate || 'N/A' }} style={{ maxWidth: '100%' }}>
            {record.vehicle?.license_plate || 'N/A'}
          </Typography.Text><br />
          <Typography.Text type="secondary" ellipsis={{ tooltip: record.vehicle ? `${record.vehicle.make} ${record.vehicle.model}` : 'N/A' }}>
            {record.vehicle ? `${record.vehicle.make} ${record.vehicle.model}` : 'N/A'}
          </Typography.Text>
        </div>
      ),
      width: 180,
    },
    {
      key: "service",
      title: "Service",
      dataIndex: "initialDiagnosis", // Use initialDiagnosis as the data source
      render: (text: string) => (
        <Paragraph ellipsis={{ rows: 1, tooltip: text }} style={{ margin: 0 }}>
          {text || 'N/A'}
        </Paragraph>
      ),
      width: 250,
      sorter: (a: WorkOrderRow, b: WorkOrderRow) => (a.initialDiagnosis || "").localeCompare(b.initialDiagnosis || ""),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (status: WorkOrder['status'], record: WorkOrderRow) => (
        <Select 
          value={status} 
          onChange={(value) => onUpdateWorkOrder(record.id, { status: value })}
          style={{ width: 180 }} 
          bordered={false} 
          suffixIcon={null} 
          size="middle" 
          onClick={(e) => e.stopPropagation()}
          options={[
            { value: 'Open', label: <StatusChip kind="status" value="Open" /> },
            { value: 'Confirmation', label: <StatusChip kind="status" value="Confirmation" /> },
            { value: 'Ready', label: <StatusChip kind="status" value="Ready" /> },
            { value: 'In Progress', label: <StatusChip kind="status" value="In Progress" /> },
            { value: 'On Hold', label: <StatusChip kind="status" value="On Hold" /> },
            { value: 'Completed', label: <StatusChip kind="status" value="Completed" /> },
          ]}
        />
      ),
      width: 180,
      sorter: (a: WorkOrderRow, b: WorkOrderRow) => (a.status || "").localeCompare(b.status || ""),
    },
    {
      key: "priority",
      title: "Priority",
      dataIndex: "priority",
      render: (priority: string) => (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <StatusChip kind="priority" value={priority} />
        </div>
      ),
      width: 120,
      sorter: (a: WorkOrderRow, b: WorkOrderRow) => priorityOrder[a.priority || 'Low'] - priorityOrder[b.priority || 'Low'],
    },
    {
      key: "technician",
      title: "Technician",
      dataIndex: "technician",
      render: (_: any, record: WorkOrderRow) => (
        <Select value={record.assignedTechnicianId} onChange={(value) => onUpdateWorkOrder(record.id, { assignedTechnicianId: value })} style={{ width: 150 }} bordered={false} allowClear placeholder="Unassigned" suffixIcon={null} size="middle" onClick={(e) => e.stopPropagation()}>
          {allTechnicians.map(tech => (
            <Option key={tech.id} value={tech.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar size="small" src={tech.avatar || undefined}>{tech.name.split(' ').map(n => n[0]).join('')}</Avatar>
                <Text>{tech.name}</Text>
              </div>
            </Option>
          ))}
        </Select>
      ),
      width: 180,
    },
    {
      key: "slaStatus",
      title: "SLA",
      dataIndex: "slaDue",
      render: (_: any, record: WorkOrderRow) => (
        <Space size={4}>

          <SlaCountdown slaDue={record.slaDue} status={record.status} completedAt={record.completedAt} />
        </Space>
      ),
      width: 180,
      sorter: (a: WorkOrderRow, b: WorkOrderRow) => dayjs(a.slaDue).unix() - dayjs(b.slaDue).unix(),
    },
    {
      key: "created_at",
      title: "Created At",
      dataIndex: "created_at",
      render: (date: string) => dayjs(date).format("MMM D, YYYY HH:mm"),
      width: 180,
      sorter: (a: WorkOrderRow, b: WorkOrderRow) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      key: "createdBy",
      title: "Created By",
      dataIndex: "createdByProfile",
      render: (_: any, record: WorkOrderRow) => {
        const profile = allProfiles.find(p => p.id === record.created_by);
        return profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'N/A';
      },
      width: 150,
      sorter: (a: WorkOrderRow, b: WorkOrderRow) => {
        const nameA = allProfiles.find(p => p.id === a.created_by)?.first_name || '';
        const nameB = allProfiles.find(p => p.id === b.created_by)?.first_name || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      key: "channel",
      title: "Channel",
      dataIndex: "channel",
      render: (channel: string) => (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {channel ? <StatusChip kind="channel" value={channel} /> : <Text type="secondary">N/A</Text>}
        </div>
      ),
      width: 150,
      sorter: (a: WorkOrderRow, b: WorkOrderRow) => (a.channel || "").localeCompare(b.channel || ""),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right" as const,
      render: (_: any, record: WorkOrderRow) => {
        const menu = (
          <Menu>
            <Menu.Item 
              key="edit" 
              icon={<Icon icon="ant-design:edit-outlined" style={{ fontSize: '14px' }} />}
              onClick={(e) => { e.domEvent.stopPropagation(); onEdit(record); }}>
              Edit Work Order
            </Menu.Item>
            <Menu.Item 
              key="delete" 
              icon={<Icon icon="ant-design:delete-outlined" style={{ fontSize: '14px' }} />}
              danger 
              onClick={(e) => { e.domEvent.stopPropagation(); onDelete(record); }}>
              Delete Work Order
            </Menu.Item>
          </Menu>
        );

        return (
          <Space>
            <Button
              type="text"
              size="small"
              icon={<Icon icon="ant-design:edit-outlined" style={{ fontSize: '14px' }} />}
              onClick={(e) => { e.stopPropagation(); onEdit(record); }}
              title="Edit Work Order"
            />
            <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
              <Button
                type="text"
                size="small"
                icon={<Icon icon="ant-design:more-outlined" style={{ fontSize: '14px' }} />}
                onClick={(e) => e.stopPropagation()}
                title="More Actions"
              />
            </Dropdown>
          </Space>
        );
      },
      width: 80,
    },
  ];

  const filteredColumns = allColumns.filter(col => visibleColumns.includes(col.key as string));

  return filteredColumns.map(col => ({
    ...col,
    width: columnWidths[col.key] || col.width,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: ((_: any, { size }: { size: { width: number } }) => {
        onColumnResize(column.key, size.width);
      }) as any,
    }),
  }));
};