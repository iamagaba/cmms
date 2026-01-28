import React, { useState, useMemo } from 'react';
import { Search, Clipboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { WorkOrder } from '@/types/supabase';
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
        wo.work_order_number?.toLowerCase().includes(query) ||
        wo.service?.toLowerCase().includes(query) ||
        (wo as any).description?.toLowerCase().includes(query) ||
        vehicles?.find(v => v.id === wo.vehicle_id)?.license_plate?.toLowerCase().includes(query) ||
        customers?.find(c => c.id === wo.customer_id)?.name?.toLowerCase().includes(query)
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
    const vehicle = vehicles?.find(v => v.id === workOrder.vehicle_id);
    const technician = technicians?.find(t => t.id === workOrder.assigned_technician_id);
    const isSelected = workOrder.id === currentWorkOrderId;

    // Status styles for distinct badge look
    const statusStyles: Record<string, string> = {
      'Open': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Confirmation': 'bg-primary/10 text-primary',
      'Ready': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'In Progress': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Completed': 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700',
      'On Hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const statusClass = statusStyles[workOrder.status || 'Open'] || statusStyles['Open'];

    // Format title with proper capitalization
    const formatTitle = (text: string) => {
      return text.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };

    // Shortened relative time
    const getShortTime = (dateStr: string | null) => {
      if (!dateStr) return '';
      const date = dayjs(dateStr);
      const now = dayjs();
      const diffMins = now.diff(date, 'minute');
      const diffHours = now.diff(date, 'hour');
      const diffDays = now.diff(date, 'day');

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.format('MMM D');
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

      const anyWorkOrder = workOrder as any;

      // Try title field
      if (anyWorkOrder.title && !anyWorkOrder.title.includes('-') && anyWorkOrder.title.length < 50) {
        return anyWorkOrder.title;
      }

      // Try initialDiagnosis if it's not a placeholder
      if (anyWorkOrder.initialDiagnosis &&
        !anyWorkOrder.initialDiagnosis.toLowerCase().includes('what type of issue') &&
        !anyWorkOrder.initialDiagnosis.includes('-') || (anyWorkOrder.initialDiagnosis && anyWorkOrder.initialDiagnosis.length < 30)) {
        return anyWorkOrder.initialDiagnosis;
      }

      return 'General Service';
    };

    const title = getDisplayTitle();
    const formattedTitle = formatTitle(title);

    // Use work order number as primary identifier
    const licensePlate = vehicle?.license_plate || 'N/A';
    const woNumber = workOrder.work_order_number || `WO-${workOrder.id.substring(0, 6).toUpperCase()}`;

    return (
      <div
        onClick={() => onSelectWorkOrder(workOrder.id)}
        className={`px-3 py-2.5 border-b border-border cursor-pointer transition-all ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
          }`}
      >
        {/* Row 1: License Plate + Time */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
              {licensePlate}
            </span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {getShortTime(workOrder.created_at)}
          </span>
        </div>

        {/* Row 2: Issue Type + Vehicle Model (combined) */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <span className="truncate font-medium">{formattedTitle}</span>
          {vehicle && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground truncate">{vehicle.make} {vehicle.model}</span>
            </>
          )}
        </div>

        {/* Row 3: WO Number + Technician + Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isSelected ? 'text-primary' : 'text-primary'}`}>
              {woNumber}
            </span>
            <span className={`text-xs ${technician ? 'text-muted-foreground' : 'text-amber-600 font-medium'}`}>
              {technician ? technician.name : 'Unassigned'}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${statusClass}`}>
            {workOrder.status || 'Open'}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-muted border-r border-border ${className}`}>
        <div className="p-4 border-b border-border">
          <div className="h-4 bg-muted-foreground/20 rounded-lg animate-pulse mb-3" />
          <div className="h-8 bg-muted-foreground/20 rounded-lg animate-pulse" />
        </div>
        <div className="divide-y divide-border">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-3 space-y-2">
              <div className="flex justify-between">
                <div className="h-3 bg-muted-foreground/20 rounded-lg w-20 animate-pulse" />
                <div className="h-3 bg-muted-foreground/20 rounded-lg w-12 animate-pulse" />
              </div>
              <div className="h-3 bg-muted-foreground/20 rounded-lg w-full animate-pulse" />
              <div className="h-3 bg-muted-foreground/20 rounded-lg w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-muted border-r border-border flex flex-col ${className}`}>
      {/* Header - Sticky */}
      <div className="p-4 border-b border-border sticky top-0 bg-muted/95 backdrop-blur-md backdrop-saturate-150 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Work Orders</h2>
          <span className="text-xs text-muted-foreground">{filteredWorkOrders.length}</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search work orders..."
            className="pl-8"
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
              <Button
                key={key}
                variant={statusFilter === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(key)}
                className="h-7 px-2 text-xs"
              >
                {label} ({count})
              </Button>
            ))}
        </div>
      </div>

      {/* Work Orders List - Clean Master List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-transparent">
        {filteredWorkOrders.length === 0 ? (
          <div className="p-6 text-center">
            <Clipboard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' ? 'No work orders match your filters' : 'No work orders found'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredWorkOrders.map((workOrder) => (
              <WorkOrderItem key={workOrder.id} workOrder={workOrder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


