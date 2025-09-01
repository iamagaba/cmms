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
import { Location, WorkOrder } from "@/data/mockData"
import { LocationRow, getColumns } from "./LocationTableColumns"
import { LocationFormDialog } from "./LocationFormDialog"
import { DataTablePagination } from "./ui/data-table-pagination"

interface LocationDataTableProps {
  initialData: Location[];
  workOrders: WorkOrder[];
}

export function LocationDataTable({ initialData, workOrders }: LocationDataTableProps) {
  const [data, setData] = React.useState<Location[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] = React.useState<Location | null>(null);

  const tableData: LocationRow[] = React.useMemo(() => {
    return data.map(loc => ({
      ...loc,
      openWorkOrders: workOrders.filter(wo => wo.locationId === loc.id && wo.status !== 'Completed').length
    }))
  }, [data, workOrders]);

  const handleSave = (locationData: Location) => {
    const exists = data.some(l => l.id === locationData.id);
    if (exists) {
      setData(data.map(l => l.id === locationData.id ? locationData : l));
    } else {
      setData([...data, locationData]);
    }
    setEditingLocation(null);
  };

  const handleEdit = (id: string) => {
    const locationToEdit = data.find(l => l.id === id);
    if (locationToEdit) {
      setEditingLocation(locationToEdit);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setData(data.filter(l => l.id !== id));
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
        <LocationFormDialog 
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingLocation(null);
          }}
          onSave={handleSave}
          location={editingLocation}
        />
      )}
    </div>
  )
}