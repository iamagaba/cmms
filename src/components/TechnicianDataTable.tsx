import * as React from "react";
import { Table, Empty, Button } from "antd";
import { Technician, WorkOrder } from "@/types/supabase";
import { TechnicianRow, getColumns } from "./TechnicianTableColumns";
import { useNavigate } from "react-router-dom";

interface TechnicianDataTableProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
  onEdit: (technician: Technician) => void;
  onDelete: (technician: Technician) => void;
  onUpdateStatus: (id: string, status: Technician['status']) => void; // New prop
}

export function TechnicianDataTable({ technicians, workOrders, onEdit, onDelete, onUpdateStatus }: TechnicianDataTableProps) {
  const navigate = useNavigate();
  
  const tableData: TechnicianRow[] = React.useMemo(() => {
    return technicians.map(tech => ({
      ...tech,
      openTasks: workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length
    }));
  }, [technicians, workOrders]);

  const columns = getColumns({ onEdit, onDelete, onUpdateStatus }); // Pass new prop
  // Add data-labels for stacked mobile view
  const columnsWithLabels = columns.map((col: any) => ({
    ...col,
    onCell: (_: any) => ({ 'data-label': col.title }),
  }));

  return (
    <Table
      dataSource={tableData}
      columns={columnsWithLabels as any}
      rowKey="id"
      pagination={{ pageSize: 10, hideOnSinglePage: true, position: ["bottomCenter"] }}
      className="stacked-table"
      onRow={(record) => ({
        className: 'lift-on-hover-row',
        onClick: () => navigate(`/technicians/${record.id}`),
      })}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <>
                <div>No technicians found</div>
                <Button type="primary" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </>
            }
          />
        ),
      }}
    />
  );
}