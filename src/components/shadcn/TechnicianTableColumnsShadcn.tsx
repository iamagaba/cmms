import { ColumnDef } from "@tanstack/react-table";
import { Technician, Profile } from "@/types/supabase";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, User, CheckCircle, CircleDot, CircleOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/context/SessionContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TechnicianRow = Technician & {
  openTasks: number;
};

interface GetColumnsProps {
  onEdit: (record: TechnicianRow) => void;
  onDelete: (record: TechnicianRow) => void;
  onUpdateStatus: (id: string, status: Technician['status']) => void;
}

export const getColumns = ({
  onEdit,
  onDelete,
  onUpdateStatus,
}: GetColumnsProps): ColumnDef<TechnicianRow>[] => {
  const { session } = useSession();
  const currentUserId = session?.user?.id;

  const { data: userProfile } = useQuery<Profile | null>({
    queryKey: ['userProfile', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', currentUserId).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!currentUserId,
  });

  const isAdmin = userProfile?.is_admin;

  return [
    {
      accessorKey: "name",
      header: "Technician",
      cell: ({ row }) => {
        const technician = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={technician.avatar || undefined} alt={technician.name} />
              <AvatarFallback>
                {technician.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Link to={`/technicians/${technician.id}`} className="font-medium text-primary hover:underline">
              {technician.name}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const technician = row.original;
        const status = technician.status || 'offline';

        const statusMap: Record<string, { text: string; icon: React.ElementType; color: string }> = {
          available: { text: 'Available', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
          busy: { text: 'Busy', icon: CircleDot, color: 'bg-yellow-100 text-yellow-800' },
          offline: { text: 'Offline', icon: CircleOff, color: 'bg-gray-100 text-gray-800' },
        };
        const currentStatus = statusMap[status];

        if (isAdmin) {
          return (
            <Select
              value={status}
              onValueChange={(value: Technician['status']) => onUpdateStatus(technician.id, value)}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" /> Available
                  </div>
                </SelectItem>
                <SelectItem value="busy">
                  <div className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-yellow-600" /> Busy
                  </div>
                </SelectItem>
                <SelectItem value="offline">
                  <div className="flex items-center gap-2">
                    <CircleOff className="h-4 w-4 text-gray-600" /> Offline
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          );
        }
        return (
          <Badge className={`flex items-center gap-1 ${currentStatus.color}`}>
            <currentStatus.icon className="h-3 w-3" /> {currentStatus.text}
          </Badge>
        );
      },
    },
    {
      accessorKey: "openTasks",
      header: "Open Tasks",
      cell: ({ row }) => row.original.openTasks,
    },
    {
      accessorKey: "specializations",
      header: "Specializations",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.specializations || []).map((s) => (
            <Badge key={s} variant="secondary">{s}</Badge>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const technician = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(technician)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(technician)} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Technician
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};