/**
 * Professional Work Order Data Table
 * 
 * A specialized data table for work orders using the professional design system.
 * Demonstrates the integration of badges, buttons, and table components.
 */

import React, { useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon, Car01Icon } from '@hugeicons/core-free-icons';
import dayjs from 'dayjs';
import ProfessionalDataTable, { TableColumn } from '../ui/ProfessionalDataTable';
import { WorkOrderStatusBadge, PriorityBadge } from '../ui/ProfessionalBadge';
import ProfessionalButton from '../ui/ProfessionalButton';
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
              <HugeiconsIcon icon={UserIcon} size={12} className="text-white" />
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
            <HugeiconsIcon icon={Car01Icon} size={16} className="text-machinery-500" />
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
          <div className={`text-sm ${
            isOverdue ? 'text-warning-600' : 
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
          <ProfessionalButton
            variant="ghost"
            size="sm"
            icon="tabler:eye"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(record.id);
            }}
            aria-label="View details"
          />
          <ProfessionalButton
            variant="ghost"
            size="sm"
            icon="tabler:edit"
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit action
            }}
            aria-label="Edit work order"
          />
          <ProfessionalButton
            variant="ghost"
            size="sm"
            icon="tabler:dots-vertical"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more actions
            }}
            aria-label="More actions"
          />
        </div>
      ),
    },
  ], [technicianMap, vehicleMap, onViewDetails]);

  return (
    <ProfessionalDataTable
      columns={columns}
      data={workOrders}
      loading={loading}
      rowKey="id"
      selectable={!!onSelectionChange}
      selectedRows={selectedRows}
      onSelectionChange={onSelectionChange}
      onRowClick={onViewDetails ? (record) => onViewDetails(record.id) : undefined}
      pagination={pagination}
      searchable={searchable}
      searchPlaceholder="Search work orders..."
      emptyText="No work orders found"
      size="base"
      striped={true}
      className="shadow-sm"
    />
  );
};

export default ProfessionalWorkOrderTable;