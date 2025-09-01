"use client"

import * as React from "react"
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WorkOrder, Technician, Location } from "@/data/mockData"
import { WorkOrderRow, getColumns } from "./WorkOrderTableColumns"
import { WorkOrderFormDialog } from "./WorkOrderFormDialog"
import { DataTablePagination } from "./ui/data-table-pagination"

interface WorkOrderDataTableProps {
  initialData: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
}

export function WorkOrderDataTable({ initialData, technicians, locations }: WorkOrderDataTableProps) {
  const [data, setData] = React.useState<WorkOrder[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = React.useState<WorkOrder | null>(null);

  const tableData: WorkOrderRow[] = React.useMemo(() => {
    return data.map(wo => ({
      ...wo,
      technician: technicians.find(t => t.id === wo.assignedTechnicianId),
      location: locations.find(l => l.id === wo.locationId),
    }))
  }, [data, technicians, locations]);

  const handleSave = (workOrderData: WorkOrder) => {
    const exists = data.some(wo => wo.id === workOrderData.id);
    if (exists) {
      setData(data.map(wo => wo.id === workOrderData.id ? workOrderData : wo));
    } else {
      setData([...data, workOrderData]);
    }
    setEditingWorkOrder(null);
  };

  const handleEdit = (id: string) => {
    const workOrderToEdit = data.find(wo => wo.id === id);
    if (workOrderToEdit) {
      setEditingWorkOrder(workOrderToEdit);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setData(data.filter(wo => wo.id !== id));
  };
  
  const columns = getColumns(handleEdit, handleDelete);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="rounded-lg border shadow-sm bg-card">
      <div className="flex items-center p-4 gap-4">
        <Input
          placeholder="Filter by Vehicle ID..."
          value={(table.getColumn("vehicleId")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("vehicleId")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => table.getColumn("status")?.setFilterValue(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border-t">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      {isDialogOpen && (
        <WorkOrderFormDialog 
          isOpen={isDialogOpen}
          onClose={() => { setIsDialogOpen(false); setEditingWorkOrder(null); }}
          onSave={handleSave}
          workOrder={editingWorkOrder}
        />
      )}
    </div>
  )
}