import React, { useState, useMemo } from 'react';
import { Search, Clipboard, Check, ArrowRight, Pause, Flag, PhoneOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { WorkOrder } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { getWorkOrderNumber } from '@/utils/work-order-display';
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
      if (wo.status === 'New') counts.open++;
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

    // Status configuration matching the table - UNIFIED SYSTEM
    const getStatusConfig = (status: string) => {
      const statusMap: Record<string, { color: string; label: string; icon: 'dashed' | 'check' | 'arrow' | 'pause' | 'phoneOff' }> = {
        'New': { color: '#64748b', label: 'New', icon: 'dashed' },           // slate-500
        'Open': { color: '#64748b', label: 'New', icon: 'dashed' },          // slate-500
        'Confirmation': { color: '#64748b', label: 'Confirmation', icon: 'phoneOff' }, // slate-500
        'Ready': { color: '#64748b', label: 'Ready', icon: 'arrow' },         // slate-500
        'On Hold': { color: '#f97316', label: 'On Hold', icon: 'pause' },     // orange-500
        'In Progress': { color: '#f59e0b', label: 'In Progress', icon: 'arrow' }, // amber-500
        'Completed': { color: '#10b981', label: 'Completed', icon: 'check' }, // emerald-500
        'Cancelled': { color: '#6b7280', label: 'Cancelled', icon: 'dashed' }, // gray-500
      };
      return statusMap[status] || statusMap['New'];
    };

    // Priority configuration matching the table
    const getPriorityConfig = (priority?: string) => {
      const p = (priority || 'none').toLowerCase();
      const priorityMap: Record<string, { color: string; label: string }> = {
        'critical': { color: '#ef4444', label: 'High' },
        'urgent': { color: '#ef4444', label: 'High' },
        'high': { color: '#ef4444', label: 'High' },
        'medium': { color: '#22c55e', label: 'Low' },
        'normal': { color: '#22c55e', label: 'Low' },
        'low': { color: '#22c55e', label: 'Low' },
        'routine': { color: '#94a3b8', label: 'None' },
        'none': { color: '#94a3b8', label: 'None' },
      };
      return priorityMap[p] || priorityMap['none'];
    };

    const statusConfig = getStatusConfig(workOrder.status || 'New');
    const priorityConfig = getPriorityConfig(workOrder.priority || undefined);

    // Render status icon
    const renderStatusIcon = () => {
      const iconStyle = {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0
      };
      
      if (statusConfig.icon === 'dashed') {
        return (
          <div
            style={{
              ...iconStyle,
              border: '2px dashed',
              borderColor: statusConfig.color,
              backgroundColor: 'transparent'
            }}
          />
        );
      }

      if (statusConfig.icon === 'check') {
        return (
          <div
            style={{
              ...iconStyle,
              backgroundColor: statusConfig.color
            }}
          >
            <Check style={{ width: '10px', height: '10px', color: 'white', strokeWidth: 3 }} />
          </div>
        );
      }

      if (statusConfig.icon === 'arrow') {
        return (
          <div
            style={{
              ...iconStyle,
              backgroundColor: statusConfig.color
            }}
          >
            <ArrowRight style={{ width: '10px', height: '10px', color: 'white', strokeWidth: 3 }} />
          </div>
        );
      }

      if (statusConfig.icon === 'pause') {
        return (
          <div
            style={{
              ...iconStyle,
              backgroundColor: statusConfig.color
            }}
          >
            <Pause style={{ width: '10px', height: '10px', color: 'white', strokeWidth: 3, fill: 'white' }} />
          </div>
        );
      }

      if (statusConfig.icon === 'phoneOff') {
        return (
          <div
            style={{
              ...iconStyle,
              backgroundColor: statusConfig.color
            }}
          >
            <PhoneOff style={{ width: '10px', height: '10px', color: 'white', strokeWidth: 3 }} />
          </div>
        );
      }
    };

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
    const woNumber = getWorkOrderNumber(workOrder);

    return (
      <div
        onClick={() => onSelectWorkOrder(workOrder.id)}
        className={`px-3 py-2 border-b border-border cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-l border-l-primary' : 'hover:bg-muted/50 border-l border-l-transparent'
          }`}
      >
        {/* Header Row: License Plate + Status + Time */}
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs ${isSelected ? 'text-primary' : 'text-foreground'}`}>
            {woNumber}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStatusIcon()}
              <span className="text-[10px] text-muted-foreground">{statusConfig.label}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {getShortTime(workOrder.created_at)}
            </span>
          </div>
        </div>

        {/* Issue Type */}
        <div className="text-xs text-foreground mb-1 truncate">
          {formattedTitle}
        </div>

        {/* Bottom Row: Priority + Technician */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flag className="w-3 h-3 flex-shrink-0" style={{ color: priorityConfig.color }} fill={priorityConfig.color} />
            <span className="text-[10px] text-muted-foreground">{priorityConfig.label}</span>
          </div>
          <span className={`text-[10px] truncate max-w-[100px] ${technician ? 'text-muted-foreground' : 'text-amber-600'}`}>
            {technician ? technician.name : 'Unassigned'}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-background border-r border-border ${className}`}>
        <div className="p-3 border-b border-border">
          <div className="h-4 bg-muted rounded animate-pulse mb-2" />
          <div className="h-8 bg-muted rounded animate-pulse" />
        </div>
        <div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-3 py-2 border-b border-border space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-20 animate-pulse" />
                <div className="h-3 bg-muted rounded w-12 animate-pulse" />
              </div>
              <div className="h-3 bg-muted rounded w-full animate-pulse" />
              <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-background border-r border-border flex flex-col ${className}`}>
      {/* Header - Sticky */}
      <div className="p-3 border-b border-border sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs text-foreground">Work Orders</h2>
          <span className="text-xs text-muted-foreground">{filteredWorkOrders.length}</span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search work orders..."
            className="pl-8 h-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'Ready', label: 'Ready', count: statusCounts.ready },
            { key: 'In Progress', label: 'In Progress', count: statusCounts.inProgress },
            { key: 'Completed', label: 'Completed', count: statusCounts.completed },
          ]
            .filter(({ key, count }) => key === 'all' || count > 0)
            .map(({ key, label, count }) => (
              <Button
                key={key}
                variant={statusFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(key)}
                className="h-6 px-2 text-[10px]"
              >
                {label} ({count})
              </Button>
            ))}
        </div>
      </div>

      {/* Work Orders List - Clean Master List */}
      <div className="flex-1 overflow-y-auto">
        {filteredWorkOrders.length === 0 ? (
          <div className="p-6 text-center">
            <Clipboard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' ? 'No work orders match your filters' : 'No work orders found'}
            </p>
          </div>
        ) : (
          <div>
            {filteredWorkOrders.map((workOrder) => (
              <WorkOrderItem key={workOrder.id} workOrder={workOrder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


