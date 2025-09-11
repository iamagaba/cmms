import * as React from "react";
import { Table, Dropdown, Button, Checkbox, Row, Col, Typography, Card } from "antd"; // Import Card
import type { TableRowSelection } from 'antd/es/table/interface';
import { BarsOutlined } from "@ant-design/icons";
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from "@/types/supabase";
import { WorkOrderRow, getColumns } from "./WorkOrderTableColumns";
import { ResizableTitle } from "./ResizableTitle";

const { Title } = Typography;

export const ALL_COLUMNS = [
  { label: 'ID', value: 'workOrderNumber' },
  { label: 'License Plate', value: 'licensePlate' },
  { label: 'Service', value: 'service' },
  { label: 'Status', value: 'status' },
  { label: 'Priority', value: 'priority' },
  { label: 'Technician', value: 'technician' },
  { label: 'SLA Status', value: 'slaStatus' },
  { label: 'Created At', value: 'createdAt' },
  { label: 'Created By', value: 'createdBy' },
  { label: 'Channel', value: 'channel' },
  { label: 'Actions', value: 'actions' },
];

interface WorkOrderDataTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
  customers: Customer[];
  vehicles: Vehicle[];
  profiles: Profile[];
  onEdit: (workOrderData: WorkOrder) => void;
  onDelete: (workOrderData: WorkOrder) => void;
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onViewDetails: (workOrderId: string) => void;
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
  rowSelection?: TableRowSelection<WorkOrderRow>;
}

export function WorkOrderDataTable({ 
  workOrders, 
  technicians, 
  locations, 
  customers, 
  vehicles, 
  profiles, 
  onEdit, 
  onDelete, 
  onUpdateWorkOrder, 
  onViewDetails, 
  visibleColumns,
  onVisibleColumnsChange,
  rowSelection,
}: WorkOrderDataTableProps) {
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});

  const handleColumnResize = (key: string, width: number) => {
    setColumnWidths(prevWidths => ({
      ...prevWidths,
      [key]: width,
    }));
  };

  const tableData: WorkOrderRow[] = React.useMemo(() => {
    const techMap = new Map(technicians.map(t => [t.id, t]));
    const locMap = new Map(locations.map(l => [l.id, l]));
    const custMap = new Map(customers.map(c => [c.id, c]));
    const vehMap = new Map(vehicles.map(v => [v.id, v]));
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return workOrders.map(wo => ({
      ...wo,
      technician: wo.assignedTechnicianId ? techMap.get(wo.assignedTechnicianId) : undefined,
      location: wo.locationId ? locMap.get(wo.locationId) : undefined,
      customer: wo.customerId ? custMap.get(wo.customerId) : undefined,
      vehicle: wo.vehicleId ? vehMap.get(wo.vehicleId) : undefined,
      createdByProfile: wo.created_by ? profileMap.get(wo.created_by) : undefined,
    }));
  }, [workOrders, technicians, locations, customers, vehicles, profiles]);

  const columns = getColumns({
    onEdit,
    onDelete,
    onUpdateWorkOrder,
    allTechnicians: technicians,
    allProfiles: profiles,
    columnWidths,
    onColumnResize: handleColumnResize,
    visibleColumns,
  });

  const columnVisibilityMenu = (
    <Card size="small" style={{ width: 200 }}> {/* Wrap in Card */}
      <Checkbox.Group
        style={{ display: 'flex', flexDirection: 'column' }}
        options={ALL_COLUMNS}
        value={visibleColumns}
        onChange={(checkedValues) => onVisibleColumnsChange(checkedValues as string[])}
      />
    </Card>
  );

  const tableTitle = () => (
    <Row justify="end" align="middle">
      <Col>
        <Dropdown dropdownRender={() => columnVisibilityMenu} trigger={['click']}>
          <Button icon={<BarsOutlined />}>Columns</Button>
        </Dropdown>
      </Col>
    </Row>
  );

  return (
    <Table
      title={tableTitle}
      rowSelection={rowSelection}
      dataSource={tableData}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
      onRow={(record) => ({
        className: 'lift-on-hover-row',
        onClick: (event) => {
          // Prevent row click from triggering when clicking on interactive elements like dropdowns or selects
          const target = event.target as HTMLElement;
          if (target.closest('.ant-select, .ant-dropdown, .ant-btn')) {
            return;
          }
          onViewDetails(record.id);
        },
      })}
      components={{
        header: {
          cell: ResizableTitle,
        },
      }}
      scroll={{ x: 'max-content' }} // Enable horizontal scrolling
    />
  );
}