"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { WorkOrder, Technician, Location } from "@/data/mockData"
import { format } from "date-fns"

export type WorkOrderRow = WorkOrder & {
  technician?: Technician
  location?: Location
}

const priorityVariant: Record<WorkOrder['priority'], 'destructive' | 'secondary' | 'default'> = {
  High: "destructive",
  Medium: "secondary",
  Low: "default",
};

const statusVariant: Record<WorkOrder['status'], 'default' | 'secondary' | 'outline'> = {
    Open: "default",
    "In Progress": "secondary",
    "On Hold": "outline",
    Completed: "default",
};

export const getColumns = (
    onEdit: (workOrder: WorkOrderRow) => void,
    onDelete: (workOrder: WorkOrderRow) => void
): ColumnDef<WorkOrderRow>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "vehicleId",
    header: "Vehicle ID",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "technician.name",
    header: "Technician",
    cell: ({ row }) => row.original.technician?.name || "Unassigned",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as WorkOrder['status'];
        return <Badge variant={statusVariant[status]} className={status === 'Completed' ? 'bg-green-100 text-green-800' : ''}>{status}</Badge>
    }
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
        const priority = row.getValue("priority") as WorkOrder['priority'];
        return <Badge variant={priorityVariant[priority]}>{priority}</Badge>
    }
  },
  {
    accessorKey: "slaDue",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SLA Due
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => format(new Date(row.getValue("slaDue")), "PP"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const workOrder = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(workOrder)}>
              Edit Work Order
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(workOrder)}
            >
              Delete Work Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]