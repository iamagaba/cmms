/**
 * Professional Work Order Data Table
 * 
 * A specialized data table for work orders using shadcn/ui components.
 * Demonstrates the integration of badges, buttons, and table components.
 */

import React, { useMemo } from 'react';
import { User, Car } from 'lucide-react';
import dayjs from 'dayjs';
import { TableColumn } from '../ui/EnhancedDataTable';
import { StatusBadge, PriorityBadge, WorkOrderStatusBadge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import Icon from '../icons/Icon';
import { WorkOrder, Technician, Vehicle } from '@/types/supabase';

// ============================================
// COMPONENT INTERFACES
// ============================================

interface ProfessionalWorkOrderTableProps {
  workOrders: WorkOrder[];
  technicians?: Technician[];
  vehicles?: Vehicle[];
  loading?: boolean;
  onViewDetails?: (workOrderId: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onAssignTechnician?: (id: string, technicianId: string) => void;
  selectedRows?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  searchable?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getPriorityFromWorkOrder = (workOrder: WorkOrder): 'critical' | 'high' | 'medium' | 'low' | 'routine' => {
  // Map work order priority to our badge system
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

const ProfessionalWorkOrderTable: React.FC<ProfessionalWorkOrderTableProps> = ({
  workOrders,
  technicians = [],
  vehicles = [],
  loading = false,
  onViewDetails,
  onUpdateStatus,
  onAssignTechnician,
  selectedRows = [],
  onSelectionChange,
  searchable = true,
  pagination,
}) => {
  // Create technician lookup map
  const technicianMap = useMemo(() => {
    return technicians.reduce((acc, tech) => {
      acc[tech.id] = tech;
      return acc;
    }, {} as Record<string, Technician>);
  }, [technicians]);

  // Create vehicle lookup map
  const vehicleMap = useMemo(() => {
    return vehicles.reduce((acc, vehicle) => {
      acc[vehicle.id] = vehicle;
      return acc;
    }, {} as Record<string, Vehicle>);
  }, [vehicles]);

  // Define table columns
  const columns: TableColumn<WorkOrder>[] = useMemo(() => [
    {
      key: 'id',
      title: 'Work Order ID',
      dataIndex: 'id',
      width: 120,
      render: (value: string) => (
        <span className="font-mono text-steel-600 font-medium">
          #{value.slice(-6).toUpperCase()}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'title',
      title: 'Title',
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
        <WorkOrderStatusBadge
          status={getStatusFromWorkOrder(record)}
          size="sm"
        />
      ),
      sortable: true,
    },
    {
      key: 'priority',
      title: 'Priority',
      dataIndex: 'priority',
      width: 120,
      render: (value: string, record: WorkOrder) => (
        <PriorityBadge
          priority={getPriorityFromWorkOrder(record)}
          size="sm"
        />
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
            <span className="text-machinery-400 italic">
              Unassigned
            </span>
          );
        }

        const technician = technicianMap[value];
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-steel-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-machinery-700 font-medium">
              {technician?.name || 'Unknown'}
            </span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'vehicleId',
      title: 'Asset',
      dataIndex: 'vehicleId',
      width: 140,
      render: (value: string) => {
        if (!value) {
          return (
            <span className="text-machinery-400 italic">
              No asset
            </span>
          );
        }

        const vehicle = vehicleMap[value];
        return (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-machinery-500" />
            <span className="text-machinery-700">
              {vehicle?.make} {vehicle?.model}
            </span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      width: 120,
      render: (value: string) => (
        <div className="text-sm">
          <div className="text-machinery-700">
            {dayjs(value).format('MMM DD')}
          </div>
          <div className="text-machinery-500">
            {dayjs(value).format('HH:mm')}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      dataIndex: 'dueDate',
      width: 120,
      render: (value: string) => {
        if (!value) {
          return (
            <span className="text-machinery-400 italic">
              No due date
            </span>
          );
        }

        const dueDate = dayjs(value);
        const isOverdue = dueDate.isBefore(dayjs());
        const isToday = dueDate.isSame(dayjs(), 'day');

        return (
          <div className={`text-sm ${isOverdue ? 'text-warning-600' :
            isToday ? 'text-maintenance-600' :
              'text-machinery-700'
            }`}>
            <div className="font-medium">
              {dueDate.format('MMM DD')}
            </div>
            <div className="text-xs">
              {isOverdue ? 'Overdue' :
                isToday ? 'Due today' :
                  dueDate.fromNow()}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      align: 'center',
      render: (value: any, record: WorkOrder) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(record.id);
            }}
            aria-label="View details"
          >
            <Icon icon="tabler:eye" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit action
            }}
            aria-label="Edit work order"
          >
            <Icon icon="tabler:edit" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more actions
            }}
            aria-label="More actions"
          >
            <Icon icon="tabler:dots-vertical" className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [technicianMap, vehicleMap, onViewDetails]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-machinery-200">
      {searchable && (
        <div className="p-4 border-b border-machinery-200">
          <div className="relative">
            <Icon icon="tabler:search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search work orders..."
              className="pl-9"
            />
          </div>
        </div>
      )}

      {loading ? (
        <TableSkeleton columns={columns.length} rows={5} />
      ) : workOrders.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-machinery-500">No work orders found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectionChange && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === workOrders.length && workOrders.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectionChange(workOrders.map(wo => wo.id));
                      } else {
                        onSelectionChange([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-2 border-machinery-300 text-steel-600"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map((record, index) => {
              const key = record.id;
              const isSelected = selectedRows.includes(key);

              return (
                <TableRow
                  key={key}
                  className={cn(
                    'group cursor-pointer hover:bg-muted/50',
                    isSelected && 'bg-steel-50',
                    index % 2 === 1 && 'bg-muted/20'
                  )}
                  onClick={() => onViewDetails?.(record.id)}
                >
                  {onSelectionChange && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (isSelected) {
                            onSelectionChange(selectedRows.filter(k => k !== key));
                          } else {
                            onSelectionChange([...selectedRows, key]);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-2 border-machinery-300 text-steel-600"
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = column.dataIndex ? record[column.dataIndex] : undefined;
                    const content = column.render ? column.render(value, record, index) : value;

                    return (
                      <TableCell
                        key={column.key}
                        className={cn(
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.className
                        )}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {pagination && (
        <div className="flex items-center justify-between p-4 border-t border-machinery-200">
          <div className="text-sm text-machinery-600">
            Showing {((pagination.current - 1) * pagination.pageSize) + 1} to {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for loading skeleton
const TableSkeleton: React.FC<{ columns: number; rows?: number }> = ({
  columns,
  rows = 5
}) => (
  <div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-b border-machinery-100 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4 rounded flex-1 bg-machinery-200"
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default ProfessionalWorkOrderTable;
