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

export type TechnicianRow = {
  id: string
  name: string
  avatar: string
  status: 'available' | 'busy' | 'offline'
  openTasks: number
}

const statusVariantMap: Record<TechnicianRow['status'], 'default' | 'secondary' | 'destructive'> = {
  available: 'default',
  busy: 'secondary',
  offline: 'destructive',
};

const statusTextMap: Record<TechnicianRow['status'], string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
};

export const getColumns = (
    onEdit: (id: string) => void,
    onDelete: (id: string) => void
): ColumnDef<TechnicianRow>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Technician
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const { name, avatar } = row.original;
        return (
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{name}</span>
            </div>
        )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as TechnicianRow['status'];
        return <Badge variant={statusVariantMap[status]} className={cn(
            status === 'available' && 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            status === 'busy' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            status === 'offline' && 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
        )}>{statusTextMap[status]}</Badge>
    }
  },
  {
    accessorKey: "openTasks",
    header: "Open Tasks",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const technician = row.original
 
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
            <DropdownMenuItem onClick={() => onEdit(technician.id)}>
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(technician.id)}>
              Delete Technician
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]