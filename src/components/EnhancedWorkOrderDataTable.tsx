import { ClipboardList, MoreVertical, Eye, Edit, Trash2, ChevronUp, ChevronDown, User, Clock, Flag, Check, ArrowRight, Pause, PhoneOff } from 'lucide-react';
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
import { calculateStatusSLA, formatDuration } from '@/utils/slaCalculations';
import { SLA_CONFIG } from '@/config/slaConfig';


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
  columnOrder?: string[];
  emergencyBikeAssignments?: any[];
  mobileBreakpoint?: number;
}

// Status colors for circular icons - UNIFIED SYSTEM
// These colors match the badge variants in src/components/ui/badge.tsx
const STATUS_COLORS: Record<string, { color: string; label: string; icon: 'dashed' | 'check' | 'arrow' | 'pause' | 'phoneOff' }> = {
  'New': { color: '#64748b', label: 'New', icon: 'dashed' },           // slate-500
  'Open': { color: '#64748b', label: 'New', icon: 'dashed' },          // slate-500
  'Confirmation': { color: '#64748b', label: 'Confirmation', icon: 'phoneOff' }, // slate-500 (same as Open/New)
  'Ready': { color: '#64748b', label: 'Ready', icon: 'arrow' },         // slate-500 (same as Open/New)
  'On Hold': { color: '#f97316', label: 'On Hold', icon: 'pause' },     // orange-500
  'In Progress': { color: '#f59e0b', label: 'In Progress', icon: 'arrow' }, // amber-500
  'Completed': { color: '#10b981', label: 'Completed', icon: 'check' }, // emerald-500
  'Cancelled': { color: '#6b7280', label: 'Cancelled', icon: 'dashed' }, // gray-500
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

const DEFAULT_COLUMNS = ['workOrderNumber', 'service', 'status', 'location', 'priority', 'technician', 'createdAt'];

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
  columnOrder = [],
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
          const w = wo as any;
          // Display the actual issue description from service_notes, or fall back to service category
          const issueDescription = w.service_notes || w.serviceNotes;
          const serviceCategoryLabel = serviceCategories?.find(cat => cat.id === wo.service)?.label;

          return (
            <div className="max-w-[200px] truncate text-sm">
              {issueDescription || serviceCategoryLabel || wo.service || 'No description'}
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
          const wo = row.original;
          const status = wo.status || 'New';
          const statusConfig = STATUS_COLORS[status] || STATUS_COLORS['New'];

          const renderIcon = () => {
            if (statusConfig.icon === 'dashed') {
              return (
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-dashed"
                  style={{ borderColor: statusConfig.color }}
                />
              );
            }

            if (statusConfig.icon === 'check') {
              return (
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: statusConfig.color }}
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              );
            }

            if (statusConfig.icon === 'arrow') {
              return (
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: statusConfig.color }}
                >
                  <ArrowRight className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              );
            }

            if (statusConfig.icon === 'pause') {
              return (
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: statusConfig.color }}
                >
                  <Pause className="w-3 h-3 text-white" strokeWidth={3} fill="white" />
                </div>
              );
            }

            if (statusConfig.icon === 'phoneOff') {
              return (
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: statusConfig.color }}
                >
                  <PhoneOff className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              );
            }
          };

          return (
            <div className="flex items-center gap-2">
              {renderIcon()}
              <span className="text-sm text-foreground">{statusConfig.label}</span>
            </div>
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
          const priority = (row.original.priority || 'none').toLowerCase();

          const priorityConfig: Record<string, { color: string; label: string }> = {
            'critical': { color: '#ef4444', label: 'High' },
            'urgent': { color: '#ef4444', label: 'High' },
            'high': { color: '#ef4444', label: 'High' },
            'medium': { color: '#22c55e', label: 'Low' },
            'normal': { color: '#22c55e', label: 'Low' },
            'low': { color: '#22c55e', label: 'Low' },
            'routine': { color: '#94a3b8', label: 'None' },
            'none': { color: '#94a3b8', label: 'None' },
          };

          const config = priorityConfig[priority] || priorityConfig['none'];

          return (
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 flex-shrink-0" style={{ color: config.color }} fill={config.color} />
              <span className="text-sm text-foreground">{config.label}</span>
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
          const wo = row.original;
          const slaStats = calculateStatusSLA(wo);

          // If no SLA or completed, show completed status with time
          if (!slaStats || wo.status === 'Completed') {
            // Calculate completion time for completed work orders
            const completedTime = wo.completed_at
              ? formatDuration(Math.abs(dayjs(wo.completed_at).diff(dayjs(wo.created_at), 'minute')))
              : 'N/A';

            // Check if completed after SLA deadline
            let checkColor = '#22c55e'; // Default green
            if (wo.completed_at && wo.created_at) {
              const completedAt = dayjs(wo.completed_at);
              const createdAt = dayjs(wo.created_at);
              const totalMinutes = completedAt.diff(createdAt, 'minute');

              // Get total SLA time (sum of all status thresholds)
              const totalSLAMinutes = Object.values(SLA_CONFIG.statusThresholds).reduce((sum, val) => sum + val, 0);

              // If completed after total SLA time, mark as red
              if (totalMinutes > totalSLAMinutes) {
                checkColor = '#ef4444'; // Red for breach
              }
            }

            return (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: checkColor }} />
                <span className="text-sm text-foreground">{completedTime}</span>
              </div>
            );
          }

          const slaConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
            'on-track': { color: '#22c55e', icon: Clock, label: formatDuration(slaStats.timeRemaining) },
            'at-risk': { color: '#f97316', icon: Clock, label: formatDuration(slaStats.timeRemaining) },
            'breached': { color: '#ef4444', icon: Clock, label: formatDuration(slaStats.timeRemaining).replace('-', '') }
          };

          const config = slaConfig[slaStats.status] || slaConfig['on-track'];
          const SlaIcon = config.icon;

          return (
            <div className="flex items-center gap-2">
              <SlaIcon className="w-4 h-4 flex-shrink-0" style={{ color: config.color }} />
              <span className="text-sm text-foreground">{config.label}</span>
            </div>
          );
        },
      });
    }

    // Due Date column
    if (isColumnVisible('dueDate')) {
      cols.push({
        accessorKey: 'appointment_date',
        header: 'Due Date',
        cell: ({ row }) => {
          const appointmentDate = row.original.appointment_date || (row.original as any).appointmentDate;
          return (
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {appointmentDate ? dayjs(appointmentDate).format('MMM D, YYYY') : '—'}
            </div>
          );
        },
      });
    }

    // Channel column
    if (isColumnVisible('channel')) {
      cols.push({
        accessorKey: 'channel',
        header: 'Channel',
        cell: ({ row }) => {
          const channel = row.original.channel || (row.original as any).channel || 'Walk-in';
          return (
            <div className="text-sm text-foreground">
              {channel}
            </div>
          );
        },
      });
    }

    // Customer Name column
    if (isColumnVisible('customerName')) {
      cols.push({
        accessorKey: 'customer_name',
        header: 'Customer',
        cell: ({ row }) => {
          const wo = row.original;
          const w = wo as any;
          const customerId = w.customer_id || w.customerId;
          const customer = customers?.find(c => c.id === customerId);
          const customerName = customer?.name || w.customer_name || w.customerName;

          return (
            <div className="text-sm text-foreground">
              {customerName || '—'}
            </div>
          );
        },
      });
    }

    // Location column
    if (isColumnVisible('location')) {
      cols.push({
        accessorKey: 'location_id',
        header: 'Location',
        cell: ({ row }) => {
          const wo = row.original;
          const w = wo as any;
          const locationId = w.location_id || w.locationId;
          const location = locations?.find(l => l.id === locationId);

          return (
            <div className="text-sm text-foreground">
              {location?.name || '—'}
            </div>
          );
        },
      });
    }

    // Scheduled Date column
    if (isColumnVisible('scheduledDate')) {
      cols.push({
        accessorKey: 'scheduled_date',
        header: 'Scheduled',
        cell: ({ row }) => {
          const scheduledDate = row.original.scheduled_date || (row.original as any).scheduledDate;
          return (
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {scheduledDate ? dayjs(scheduledDate).format('MMM D, YYYY') : '—'}
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

    // Reorder columns based on columnOrder if provided
    // Required columns stay in fixed positions, only optional columns are reordered
    if (columnOrder && columnOrder.length > 0) {
      // Map logical column names to accessor keys
      const keyMapping: Record<string, string> = {
        'service': 'service',
        'priority': 'priority',
        'sla': 'sla',
        'technician': 'assignedTechnicianId',
        'scheduledDate': 'scheduled_date',
        'dueDate': 'appointment_date',
        'channel': 'channel',
        'customerName': 'customer_name',
        'location': 'location_id',
        'createdAt': 'created_at',
      };

      // Required columns in fixed order
      const requiredOrder = ['workOrderNumber', 'service', 'status', 'location_id'];

      const orderedCols: ColumnDef<WorkOrder>[] = [];
      const colMap = new Map<string, ColumnDef<WorkOrder>>();

      // Create a map of accessor key to column definition
      cols.forEach(col => {
        const key = typeof col.accessorKey === 'string' ? col.accessorKey : col.id;
        if (key) colMap.set(key, col);
      });

      // First, add required columns in their fixed order
      requiredOrder.forEach(key => {
        const col = colMap.get(key);
        if (col) {
          orderedCols.push(col);
          colMap.delete(key);
        }
      });

      // Then add optional columns in the order specified by columnOrder
      columnOrder.forEach(logicalKey => {
        const accessorKey = keyMapping[logicalKey] || logicalKey;
        // Skip if it's a required column (already added)
        if (requiredOrder.includes(accessorKey)) return;

        const col = colMap.get(accessorKey);
        if (col) {
          orderedCols.push(col);
          colMap.delete(accessorKey);
        }
      });

      // Add any remaining columns (like actions)
      colMap.forEach(col => orderedCols.push(col));

      return orderedCols;
    }

    return cols;
  }, [visibleColumns, columnOrder, vehicles, technicians, serviceCategories, onEdit, onDelete, onViewDetails]);

  // Initialize table
  const table = useReactTable({
    data: workOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    // Disable client-side pagination since we're using server-side pagination
    manualPagination: true,
    pageCount: -1, // Unknown page count (handled by server)
  });

  // Loading state
  if (loading) {
    return (
      <div className="border-0 rounded-lg overflow-hidden bg-card">
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
      <div className="border-0 rounded-lg p-12 bg-card text-center">
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
    <div className="flex flex-col h-full max-h-full border-0 rounded-lg overflow-hidden bg-card shadow-sm">
      {/* Table Container - Fixed: Remove horizontal scroll, fix header bleeding */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted border-b border-border backdrop-blur-sm">
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
                className={`cursor-pointer transition-all duration-150 hover:scale-[1.002] hover:shadow-sm hover:bg-muted dark:hover:bg-muted/50 ${index % 2 === 1 ? 'bg-muted/30' : 'bg-background'
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

      {/* Pagination controls removed - using server-side pagination in parent component */}
    </div>
  );
}




