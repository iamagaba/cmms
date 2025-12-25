import * as React from "react";
import { Table, Dropdown, Button, Checkbox, Row, Col, Typography, Card, TableProps, Affix, Space, Select, theme } from "antd"; // Import Card, TableProps, Affix, Space, Select, theme
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from "@/types/supabase";
import { WorkOrderRow, getColumns } from "./WorkOrderTableColumns";
import { ResizableTitle } from "./ResizableTitle";
import { TableEmptyState } from "./TableEmptyState";

import { ALL_COLUMNS } from "./work-order-columns-constants";

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
  rowSelection?: TableProps<WorkOrderRow>['rowSelection']; // Corrected type import
  onBulkAssign?: (workOrderIds: string[], technicianId: string) => void; // optional bulk-assign handler
  enableStickySummary?: boolean; // show sticky bottom summary when there are selected rows
  virtualized?: boolean; // if true, disable pagination and enable scroll.y for large datasets
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
  onBulkAssign,
  enableStickySummary = true,
  virtualized = false,
}: WorkOrderDataTableProps) {
  const { token } = theme.useToken();
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});
  const [bulkAssignTechId, setBulkAssignTechId] = React.useState<string | undefined>(undefined);

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

  // For stacked mobile view, attach data-label with the column title to each cell
  const columnsWithLabels = (columns as any[]).map((col) => ({
    ...col,
    onCell: (_: any) => ({ 'data-label': col.title }),
  }));

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
          <Button icon={<Icon icon="ant-design:column-width-outlined" width={16} height={16} />}>Columns</Button>
        </Dropdown>
      </Col>
    </Row>
  );

  const { selectedIds, selectedRecords } = React.useMemo(() => {
    const keys: React.Key[] = (rowSelection && (rowSelection as any).selectedRowKeys) || [];
    const ids = new Set<string>(keys as string[]);
    const records = tableData.filter(r => ids.has(r.id));
    return { selectedIds: ids, selectedRecords: records };
  }, [rowSelection, tableData]);

  const handleBulkAssign = () => {
    if (onBulkAssign && bulkAssignTechId && selectedRecords.length > 0) {
      onBulkAssign(selectedRecords.map(r => r.id), bulkAssignTechId);
      // attempt to clear selection if parent provided handler
      if (rowSelection && (rowSelection as any).onChange) {
        (rowSelection as any).onChange([], []);
      }
      setBulkAssignTechId(undefined);
    }
  };

  const pagination = virtualized ? false : { pageSize: 10, hideOnSinglePage: true, position: ["bottomCenter"] as const };
  const scroll = virtualized ? { y: 560 } : undefined;

  // Patch: wire up global handler for ID click to open drawer
  React.useEffect(() => {
    (window as any).onWorkOrderIdClick = onViewDetails;
    return () => {
      if ((window as any).onWorkOrderIdClick === onViewDetails) {
        delete (window as any).onWorkOrderIdClick;
      }
    };
  }, [onViewDetails]);

  return (
    <div style={{ position: 'relative' }}>
      <Table
        title={tableTitle}
        rowSelection={rowSelection}
        dataSource={tableData}
        columns={columnsWithLabels as any}
        rowKey="id"
        size="small"
        pagination={pagination as any}
        scroll={scroll}
        className="stacked-table"
        rowClassName={(record, index) => {
          const base = index % 2 === 0 ? 'workorder-table-row workorder-table-row-even' : 'workorder-table-row workorder-table-row-odd';
          const isSelected = selectedIds.has(record.id);
          return isSelected ? `${base} is-selected-row` : base;
        }}
        onRow={(record) => ({
          className: 'lift-on-hover-row',
          style: selectedIds.has(record.id) ? { backgroundColor: token.colorPrimaryBg } : undefined,
          onClick: (event) => {
            // Prevent row click from triggering when clicking on interactive elements like dropdowns or selects
            const target = event.target as HTMLElement;
            if (target.closest('.ant-select, .ant-dropdown, .ant-btn, .ant-checkbox')) {
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
        sticky
        locale={{
          emptyText: (
            <TableEmptyState
              title="No Work Orders Found"
              description="There are no work orders available at the moment."
              icon="ant-design:tool-outlined"
            />
          )
        }}
      />

      {enableStickySummary && selectedRecords.length > 0 && (
        <Affix offsetBottom={0} style={{ zIndex: 9 }}>
          <div
            style={{
              background: token.colorBgContainer,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
              padding: '10px 16px',
            }}
          >
            <Row align="middle" justify="space-between" gutter={[12, 12]}>
              <Col>
                <Space size={12} wrap>
                  <Typography.Text strong>{selectedRecords.length} selected</Typography.Text>
                  <Typography.Text type="secondary">Use bulk actions to update selected work orders.</Typography.Text>
                </Space>
              </Col>
              <Col>
                <Space size={8} wrap>
                  <Select
                    allowClear
                    placeholder="Assign technician"
                    value={bulkAssignTechId}
                    onChange={(val) => setBulkAssignTechId(val)}
                    style={{ minWidth: 220 }}
                    size="middle"
                    options={technicians.map(t => ({ label: t.name, value: t.id }))}
                  />
                  <Button
                    type="primary"
                    onClick={handleBulkAssign}
                    disabled={!onBulkAssign || !bulkAssignTechId}
                    icon={<Icon icon="ph:user-switch" />}
                  >
                    Assign
                  </Button>
                  {rowSelection && (rowSelection as any).onChange && (
                    <Button type="text" onClick={() => (rowSelection as any).onChange([], [])}>Clear selection</Button>
                  )}
                </Space>
              </Col>
            </Row>
          </div>
        </Affix>
      )}
    </div>
  );
}