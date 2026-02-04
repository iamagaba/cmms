import { ClipboardList, MoreVertical, Eye, Edit, Trash2, ChevronUp, ChevronDown, User, Clock } from 'lucide-react';
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
import { WorkOrder, Technician, Location, Customer, Vehicle } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { getWorkOrderNumber } from '@/utils/work-order-display';

import { useSystemSettings } from '@/context/SystemSettingsContext';
import { WorkOrderSLAStatus } from '@/components/work-order-details/WorkOrderSLAStatus';


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
  'New': { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-slate-500' },
  'Confirmation': { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  'On Hold': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Ready': { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-blue-500' },
  'In Progress': { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-orange-500' },
  'Completed': { bg: 'bg-muted', text: 'text-foreground', dot: 'bg-emerald-500' },
  'Cancelled': { bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive' },
};

// Helper for short time format (e.g., 2d, 1mo)
const formatShortTime = (dateString: string) => {
  if (!dateString) return '';
  const date = dayjs(dateString);
  const now = dayjs();
  const diffMinutes = now.diff(date, 'minute');

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = now.diff(date, 'hour');
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = now.diff(date, 'day');
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = now.diff(date, 'month');
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  return `${now.diff(date, 'year')}y ago`;
};

// Priority configuration
const getPriorityConfig = (priority?: string) => {
  const p = (priority || 'medium').toLowerCase();

  if (p === 'critical' || p === 'urgent') {
    return {
      label: 'Critical',
      className: 'bg-destructive/10 text-destructive border-destructive/20 border'
    };
  }
  if (p === 'high') {
    return {
      label: 'High',
      className: 'bg-amber-50 text-amber-700 border-amber-200 border'
    };
  }
  if (p === 'medium' || p === 'normal') {
    return {
      label: 'Medium',
      className: 'bg-amber-50 text-amber-700 border-amber-200 border'
    };
  }
  return {
    label: 'Low',
    className: 'bg-muted text-muted-foreground border-border border'
  };
};

const DEFAULT_COLUMNS = ['workOrderNumber', 'service', 'vehicleCustomer', 'status', 'priority', 'sla', 'technician'];

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
  const { settings } = useSystemSettings();

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
          const workOrderNum = getWorkOrderNumber(wo);

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
              {wo.title || wo.initial_diagnosis || serviceCategories?.find(cat => cat.id === wo.service)?.label || wo.service || 'General Service'}
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
          const status = row.original.status || 'New';
          const statusConfig = STATUS_COLORS[status] || STATUS_COLORS['New'];
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
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                {technician.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm">{technician.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <User className="w-3 h-3 text-muted-foreground/50" />
              </div>
              <span className="text-sm italic text-muted-foreground">Unassigned</span>
            </div>
          );
        },
      });
    }

    if (isColumnVisible('createdAt')) {
      cols.push({
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {formatShortTime(row.original.created_at)}
          </div>
        ),
      });
    }

    if (isColumnVisible('priority')) {
      cols.push({
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
          const priorityConfig = getPriorityConfig(row.original.priority || undefined);
          return (
            <div>
              <Badge variant="outline" className={`text-xs ${priorityConfig.className}`}>
                {priorityConfig.label}
              </Badge>
            </div>
          );
        },
      });
    }

    // SLA Status column
    if (isColumnVisible('sla')) {
      cols.push({
        accessorKey: 'sla',
        header: 'SLA',
        cell: ({ row }) => {
          return <WorkOrderSLAStatus workOrder={row.original} variant="table" />;
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
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onViewDetails(wo.id); }}
                  className="text-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onEdit(wo); }}
                  className="text-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(wo); }}
                  className="text-sm text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
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
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Work Order</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded w-40 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded w-28 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded w-8 animate-pulse" /></TableCell>
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
      <div className="border border-border rounded-lg p-12 bg-card text-center">
        <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-3">
          <ClipboardList className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No work orders</p>
        <p className="text-xs text-muted-foreground">No work orders match your current filters</p>
      </div>
    );
  }

  // Main table
  return (
    <div className="flex flex-col h-full max-h-full border border-border rounded-lg overflow-hidden bg-card shadow-sm">
      {/* Table Container with Flex */}
      <div className="flex-1 overflow-auto min-h-0">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-medium text-[11px]">
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'flex items-center gap-1.5 cursor-pointer select-none hover:text-foreground transition-colors' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-muted-foreground/50">
                            {{
                              asc: <ChevronUp className="w-3.5 h-3.5" />,
                              desc: <ChevronDown className="w-3.5 h-3.5" />,
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
            {table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                onClick={() => onViewDetails(row.original.id)}
                className={`cursor-pointer transition-all duration-150 hover:scale-[1.002] hover:shadow-sm hover:bg-accent/50 dark:hover:bg-accent ${index % 2 === 1 ? 'bg-muted/50' : 'bg-background'
                  }`}
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
      <div className="flex-shrink-0 px-4 py-2 bg-muted border-t border-border">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, workOrders.length)} of {workOrders.length}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Rows:</span>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-16 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-7 px-2 text-xs"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-7 px-2 text-xs"
              >
                Next
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




