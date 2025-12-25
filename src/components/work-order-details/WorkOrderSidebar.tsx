import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { WorkOrder, Technician, Vehicle, Customer } from '@/types/supabase';
import { useWorkOrderData } from '@/hooks/useWorkOrderData';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface WorkOrderSidebarProps {
  currentWorkOrderId: string;
  onSelectWorkOrder: (workOrderId: string) => void;
  className?: string;
}

export const WorkOrderSidebar: React.FC<WorkOrderSidebarProps> = ({
  currentWorkOrderId,
  onSelectWorkOrder,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const {
    allWorkOrders,
    technicians,
    vehicles,
    customers,
    isLoading
  } = useWorkOrderData();

  // Filter and search work orders
  const filteredWorkOrders = useMemo(() => {
    let filtered = allWorkOrders || [];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(wo => wo.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(wo =>
        wo.workOrderNumber?.toLowerCase().includes(query) ||
        wo.service?.toLowerCase().includes(query) ||
        wo.description?.toLowerCase().includes(query) ||
        vehicles?.find(v => v.id === wo.vehicleId)?.license_plate?.toLowerCase().includes(query) ||
        customers?.find(c => c.id === wo.customerId)?.name?.toLowerCase().includes(query)
      );
    }

    // Sort by created date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  }, [allWorkOrders, statusFilter, searchQuery, vehicles, customers]);

  const statusCounts = useMemo(() => {
    const counts = { 
      all: 0, 
      open: 0, 
      confirmation: 0,
      ready: 0,
      inProgress: 0, 
      completed: 0, 
      onHold: 0,
      cancelled: 0
    };
    (allWorkOrders || []).forEach(wo => {
      counts.all++;
      if (wo.status === 'Open') counts.open++;
      else if (wo.status === 'Confirmation') counts.confirmation++;
      else if (wo.status === 'Ready') counts.ready++;
      else if (wo.status === 'In Progress') counts.inProgress++;
      else if (wo.status === 'Completed') counts.completed++;
      else if (wo.status === 'On Hold') counts.onHold++;
      else if (wo.status === 'Cancelled') counts.cancelled++;
    });
    return counts;
  }, [allWorkOrders]);

  const WorkOrderItem = ({ workOrder }: { workOrder: WorkOrder }) => {
    const vehicle = vehicles?.find(v => v.id === workOrder.vehicleId);
    const customer = customers?.find(c => c.id === workOrder.customerId);
    const technician = technicians?.find(t => t.id === workOrder.assignedTechnicianId);
    const isSelected = workOrder.id === currentWorkOrderId;

    // Status dot colors
    const statusDotColors: Record<string, string> = {
      'Open': 'bg-blue-500',
      'Confirmation': 'bg-purple-500',
      'Ready': 'bg-cyan-500',
      'In Progress': 'bg-orange-500',
      'Completed': 'bg-emerald-500',
      'On Hold': 'bg-slate-400',
      'Cancelled': 'bg-red-500',
    };
    const statusDotColor = statusDotColors[workOrder.status || 'Open'] || statusDotColors['Open'];

    // Priority styling
    const priorityStyles: Record<string, { border: string; text: string }> = {
      'Critical': { border: 'border-red-200', text: 'text-red-600' },
      'High': { border: 'border-orange-200', text: 'text-orange-600' },
      'Medium': { border: 'border-yellow-200', text: 'text-yellow-600' },
      'Low': { border: 'border-green-200', text: 'text-green-600' },
    };
    const priorityStyle = priorityStyles[workOrder.priority || 'Medium'] || priorityStyles['Medium'];

    // Format title with proper capitalization
    const formatTitle = (text: string) => {
      return text.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };

    const title = workOrder.service || workOrder.description || 'General Service';
    const formattedTitle = formatTitle(title);

    // Truncate WO number for cleaner display
    const woNumber = workOrder.workOrderNumber || `WO-${workOrder.id.substring(0, 6).toUpperCase()}`;
    const truncatedWoNumber = woNumber.length > 15 ? `${woNumber.substring(0, 12)}...` : woNumber;

    return (
      <div
        onClick={() => onSelectWorkOrder(workOrder.id)}
        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
          isSelected ? 'bg-purple-50 text-purple-900' : ''
        }`}
      >
        {/* Row 1: Title (Primary) and Status Dot */}
        <div className="flex justify-between items-start mb-1">
          <h4 className={`text-sm font-semibold truncate pr-2 ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
            {formattedTitle}
          </h4>
          <span className={`h-2 w-2 rounded-full ${statusDotColor} mt-1 flex-shrink-0`} title={workOrder.status || 'Open'} />
        </div>

        {/* Row 2: WO# (Secondary) and Time */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">
            {truncatedWoNumber}
          </span>
          <span className="text-xs text-gray-400">
            {dayjs(workOrder.created_at).fromNow()}
          </span>
        </div>

        {/* Row 3: Asset (No Box!) */}
        {vehicle && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Icon icon="tabler:car" className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{vehicle.license_plate} • {vehicle.make} {vehicle.model}</span>
          </div>
        )}

        {/* Row 4: Footer - Technician and Priority */}
        <div className="flex justify-between items-center mt-2">
          <span className={`text-xs font-medium ${technician ? 'text-gray-700' : 'text-orange-600'}`}>
            {technician ? technician.name : 'Unassigned'}
          </span>
          {workOrder.priority && (
            <span className={`text-[10px] border ${priorityStyle.border} ${priorityStyle.text} px-1.5 py-0.5 rounded`}>
              {workOrder.priority}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-white border-r border-gray-200 ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-3 space-y-2">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
      {/* Header - Sticky */}
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white/85 backdrop-blur-md backdrop-saturate-150 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Work Orders</h2>
          <span className="text-xs text-gray-500">{filteredWorkOrders.length}</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search work orders..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'Open', label: 'Open', count: statusCounts.open },
            { key: 'Confirmation', label: 'Confirmation', count: statusCounts.confirmation },
            { key: 'Ready', label: 'Ready', count: statusCounts.ready },
            { key: 'In Progress', label: 'In Progress', count: statusCounts.inProgress },
            { key: 'On Hold', label: 'On Hold', count: statusCounts.onHold },
            { key: 'Completed', label: 'Completed', count: statusCounts.completed },
            { key: 'Cancelled', label: 'Cancelled', count: statusCounts.cancelled },
          ]
            .filter(({ key, count }) => key === 'all' || count > 0)
            .map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === key
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
        </div>
      </div>

      {/* Work Orders List - Clean Master List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {filteredWorkOrders.length === 0 ? (
          <div className="p-6 text-center">
            <Icon icon="tabler:clipboard-off" className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' ? 'No work orders match your filters' : 'No work orders found'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredWorkOrders.map((workOrder) => (
              <WorkOrderItem key={workOrder.id} workOrder={workOrder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};