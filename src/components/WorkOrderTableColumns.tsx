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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { WorkOrder, Technician, Location } from "@/data/mockData"
import { format } from "date-fns"

export type WorkOrderRow = WorkOrder & {
  technician?: Technician;
  location?: Location;
}

const priorityClasses: Record<WorkOrder['priority'], string> = {
  High: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  Low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
};

const statusClasses: Record<WorkOrder['status'], string> = {
    Open: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    "On Hold": "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
};

export const getColumns = (
    onEdit: (id: string) => void,
    onDelete: (id: string) => void
): ColumnDef<WorkOrderRow>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-mono">{row.getValue("id")}</div>
  },
  {
    accessorKey: "vehicleId",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Vehicle
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.vehicleId}</div>
        <div className="text-xs text-muted-foreground">{row.original.vehicleModel}</div>
      </div>
    )
  },
  {
    accessorKey: "service",
    header: "Service",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as WorkOrder['status'];
        return <Badge variant="outline" className={cn("border-none", statusClasses[status])}>{status}</Badge>
    }
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
        const priority = row.getValue("priority") as WorkOrder['priority'];
        return <Badge variant="outline" className={cn(priorityClasses[priority])}>{priority}</Badge>
    }
  },
  {
    accessorKey: "technician",
    header: "Technician",
    cell: ({ row }) => {
        const tech = row.original.technician;
        if (!tech) return <span className="text-xs text-muted-foreground">Unassigned</span>
        return (
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={tech.avatar} alt={tech.name} />
                    <AvatarFallback className="text-xs">{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{tech.name}</span>
            </div>
        )
    }
  },
  {
    accessorKey: "slaDue",
    header: "SLA Due",
    cell: ({ row }) => format(new Date(row.getValue("slaDue")), "PP")
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const workOrder = row.original
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(workOrder.id)}>Edit Work Order</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(workOrder.id)}>Delete Work Order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]