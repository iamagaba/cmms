import { AlertCircle, Calendar, ClipboardList, Clock, User } from 'lucide-react';
/**
 * Modern Work Order Data Table
 * 
 * A specialized implementation of EnhancedDataTable for work orders
 * with maintenance-specific features and workflows.
 */

import React, { useMemo } from 'react';


import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import EnhancedDataTable, {
  EnhancedTableProps,
  ColumnFilter,
  BulkAction,
  ExportOption,
  TableColumn
} from '../ui/EnhancedDataTable';
import { StatusBadge, PriorityBadge, WorkOrderStatusBadge } from '../ui/badge';
import { Button } from '../ui/button';
import Icon from '../icons/Icon';
import { WorkOrder, Technician, Vehicle, Customer, Location, Profile } from '@/types/supabase';

dayjs.extend(relativeTime);

// ============================================
// COMPONENT INTERFACES
// ============================================

interface ModernWorkOrderDataTableProps extends Omit<EnhancedTableProps<WorkOrder>, 'columns' | 'data'> {
  workOrders: WorkOrder[];
  technicians?: Technician[];
  vehicles?: Vehicle[];
  customers?: Customer[];
  locations?: Location[];
  profiles?: Profile[];

  // Work order specific actions
  onEdit?: (workOrder: WorkOrder) => void;
  onDelete?: (workOrder: WorkOrder) => void;
  onUpdateWorkOrder?: (id: string, updates: Partial<WorkOrder>) => void;
  onViewDetails?: (workOrderId: string) => void;
  onAssignTechnician?: (workOrderId: string, technicianId: string) => void;
  onUpdateStatus?: (workOrderId: string, status: string) => void;

  // Display options
  enableBulkActions?: boolean;
  enableAdvancedFilters?: boolean;
  enableExport?: boolean;
  compactMode?: boolean;

