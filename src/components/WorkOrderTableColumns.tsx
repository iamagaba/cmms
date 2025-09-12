import { Avatar, Button, Dropdown, Menu, Tag, Typography, Select, theme, Space } from "antd"; // Added Space
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from "@/types/supabase";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import SlaCountdown from "./SlaCountdown";
import { ResizableTitle } from "./ResizableTitle";
import { EmergencyBikeTag } from "./EmergencyBikeTag"; // Import the new tag component
import { Popover } from "antd"; // Import Popover
import { showSuccess } from "@/utils/toast"; // Import showSuccess

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography; // Added Paragraph
const { Option } = Select;
const { useToken } = theme;

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
  const { token } = useToken();
  const priorityColors: Record<string, string> = { High: token.colorError, Medium: token.colorWarning, Low: token.colorSuccess };
  const statusColors: Record<string, string> = { 
    Open: token.colorInfo,
    "Confirmation": token.cyan6,
    "Ready": token.colorTextSecondary,
    "In Progress": token.colorWarning,
    "On Hold": token.orange6,
    Completed: token.colorSuccess
  };

  const allColumns = [
    {
      key: "workOrderNumber",
      title: "ID",
      dataIndex: "workOrderNumber",
      render: (text: string, record: WorkOrderRow) => {
        const workOrderLink = `/work-orders/${record.id}`;
        const fullUrl = `${window.location.origin}${workOrderLink}`;

        const popoverContent = (
          <Space direction="vertical" size="small" style={{ width: '200px' }}>
            <Text strong>{text || record.id.substring(0, 6)}</Text>
            <Button
              type="link"
              icon={<Icon icon="ph:eye-fill" />}
              onClick={(e) => {
                e.stopPropagation();
                window.open(workOrderLink, '_blank');
              }}
              style={{ padding: 0, height: 'auto', textAlign: 'left' }}
            >
              View Details
            </Button>
            <Button
              type="link"
              icon={<Icon icon="ph:copy-fill" />}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(fullUrl);
                showSuccess('Link copied to clipboard!');
              }}
              style={{ padding: 0, height: 'auto', textAlign: 'left' }}
            >
              Copy Link
            </Button>
          </Space>
        );

        return (
          <Space size={4}>
            <Typography.Text code ellipsis={{ tooltip: text || record.id.substring(0, 6) }} style={{ maxWidth: '80px' }}>
              {text || record.id.substring(0, 6)}
            </Typography.Text>
            <Popover content={popoverContent} trigger="click" placement="rightTop" overlayInnerStyle={{ padding: 8 }}>
              <Button
                type="text"
                icon={<Icon icon="ph:dots-three-vertical-fill" style={{ fontSize: '14px' }} />}
                size="small"
                onClick={(e) => e.stopPropagation()}
              />
            </Popover>
          </Space>
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
        <Select value={status} onChange={(value) => onUpdateWorkOrder(record.id, { status: value })} style={{ width: 180 }} bordered={false} suffixIcon={null} size="middle" onClick={(e) => e.stopPropagation()}>
          <Option value="Open"><Tag color={statusColors["Open"]}>Open</Tag></Option>
          <Option value="Confirmation"><Tag color={statusColors["Confirmation"]}>Confirmation</Tag></Option>
          <Option value="Ready"><Tag color={statusColors["Ready"]}>Ready</Tag></Option>
          <Option value="In Progress"><Tag color={statusColors["In Progress"]}>In Progress</Tag></Option>
          <Option value="On Hold"><Tag color={statusColors["On Hold"]}>On Hold</Tag></Option>
          <Option value="Completed"><Tag color={statusColors["Completed"]}>Completed</Tag></Option>
        </Select>
      ),
      width: 180,
      sorter: (a: WorkOrderRow, b: WorkOrderRow) => (a.status || "").localeCompare(b.status || ""),
    },
    {
      key: "priority",
      title: "Priority",
      dataIndex: "priority",
      render: (priority: WorkOrder['priority'], record: WorkOrderRow) => (
        <Select value={priority} onChange={(value) => onUpdateWorkOrder(record.id, { priority: value })} style={{ width: 100 }} bordered={false} suffixIcon={null} size="middle" onClick={(e) => e.stopPropagation()}>
          <Option value="High"><Tag color={priorityColors["High"]}>High</Tag></Option>
          <Option value="Medium"><Tag color={priorityColors["Medium"]}>Medium</Tag></Option>
          <Option value="Low"><Tag color={priorityColors["Low"]}>Low</Tag></Option>
        </Select>
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
          <EmergencyBikeTag workOrder={record} /> {/* New Emergency Bike Tag */}
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
      render: (channel: string) => channel ? <Tag>{channel}</Tag> : <Text type="secondary">N/A</Text>,
      width: 150,
      sorter: (a: WorkOrderRow, b: WorkOrderRow) => (a.channel || "").localeCompare(b.channel || ""),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right" as const,
      render: (_: any, record: WorkOrderRow) => (
        <Dropdown overlay={<Menu><Menu.Item key="edit" icon={<Icon icon="ph:pencil-fill" />} onClick={(e) => { e.domEvent.stopPropagation(); onEdit(record); }}>Edit Work Order</Menu.Item><Menu.Item key="delete" icon={<Icon icon="ph:trash-fill" />} danger onClick={(e) => { e.domEvent.stopPropagation(); onDelete(record); }}>Delete Work Order</Menu.Item></Menu>} trigger={["click"]}>
          <Button type="text" icon={<Icon icon="ph:dots-three-horizontal-fill" style={{ fontSize: '18px' }} />} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      ),
      width: 80,
    },
  ];

  const filteredColumns = allColumns.filter(col => visibleColumns.includes(col.key as string));

  return filteredColumns.map(col => ({
    ...col,
    width: columnWidths[col.key] || col.width,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: ((e: any, { size }: { size: { width: number } }) => {
        onColumnResize(column.key, size.width);
      }) as any,
    }),
  }));
};