import * as React from "react";
import { Table, Input, Select, Space } from "antd";
import { WorkOrder, Technician, Location } from "@/data/mockData";
import { WorkOrderRow, getColumns } from "./WorkOrderTableColumns";
import { WorkOrderFormDialog } from "./WorkOrderFormDialog";

const { Search } = Input;
const { Option } = Select;

interface WorkOrderDataTableProps {
  initialData: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
}

export function WorkOrderDataTable({ initialData, technicians, locations }: WorkOrderDataTableProps) {
  const [data, setData] = React.useState<WorkOrder[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = React.useState<WorkOrder | null>(null);
  const [vehicleFilter, setVehicleFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  const tableData: WorkOrderRow[] = React.useMemo(() => {
    return data
      .map(wo => ({
        ...wo,
        technician: technicians.find(t => t.id === wo.assignedTechnicianId),
        location: locations.find(l => l.id === wo.locationId),
      }))
      .filter(wo => {
        const vehicleMatch = wo.vehicleId.toLowerCase().includes(vehicleFilter.toLowerCase());
        const statusMatch = statusFilter ? wo.status === statusFilter : true;
        return vehicleMatch && statusMatch;
      });
  }, [data, technicians, locations, vehicleFilter, statusFilter]);

  const handleSave = (workOrderData: WorkOrder) => {
    const exists = data.some(wo => wo.id === workOrderData.id);
    if (exists) {
      setData(data.map(wo => (wo.id === workOrderData.id ? workOrderData : wo)));
    } else {
      setData([...data, workOrderData]);
    }
    setEditingWorkOrder(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (record: WorkOrderRow) => {
    setEditingWorkOrder(record);
    setIsDialogOpen(true);
  };

  const handleDelete = (record: WorkOrderRow) => {
    setData(data.filter(wo => wo.id !== record.id));
  };

  const columns = getColumns(handleEdit, handleDelete);

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Filter by Vehicle ID..."
          onSearch={setVehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Filter by Status"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="Open">Open</Option>
          <Option value="In Progress">In Progress</Option>
          <Option value="On Hold">On Hold</Option>
          <Option value="Completed">Completed</Option>
        </Select>
      </Space>
      <Table
        dataSource={tableData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />
      {isDialogOpen && (
        <WorkOrderFormDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingWorkOrder(null);
          }}
          onSave={handleSave}
          workOrder={editingWorkOrder}
        />
      )}
    </>
  );
}