  // Error handling
  error?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getPriorityFromWorkOrder = (workOrder: WorkOrder): 'critical' | 'high' | 'medium' | 'low' | 'routine' => {
  const priority = workOrder.priority?.toLowerCase();
  switch (priority) {
    case 'critical':
    case 'urgent':
      return 'critical';
    case 'high':
      return 'high';
    case 'medium':
    case 'normal':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'routine';
  }
};

const getStatusFromWorkOrder = (workOrder: WorkOrder): 'new' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'scheduled' => {
  const status = workOrder.status?.toLowerCase().replace(/\s+/g, '-');
  switch (status) {
    case 'new':
    case 'open':
      return 'new';
    case 'in-progress':
    case 'in_progress':
    case 'active':
      return 'in-progress';
    case 'on-hold':
    case 'on_hold':
    case 'paused':
      return 'on-hold';
    case 'completed':
    case 'closed':
    case 'done':
      return 'completed';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    case 'scheduled':
      return 'scheduled';
    default:
      return 'new';
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const ModernWorkOrderDataTable: React.FC<ModernWorkOrderDataTableProps> = ({
  workOrders,
  technicians = [],
  vehicles = [],
  customers = [],
  locations = [],
  profiles = [],
  onEdit,
  onDelete,
  onUpdateWorkOrder,
  onViewDetails,
  onAssignTechnician,
  onUpdateStatus,
  enableBulkActions = true,
  enableAdvancedFilters = true,
  enableExport = true,
  compactMode = false,
  error,
  ...props
}) => {
  // Create lookup maps for performance
  const technicianMap = useMemo(() => {
    return technicians.reduce((acc, tech) => {
      acc[tech.id] = tech;
      return acc;
    }, {} as Record<string, Technician>);
  }, [technicians]);

  const vehicleMap = useMemo(() => {
    return vehicles.reduce((acc, vehicle) => {
      acc[vehicle.id] = vehicle;
      return acc;
    }, {} as Record<string, Vehicle>);
  }, [vehicles]);

  const customerMap = useMemo(() => {
    return customers.reduce((acc, customer) => {
      acc[customer.id] = customer;
      return acc;
    }, {} as Record<string, Customer>);
  }, [customers]);

  const locationMap = useMemo(() => {
    return locations.reduce((acc, location) => {
      acc[location.id] = location;
      return acc;
    }, {} as Record<string, Location>);
  }, [locations]);

  // Define table columns
  const columns: TableColumn<WorkOrder>[] = useMemo(() => [
    {
      key: 'workOrderNumber',
      title: 'Work Order #',
      dataIndex: 'workOrderNumber',
      width: 140,
      render: (value: string, record: WorkOrder) => (
        <div className="flex items-center gap-3">
          {/* Enhancement #5: Icon integration with visual balance */}
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <div className="font-mono font-medium tracking-tight text-sm text-foreground">
              {value || `WO-${record.id.slice(-6).toUpperCase()}`}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              ID: {record.id.slice(-8)}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'title',
      title: 'Title & Description',
      dataIndex: 'title',
      render: (value: string, record: WorkOrder) => (
        <div className="max-w-xs">
          <div className="font-medium text-machinery-900 truncate">
            {value || 'Untitled Work Order'}
          </div>
          {record.description && (
            <div className="text-sm text-machinery-500 truncate mt-1">
              {record.description}
            </div>
          )}
          {record.issueType && (
            <div className="text-xs text-steel-600 mt-1 font-medium">
              {record.issueType}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      render: (value: string, record: WorkOrder) => (
        // Enhancement #5: Icon with status badge
        <div className="flex items-center gap-2">
          <WorkOrderStatusBadge
            status={getStatusFromWorkOrder(record)}
            size="sm"
          />
        </div>
      ),
      sortable: true,
    },
    {
      key: 'priority',
      title: 'Priority',
      dataIndex: 'priority',
      width: 120,
      render: (value: string, record: WorkOrder) => (
        // Enhancement #5: Icon with priority badge
        <div className="flex items-center gap-2">
          <PriorityBadge
            priority={getPriorityFromWorkOrder(record)}
            size="sm"
          />
        </div>
      ),
      sortable: true,
    },
    {
      key: 'assignedTo',
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      width: 160,
      render: (value: string) => {
        if (!value) {
          return (
            <span className="text-machinery-400 italic text-sm">
              Unassigned
            </span>
          );
        }

        const technician = technicianMap[value];
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-steel-500 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-machinery-700">
                {technician?.name || 'Unknown'}
              </div>
              {technician?.email && (
                <div className="text-xs text-machinery-500">
                  {technician.email}
                </div>
              )}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'vehicleId',
      title: 'Asset',
      dataIndex: 'vehicleId',
      width: 160,
      render: (value: string, record: WorkOrder) => {
        if (!value) {
          return (
            <span className="text-muted-foreground italic text-sm">
              No asset assigned
            </span>
          );
        }

        const vehicle = vehicleMap[value];
        const customer = vehicle?.customerId ? customerMap[vehicle.customerId] : null;

        return (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold text-foreground">
                {vehicle?.make} {vehicle?.model}
              </div>
              {vehicle?.licensePlate && (
                <div className="font-mono font-medium tracking-tight text-xs text-primary">
                  {vehicle.licensePlate}
                </div>
              )}
              {customer && (
                <div className="text-xs text-muted-foreground">
                  {customer.name}
                </div>
              )}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      width: 160,
      render: (value: string) => (
        // Enhancement #5: Icon integration for dates
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-machinery-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-machinery-600" />
          </div>
          <div className="text-sm">
            <div className="text-machinery-700 font-medium">
              {dayjs(value).format('MMM DD, YYYY')}
            </div>
            <div className="text-machinery-500 text-xs">
              {dayjs(value).format('HH:mm')} • {dayjs(value).fromNow()}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      dataIndex: 'dueDate',
      width: 160,
      render: (value: string) => {
        if (!value) {
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-machinery-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-machinery-400" />
              </div>
              <span className="text-machinery-400 italic text-sm">
                No due date
              </span>
            </div>
          );
        }

        const dueDate = dayjs(value);
        const now = dayjs();
        const isOverdue = dueDate.isBefore(now);
        const isToday = dueDate.isSame(now, 'day');
        const isTomorrow = dueDate.isSame(now.add(1, 'day'), 'day');

        // Enhancement #5: Icon with contextual color
        const iconBgColor = isOverdue ? 'bg-warning-100' :
          isToday ? 'bg-maintenance-100' :
            'bg-machinery-100';
        const iconColor = isOverdue ? 'text-warning-600' :
          isToday ? 'text-maintenance-600' :
            'text-machinery-600';

        return (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
              <Clock className="w-4 h-4" className={iconColor} />
            </div>
            <div className={`text-sm ${isOverdue ? 'text-warning-600' :
              isToday ? 'text-maintenance-600' :
                isTomorrow ? 'text-steel-600' :
                  'text-machinery-700'
              }`}>
              <div className="font-medium">
                {dueDate.format('MMM DD, YYYY')}
              </div>
              <div className="text-xs">
                {isOverdue ? `Overdue by ${now.diff(dueDate, 'day')} days` :
                  isToday ? 'Due today' :
                    isTomorrow ? 'Due tomorrow' :
                      dueDate.fromNow()}
              </div>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 140,
      align: 'center',
      render: (value: any, record: WorkOrder) => (
        // Enhancement #5: Action buttons with hover reveal
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(record.id);
              }}
              aria-label="View work order details"
            >
              <Icon icon="tabler:eye" className="w-4 h-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
              aria-label="Edit work order"
            >
              <Icon icon="tabler:edit" className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle dropdown menu for more actions
            }}
            aria-label="More actions"
          >
            <Icon icon="tabler:dots-vertical" className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [technicianMap, vehicleMap, customerMap, onViewDetails, onEdit]);

  // Define filters
  const filters: ColumnFilter[] = useMemo(() => {
    if (!enableAdvancedFilters) return [];

    return [
      {
        key: 'status',
        type: 'select',
        label: 'Status',
        options: [
          { label: 'New', value: 'new' },
          { label: 'In Progress', value: 'in-progress' },
          { label: 'On Hold', value: 'on-hold' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Scheduled', value: 'scheduled' },
        ],
      },
      {
        key: 'priority',
        type: 'select',
        label: 'Priority',
        options: [
          { label: 'Critical', value: 'critical' },
          { label: 'High', value: 'high' },
          { label: 'Medium', value: 'medium' },
          { label: 'Low', value: 'low' },
          { label: 'Routine', value: 'routine' },
        ],
      },
      {
        key: 'assignedTo',
        type: 'select',
        label: 'Assigned Technician',
        options: [
          { label: 'Unassigned', value: '' },
          ...technicians.map(tech => ({
            label: tech.name,
            value: tech.id,
          })),
        ],
      },
      {
        key: 'issueType',
        type: 'text',
        label: 'Issue Type',
        placeholder: 'Filter by issue type...',
      },
      {
        key: 'createdAt',
        type: 'daterange',
        label: 'Created Date',
      },
      {
        key: 'dueDate',
        type: 'daterange',
        label: 'Due Date',
      },
    ];
  }, [enableAdvancedFilters, technicians]);

  // Define bulk actions
  const bulkActions: BulkAction[] = useMemo(() => {
    if (!enableBulkActions) return [];

    return [
      {
        key: 'assign',
        label: 'Assign Technician',
        icon: 'tabler:user-plus',
        variant: 'primary',
      },
      {
        key: 'updateStatus',
        label: 'Update Status',
        icon: 'tabler:refresh',
        variant: 'secondary',
      },
      {
        key: 'setPriority',
        label: 'Set Priority',
        icon: 'tabler:flag',
        variant: 'outline',
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: 'tabler:trash',
        variant: 'danger',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to delete the selected work orders? This action cannot be undone.',
      },
    ];
  }, [enableBulkActions]);

  // Define export options
  const exportOptions: ExportOption[] = useMemo(() => {
    if (!enableExport) return [];

    return [
      {
        key: 'csv',
        label: 'Export as CSV',
        icon: 'tabler:file-text',
        format: 'csv',
      },
      {
        key: 'excel',
        label: 'Export as Excel',
        icon: 'tabler:file-spreadsheet',
        format: 'excel',
      },
      {
        key: 'pdf',
        label: 'Export as PDF',
        icon: 'tabler:file-type-pdf',
        format: 'pdf',
      },
    ];
  }, [enableExport]);

  // Handle bulk actions
  const handleBulkAction = (action: string, selectedWorkOrders: WorkOrder[]) => {
    switch (action) {
      case 'assign':
        // Open technician assignment dialog
        console.log('Assign technician to:', selectedWorkOrders);
        break;
      case 'updateStatus':
        // Open status update dialog
        console.log('Update status for:', selectedWorkOrders);
        break;
      case 'setPriority':
        // Open priority setting dialog
        console.log('Set priority for:', selectedWorkOrders);
        break;
      case 'delete':
        // Delete selected work orders
        selectedWorkOrders.forEach(wo => onDelete?.(wo));
        break;
    }
  };

  // Handle export
  const handleExport = (format: string, data: WorkOrder[]) => {
    console.log(`Exporting ${data.length} work orders as ${format}`);
    // Implement export logic here
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <AlertCircle className="w-5 h-5 text-warning-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-machinery-900 mb-2">Error Loading Work Orders</h3>
        <p className="text-machinery-600">{error}</p>
      </div>
    );
  }

  return (
    <EnhancedDataTable
      {...props}
      columns={columns}
      data={workOrders}
      filters={filters}
      bulkActions={bulkActions}
      exportOptions={exportOptions}
      onBulkAction={handleBulkAction}
      onExport={handleExport}
      compactMode={compactMode}
      density="comfortable"
      searchColumns={['title', 'description', 'workOrderNumber', 'issueType']}
      searchPlaceholder="Search work orders by title, description, number, or issue type..."
      emptyText="No work orders found"
      ariaLabel="Work Orders Data Table"
      ariaDescription="A table displaying work orders with filtering, sorting, and bulk action capabilities"
      onRowClick={onViewDetails ? (record) => onViewDetails(record.id) : undefined}
    />
  );
};

export default ModernWorkOrderDataTable;



