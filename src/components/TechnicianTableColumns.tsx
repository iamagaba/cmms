"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Technician } from "@/data/mockData"
import { Link } from "react-router-dom"

const statusVariant: Record<Technician['status'], 'default' | 'secondary' | 'outline'> = {
  available: "default",
  busy: "secondary",
  offline: "outline",
};

export const getColumns = (
    onEdit: (technician: Technician) => void,
): ColumnDef<Technician>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const tech = row.original;
      return (
        <Link to={`/technicians/${tech.id}`} className="flex items-center gap-2 hover:underline">
          <Avatar>
            <AvatarImage src={tech.avatar} />
            <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          {tech.name}
        </Link>
      )
    }
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as Technician['status'];
        return <Badge variant={statusVariant[status]} className="capitalize">{status}</Badge>
    }
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
            <DropdownMenuItem onClick={() => onEdit(technician)}>
              Edit Technician
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]