"use client"

import * as React from "react"
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Technician, WorkOrder } from "@/data/mockData"
import { TechnicianRow, getColumns } from "./TechnicianTableColumns"
import { TechnicianFormDialog } from "./TechnicianFormDialog"
import { DataTablePagination } from "./ui/data-table-pagination"

interface TechnicianDataTableProps {
  initialData: Technician[];
  workOrders: WorkOrder[];
}

export function TechnicianDataTable({ initialData, workOrders }: TechnicianDataTableProps) {
  const [data, setData] = React.useState<Technician[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTechnician, setEditingTechnician] = React.useState<Technician | null>(null);

  const tableData: TechnicianRow[] = React.useMemo(() => {
    return data.map(tech => ({
      ...tech,
      openTasks: workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length
    }))
  }, [data, workOrders]);

  const handleSave = (technicianData: Technician) => {
    const exists = data.some(t => t.id === technicianData.id);
    if (exists) {
      setData(data.map(t => t.id === technicianData.id ? technicianData : t));
    } else {
      setData([...data, technicianData]);
    }
    setEditingTechnician(null);
  };

  const handleEdit = (id: string) => {
    const technicianToEdit = data.find(t => t.id === id);
    if (technicianToEdit) {
      setEditingTechnician(technicianToEdit);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setData(data.filter(t => t.id !== id));
  };
  
  const columns = getColumns(handleEdit, handleDelete);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div className="rounded-lg border shadow-sm bg-card">
      <div className="border-t">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      {isDialogOpen && (
        <TechnicianFormDialog 
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingTechnician(null);
          }}
          onSave={handleSave}
          technician={editingTechnician}
        />
      )}
    </div>
  )
}