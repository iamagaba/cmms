import * as React from "react";
import { Table } from "antd";
import { Technician, WorkOrder } from "@/types/supabase";
import { TechnicianRow, getColumns } from "./TechnicianTableColumns";
import { useNavigate } from "react-router-dom";

interface TechnicianDataTableProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
  onEdit: (technician: Technician) => void;
  onDelete: (technician: Technician) => void;
}

export function TechnicianDataTable({ technicians, workOrders, onEdit, onDelete }: TechnicianDataTableProps) {
  const navigate = useNavigate();
  
  const tableData: TechnicianRow[] = React.useMemo(() => {
    return technicians.map(tech => ({
      ...tech,
      openTasks: workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length
    }));
  }, [technicians, workOrders]);

  const columns = getColumns(onEdit, onDelete);

  return (
    <Table
      dataSource={tableData}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
      onRow={(record) => ({
        className: 'lift-on-hover-row',
        onClick: () => navigate(`/technicians/${record.id}`),
      })}
    />
  );
}