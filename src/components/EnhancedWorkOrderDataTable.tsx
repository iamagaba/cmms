import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ClipboardIcon,
  MoreVerticalIcon,
  ViewIcon,
  PencilEdit02Icon,
  Delete01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// shadcn UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

dayjs.extend(relativeTime);

interface EnhancedWorkOrderDataTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
  customers: Customer[];
  vehicles: Vehicle[];
  profiles: Profile[];
  serviceCategories?: DiagnosticCategoryRow[];
  onEdit: (workOrder: WorkOrder) => void;
  onDelete: (workOrder: WorkOrder) => void;
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onViewDetails: (workOrderId: string) => void;
  loading?: boolean;
  selectedRecords?: WorkOrder[];
  onSelectedRecordsChange?: (records: WorkOrder[]) => void;
  enableBulkActions?: boolean;
  enableAdvancedFilters?: boolean;
  enableExport?: boolean;
  compactMode?: boolean;
  visibleColumns?: string[];
  emergencyBikeAssignments?: any[];
  mobileBreakpoint?: number;
}

// Status colors for badges
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Open': { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  'Confirmation': { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  'On Hold': { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  'Ready': { bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
  'In Progress': { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  'Completed': { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  'Cancelled': { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
};

// Priority configuration
const getPriorityConfig = (priority?: string) => {
  const p = (priority || '').toLowerCase();
  if (p === 'critical' || p === 'urgent') {
    return { label: 'Critical', variant: 'destructive' as const };
  }
  if (p === 'high') {
    return { label: 'High', variant: 'secondary' as const };
  }
  if (p === 'medium' || p === 'normal') {
    return { label: 'Medium', variant: 'outline' as const };
  }
  return { label: 'Low', variant: 'outline' as const };
};

const DEFAULT_COLUMNS = ['workOrderNumber', 'service', 'vehicleCustomer', 'status', 'priority', 'technician'];

export function EnhancedWorkOrderDataTable({
  workOrders,
  technicians,
  locations,
  vehicles,
  customers,
  serviceCategories,
  onEdit,
  onDelete,
  onViewDetails,
  loading = false,
  visibleColumns = DEFAULT_COLUMNS,
}: EnhancedWorkOrderDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Helper functions
  const getVehicleInfo = (vehicleId?: string | null) => vehicleId ? vehicles?.find(v => v.id === vehicleId) : null;
  const getTechnicianInfo = (techId?: string | null) => techId ? technicians?.find(t => t.id === techId) : null;
  const isColumnVisible = (columnKey: string) => visibleColumns.includes(columnKey);

  // Define columns
  const columns: ColumnDef<WorkOrder>[] = useMemo(() => {
    const cols: ColumnDef<WorkOrder>[] = [];

    if (isColumnVisible('workOrderNumber')) {
      cols.push({
        accessorKey: 'workOrderNumber',
        header: 'Work Order',
        cell: ({ row }) => {
          const wo = row.original;
          const w = wo as any;
          const vehicleId = w.vehicle_id || w.vehicleId;
          const vehicle = getVehicleInfo(vehicleId);
          const workOrderNum = w.workOrderNumber || w.work_order_number || `WO-${wo.id.substring(0, 8).toUpperCase()}`;

          return (
            <div className="space-y-0.5">
              {vehicle && (
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {vehicle.license_plate}
                </div>
              )}
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {workOrderNum}
                {vehicle && <span className="text-gray-500 dark:text-gray-500"> • {vehicle.make} {vehicle.model}</span>}
              </div>
            </div>
          );
        },
      });
    }

    if (isColumnVisible('service')) {
      cols.push({
        accessorKey: 'service',
        header: 'Summary',
        cell: ({ row }) => {
          const wo = row.original;
          return (
            <div className="max-w-[200px] truncate text-sm">
              {wo.description || serviceCategories?.find(cat => cat.id === wo.service)?.label || wo.service || 'General Service'}
            </div>
          );
        },
      });
    }

    if (isColumnVisible('status')) {
      cols.push({
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status || 'Open';
          const statusConfig = STATUS_COLORS[status] || STATUS_COLORS['Open'];
          return (
            <Badge variant="outline" className={`${statusConfig.bg} ${statusConfig.text} border-current/20`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
              {status}
            </Badge>
          );
        },
      });
    }

    if (isColumnVisible('technician')) {
      cols.push({
        accessorKey: 'assignedTechnicianId',
        header: 'Technician',
        cell: ({ row }) => {
          const wo = row.original;
          const w = wo as any;
          const technicianId = w.assigned_technician_id || w.assignedTechnicianId;
          const technician = getTechnicianInfo(technicianId);

          return technician ? (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-semibold">
                {technician.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm">{technician.name}</span>
            </div>
          ) : (
            <span className="text-sm italic text-muted-foreground">Unassigned</span>
          );
        },
      });
    }

    if (isColumnVisible('createdAt')) {
      cols.push({
        accessorKey: 'created_at',
        header: () => <div className="text-right">Created</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
            {dayjs(row.original.created_at).fromNow()}
          </div>
        ),
      });
    }

    if (isColumnVisible('priority')) {
      cols.push({
        accessorKey: 'priority',
        header: () => <div className="text-right">Priority</div>,
        cell: ({ row }) => {
          const priorityConfig = getPriorityConfig(row.original.priority);
          return (
            <div className="text-right">
              <Badge variant={priorityConfig.variant} className="text-xs">
                {priorityConfig.label}
              </Badge>
            </div>
          );
        },
      });
    }

    // Actions column
    cols.push({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const wo = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onViewDetails(wo.id); }}
                  className="text-sm"
                >
                  <HugeiconsIcon icon={ViewIcon} size={14} className="mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onEdit(wo); }}
                  className="text-sm"
                >
                  <HugeiconsIcon icon={PencilEdit02Icon} size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(wo); }}
                  className="text-sm text-destructive focus:text-destructive"
                >
                  <HugeiconsIcon icon={Delete01Icon} size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    });

    return cols;
  }, [visibleColumns, vehicles, technicians, serviceCategories, onEdit, onDelete, onViewDetails]);

  // Initialize table
  const table = useReactTable({
    data: workOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Loading state
  if (loading) {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow>
              <TableHead>Work Order</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="text-right">Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (workOrders.length === 0) {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-12 bg-card text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3">
          <HugeiconsIcon icon={ClipboardIcon} size={20} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No work orders</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">No work orders match your current filters</p>
      </div>
    );
  }

  // Main table
  return (
    <div className="flex flex-col h-full max-h-full border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-950 shadow-sm">
      {/* Table Container with Flex */}
      <div className="flex-1 overflow-auto min-h-0">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'flex items-center gap-2 cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-muted-foreground">
                            {{
                              asc: <HugeiconsIcon icon={ArrowUp01Icon} size={14} />,
                              desc: <HugeiconsIcon icon={ArrowDown01Icon} size={14} />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onViewDetails(row.original.id)}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Fixed at bottom */}
      <div className="flex-shrink-0 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, workOrders.length)} of {workOrders.length}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 px-3"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
