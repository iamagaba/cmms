import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, ClipboardIcon } from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { WorkOrder, Technician, Vehicle, Customer } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { useWorkOrderData } from '@/hooks/useWorkOrderData';
import { supabase } from '@/integrations/supabase/client';
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

  // Fetch diagnostic categories for service type lookup
  const { data: serviceCategories } = useQuery<DiagnosticCategoryRow[]>({
    queryKey: ['diagnostic_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('diagnostic_categories').select('*');
      if (error) return [];
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

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

    // Priority styling - handle both lowercase (DB) and capitalized values
    const priorityStyles: Record<string, { border: string; text: string; bg: string }> = {
      'critical': { border: 'border-red-200', text: 'text-red-700', bg: 'bg-red-50' },
      'Critical': { border: 'border-red-200', text: 'text-red-700', bg: 'bg-red-50' },
      'urgent': { border: 'border-red-200', text: 'text-red-700', bg: 'bg-red-50' },
      'Urgent': { border: 'border-red-200', text: 'text-red-700', bg: 'bg-red-50' },
      'high': { border: 'border-orange-200', text: 'text-orange-700', bg: 'bg-orange-50' },
      'High': { border: 'border-orange-200', text: 'text-orange-700', bg: 'bg-orange-50' },
      'medium': { border: 'border-amber-200', text: 'text-amber-700', bg: 'bg-amber-50' },
      'Medium': { border: 'border-amber-200', text: 'text-amber-700', bg: 'bg-amber-50' },
      'low': { border: 'border-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50' },
      'Low': { border: 'border-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    };
    const priorityStyle = priorityStyles[workOrder.priority || 'medium'] || priorityStyles['medium'];

    // Format title with proper capitalization
    const formatTitle = (text: string) => {
      return text.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };

    // Get the display title - look up service category name
    const getDisplayTitle = () => {
      // First try to look up the service category by ID
      if (workOrder.service_category_id && serviceCategories) {
        const category = serviceCategories.find(c => c.id === workOrder.service_category_id);
        if (category?.label || category?.name) {
          return category.label || category.name;
        }
      }

      // Also check if workOrder.service is a category ID
      if (workOrder.service && serviceCategories) {
        const category = serviceCategories.find(c => c.id === workOrder.service);
        if (category?.label || category?.name) {
          return category.label || category.name;
        }
      }

      // Try title field
      if (workOrder.title && !workOrder.title.includes('-') && workOrder.title.length < 50) {
        return workOrder.title;
      }

      // Try initialDiagnosis if it's not a placeholder
      if (workOrder.initialDiagnosis &&
        !workOrder.initialDiagnosis.toLowerCase().includes('what type of issue') &&
        !workOrder.initialDiagnosis.includes('-') || workOrder.initialDiagnosis.length < 30) {
        return workOrder.initialDiagnosis;
      }

      return 'General Service';
    };

    const title = getDisplayTitle();
    const formattedTitle = formatTitle(title);

    // Use work order number as primary identifier
    const licensePlate = vehicle?.license_plate || 'N/A';
    const woNumber = workOrder.workOrderNumber || `WO-${workOrder.id.substring(0, 6).toUpperCase()}`;

    return (
      <div
        onClick={() => onSelectWorkOrder(workOrder.id)}
        className={`px-3 py-2.5 border-b border-gray-100 cursor-pointer transition-all ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'
          }`}
      >
        {/* Row 1: License Plate + Status + Time */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
              {licensePlate}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${workOrder.status === 'Open' ? 'bg-blue-50 text-blue-700' :
              workOrder.status === 'Confirmation' ? 'bg-purple-50 text-purple-700' :
                workOrder.status === 'Ready' ? 'bg-cyan-50 text-cyan-700' :
                  workOrder.status === 'In Progress' ? 'bg-orange-50 text-orange-700' :
                    workOrder.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                      workOrder.status === 'On Hold' ? 'bg-slate-50 text-slate-700' :
                        'bg-red-50 text-red-700'
              }`}>
              {workOrder.status || 'Open'}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {dayjs(workOrder.created_at).fromNow()}
          </span>
        </div>

        {/* Row 2: Issue Type + Vehicle Model (combined) */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
          <span className="truncate font-medium">{formattedTitle}</span>
          {vehicle && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 truncate">{vehicle.make} {vehicle.model}</span>
            </>
          )}
        </div>

        {/* Row 3: WO Number + Technician + Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isSelected ? 'text-purple-600' : 'text-primary-500'}`}>
              {woNumber}
            </span>
            <span className={`text-xs ${technician ? 'text-gray-500' : 'text-amber-600 font-medium'}`}>
              {technician ? technician.name : 'Unassigned'}
            </span>
          </div>
          {workOrder.priority && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityStyle.bg} ${priorityStyle.text}`}>
              {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-50 border-r border-gray-200 ${className}`}>
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
    <div className={`bg-gray-50 border-r border-gray-200 flex flex-col ${className}`}>
      {/* Header - Sticky */}
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-gray-50/95 backdrop-blur-md backdrop-saturate-150 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Work Orders</h2>
          <span className="text-xs text-gray-500">{filteredWorkOrders.length}</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <HugeiconsIcon icon={Search01Icon} size={14} className="text-gray-400" />
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
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${statusFilter === key
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
            <HugeiconsIcon icon={ClipboardIcon} size={32} className="text-gray-300 mx-auto mb-2" />
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