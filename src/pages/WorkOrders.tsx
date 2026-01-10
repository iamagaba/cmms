import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Stack,
  Button,
  Menu,
  Skeleton,
  Title,
  Text,
  Group,
  MultiSelect,
  Paper
} from '@/components/tailwind-components';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Car01Icon,
  UserIcon,
  Add01Icon,
  Alert01Icon,
  RefreshIcon,
  Download01Icon,
  FilterIcon,
  Cancel01Icon,
  Search01Icon,
  CheckmarkCircle01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete01Icon,
  ListViewIcon,
  Location01Icon,
  Tick01Icon,
  Clock01Icon,
  PauseIcon,
  AlertCircleIcon,
  Menu01Icon,
  FilterRemoveIcon,
  UserAdd01Icon,
  LayoutTwoColumnIcon
} from '@hugeicons/core-free-icons';
import { useDisclosure, useMediaQuery } from '@/hooks/tailwind';
import { EnhancedWorkOrderDataTable } from "@/components/EnhancedWorkOrderDataTable";
import { REQUIRED_COLUMNS, OPTIONAL_COLUMNS } from "@/components/work-order-columns-constants";
import { WorkOrderDetailsDrawer } from "@/components/WorkOrderDetailsDrawer";
import { CreateWorkOrderForm } from "@/components/work-orders/CreateWorkOrderForm";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { useDensity } from "@/context/DensityContext";
import { useDensitySpacing } from "@/hooks/useDensitySpacing";

// Utility functions
import ErrorBoundary from "@/components/ErrorBoundary";

import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';

import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useWorkOrderFilters } from "@/hooks/useWorkOrderFilters";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useNotifications } from '@/hooks/useNotifications';
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { WorkOrder } from "@/types/supabase";
import { WorkOrdersMap } from "@/components/maps/WorkOrdersMap";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fix import if file exists, otherwise comment out or remove if verified unused
// import WorkOrderProgressTimeline from "@/components/WorkOrderProgressTimeline";

dayjs.extend(isBetween);
dayjs.extend(relativeTime);

type WorkOrderView = 'table' | 'map' | 'progress';

// Enhanced status and priority configurations
const STATUS_CONFIG = {
  'Open': { color: 'blue', icon: Clock01Icon, label: 'Open' },
  'In Progress': { color: 'orange', icon: Clock01Icon, label: 'In Progress' },
  'Completed': { color: 'green', icon: CheckmarkCircle01Icon, label: 'Completed' },
  'On Hold': { color: 'yellow', icon: PauseIcon, label: 'On Hold' },
  'Cancelled': { color: 'red', icon: AlertCircleIcon, label: 'Cancelled' },
} as const;

const PRIORITY_CONFIG = {
  'High': { color: 'red', icon: ArrowUp01Icon, label: 'High Priority' },
  'Medium': { color: 'yellow', icon: Menu01Icon, label: 'Medium Priority' },
  'Low': { color: 'green', icon: ArrowDown01Icon, label: 'Low Priority' },
} as const;

const WorkOrdersPage = () => {
  // Component state
  const [view, setView] = useState<WorkOrderView>('table');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isCompact } = useDensity();
  const spacing = useDensitySpacing();

  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workOrderToDelete, setWorkOrderToDelete] = useState<WorkOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Enhanced UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [technicianFilter, setTechnicianFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<WorkOrder[]>([]);
  const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(false);


  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);

  // Handler to open the new work order form dialog
  const onCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  // Maximum number of columns that can be displayed (set high to allow all columns)
  const MAX_VISIBLE_COLUMNS = 13;

  // Load visible columns from localStorage or use defaults
  // Required columns are always included
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('workOrderVisibleColumns');
    const defaultOptional = ['service', 'priority', 'technician'];
    if (saved) {
      const parsed = JSON.parse(saved).filter((col: string) => col !== 'actions');
      // Ensure required columns are always included
      const withRequired = [...new Set([...REQUIRED_COLUMNS, ...parsed])];
      return withRequired;
    }
    return [...REQUIRED_COLUMNS, ...defaultOptional];
  });

  // Column selector menu state
  const [columnMenuOpened, setColumnMenuOpened] = useState(false);

  // Save visible columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workOrderVisibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Toggle column visibility (only for optional columns)
  const toggleColumn = (columnValue: string) => {
    // Don't allow toggling required columns
    if (REQUIRED_COLUMNS.includes(columnValue)) return;

    setVisibleColumns(prev => {
      const isCurrentlyVisible = prev.includes(columnValue);

      if (isCurrentlyVisible) {
        // Remove column
        return prev.filter(col => col !== columnValue);
      } else {
        // Add column (check max limit)
        if (prev.length >= MAX_VISIBLE_COLUMNS) {
          return prev;
        }
        return [...prev, columnValue];
      }
    });
  };

  // Reset columns to default
  const resetColumnsToDefault = () => {
    const defaultOptional = ['service', 'priority', 'technician'];
    setVisibleColumns([...REQUIRED_COLUMNS, ...defaultOptional]);
    setColumnMenuOpened(false);
  };

  // Custom hooks for data, mutations, and filters
  const {
    allWorkOrders,
    technicians,
    locations,
    customers,
    vehicles,
    profiles,
    serviceCategories,
    slaPolicies,
    isLoading,
    error,
    refetch
  } = useWorkOrderData();

  // Fetch active emergency bike assignments
  const { data: emergencyBikeAssignments } = useQuery({
    queryKey: ['emergency_bike_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_bike_assignments')
        .select('*')
        .is('returned_at', null);
      if (error) throw error;
      return data;
    },
  });

  const { showSuccess, showInfo, showError } = useNotifications();

  const {
    vehicleFilter,
    statusFilter: hookStatusFilter, // Keep this if used, otherwise remove
    setVehicleFilter,
    setStatusFilter: setHookStatusFilter, // Keep if used
    filteredWorkOrders,
  } = useWorkOrderFilters(allWorkOrders, technicians);

  const {
    updateWorkOrder,
    saveWorkOrder,
    deleteWorkOrder,
  } = useWorkOrderMutations({ serviceCategories, slaPolicies, technicians, locations });

  const { add: addToSearchHistory } = useSearchHistory();

  // Enhanced filtering and search
  const processedWorkOrders = useMemo(() => {
    let filtered = filteredWorkOrders || [];

    // Advanced search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(wo =>
        wo.workOrderNumber?.toLowerCase().includes(query) ||
        wo.description?.toLowerCase().includes(query) ||
        wo.initialDiagnosis?.toLowerCase().includes(query) ||
        wo.service?.toLowerCase().includes(query) ||
        vehicles?.find(v => v.id === wo.vehicleId)?.license_plate?.toLowerCase().includes(query) ||
        vehicles?.find(v => v.id === wo.vehicleId)?.make?.toLowerCase().includes(query) ||
        vehicles?.find(v => v.id === wo.vehicleId)?.model?.toLowerCase().includes(query) ||
        customers?.find(c => c.id === wo.customerId)?.name?.toLowerCase().includes(query) ||
        technicians?.find(t => t.id === wo.assignedTechnicianId)?.name?.toLowerCase().includes(query) ||
        locations?.find(l => l.id === wo.locationId)?.name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(wo => statusFilter.includes(wo.status || ''));
    }

    // Priority filter
    if (priorityFilter.length > 0) {
      filtered = filtered.filter(wo => priorityFilter.includes(wo.priority || ''));
    }

    // Technician filter
    if (technicianFilter.length > 0) {
      filtered = filtered.filter(wo =>
        wo.assignedTechnicianId && technicianFilter.includes(wo.assignedTechnicianId)
      );
    }

    // Location filter
    if (locationFilter.length > 0) {
      filtered = filtered.filter(wo =>
        wo.locationId && locationFilter.includes(wo.locationId)
      );
    }

    return filtered;
  }, [filteredWorkOrders, debouncedSearchQuery, statusFilter, priorityFilter, technicianFilter, locationFilter, vehicles, customers, technicians, locations]);



  // Update search history with result count when search results change
  useEffect(() => {
    if (vehicleFilter.trim() && processedWorkOrders) {
      addToSearchHistory(vehicleFilter.trim(), processedWorkOrders.length);
    }
  }, [vehicleFilter, processedWorkOrders?.length, addToSearchHistory]);

  // Saved preset filter: All vs Active Loaners
  const [preset] = useState<'all' | 'active-loaners'>('all');

  // Event handlers
  const handleSave = (workOrderData: WorkOrder) => {
    saveWorkOrder(workOrderData);
  };

  const handleDeleteClick = (workOrderData: WorkOrder) => {
    setWorkOrderToDelete(workOrderData);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setWorkOrderToDelete(null); // Indicates bulk delete
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (workOrderToDelete) {
        // Single delete
        await deleteWorkOrder(workOrderToDelete);
      } else {
        // Bulk delete
        for (const record of selectedRecords) {
          await deleteWorkOrder(record);
        }
        setSelectedRecords([]);
        showSuccess(`${selectedRecords.length} work orders deleted`, {
          title: 'Work Orders Deleted',
        });
      }
      // Manually refresh data to update UI since Realtime doesn't sync with mutation invalidation automatically
      await refetch();

      setDeleteDialogOpen(false);
      setWorkOrderToDelete(null);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateWorkOrder = useCallback((id: string, updates: Partial<WorkOrder>) => {
    const workOrder = allWorkOrders?.find(wo => wo.id === id);
    if (!workOrder) return;

    updateWorkOrder(workOrder, updates, setOnHoldWorkOrder);
  }, [allWorkOrders, updateWorkOrder]);

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    handleUpdateWorkOrder(onHoldWorkOrder.id, updates);
    setOnHoldWorkOrder(null);
  };

  // Enhanced bulk actions
  const handleBulkStatusUpdate = useCallback((status: string) => {
    selectedRecords.forEach(record => {
      handleUpdateWorkOrder(record.id, { status: status as any });
    });
    setSelectedRecords([]);
    showSuccess(`${selectedRecords.length} work orders updated to ${status}`, {
      title: 'Status Updated',
    });
  }, [selectedRecords, handleUpdateWorkOrder]);

  const handleBulkAssign = useCallback((technicianId: string) => {
    const technician = technicians?.find(t => t.id === technicianId);
    selectedRecords.forEach(record => {
      handleUpdateWorkOrder(record.id, { assignedTechnicianId: technicianId });
    });
    setSelectedRecords([]);
    showInfo(`${selectedRecords.length} work orders assigned to ${technician?.name}`, {
      title: 'Technician Assigned',
    });
  }, [selectedRecords, handleUpdateWorkOrder, technicians]);

  // Export functionality
  const handleExport = useCallback(() => {
    const csvContent = [
      ['Work Order', 'Status', 'Priority', 'Vehicle', 'Technician', 'Created', 'SLA Due'].join(','),
      ...processedWorkOrders.map(wo => [
        wo.workOrderNumber || wo.id.substring(0, 8),
        wo.status || '',
        wo.priority || '',
        vehicles?.find(v => v.id === wo.vehicleId)?.license_plate || '',
        technicians?.find(t => t.id === wo.assignedTechnicianId)?.name || 'Unassigned',
        dayjs(wo.created_at).format('YYYY-MM-DD'),
        wo.slaDue ? dayjs(wo.slaDue).format('YYYY-MM-DD') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-orders-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showSuccess(`${processedWorkOrders.length} work orders exported`, {
      title: 'Export Complete',
    });
  }, [processedWorkOrders, vehicles, technicians]);

  // Filter options
  const statusOptions = Object.keys(STATUS_CONFIG).map(status => ({ value: status, label: status }));
  const priorityOptions = Object.keys(PRIORITY_CONFIG).map(priority => ({ value: priority, label: priority }));
  const technicianOptions = technicians?.map(t => ({ value: t.id, label: t.name })) || [];
  const locationOptions = locations?.map(l => ({ value: l.id, label: l.name })) || [];

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter([]);
    setPriorityFilter([]);
    setTechnicianFilter([]);
    setLocationFilter([]);
    setVehicleFilter(''); // Clear the existing vehicle filter too
  }, [setVehicleFilter]);

  const hasActiveFilters = searchQuery || statusFilter.length > 0 || priorityFilter.length > 0 ||
    technicianFilter.length > 0 || locationFilter.length > 0;

  const [drawerWorkOrderId, setDrawerWorkOrderId] = useState<string | null>(null);
  const lastClickTimeRef = useRef(0);
  const isDrawerOpenRef = useRef(false);
  const drawerOpenedAtRef = useRef(0);

  const handleViewDetails = useCallback((workOrderId: string) => {
    console.log('🎯 handleViewDetails called with workOrderId:', workOrderId);
    const now = Date.now();
    // Prevent rapid successive clicks (debounce for 250ms)
    if (now - lastClickTimeRef.current < 250) {
      console.log('⏱️ Debounced - too soon after last click');
      return;
    }
    lastClickTimeRef.current = now;

    // If drawer is already open with the same ID, ignore
    if (isDrawerOpenRef.current && drawerWorkOrderId === workOrderId) {
      console.log('🔄 Drawer already open with same ID');
      return;
    }

    console.log('📂 Opening drawer with workOrderId:', workOrderId);
    // Open drawer
    setDrawerWorkOrderId(workOrderId);
    isDrawerOpenRef.current = true;
    drawerOpenedAtRef.current = now;
  }, [drawerWorkOrderId]);

  const handleVisibleColumnsChange = setVisibleColumns;



  // Define pageActions for AppBreadcrumb (e.g., bulk actions, add button)
  const pageActions = (
    <Button
      variant="filled"
      leftSection={<HugeiconsIcon icon={Add01Icon} size={16} />}
      onClick={onCreateNew}
      className="mb-md"
    >
      Create Work Order
    </Button>
  );

  if (error) {
    return (
      <div className="w-full px-6 py-6 bg-white dark:bg-gray-950 min-h-screen">
        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
            <HugeiconsIcon icon={Alert01Icon} size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Work Orders</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
            {(error as any).message || 'An unexpected error occurred while loading work orders.'}
          </p>
          <Button
            variant="filled"
            onClick={() => refetch()}
            className="bg-red-600 hover:bg-red-700"
          >
            <Group gap="xs">
              <HugeiconsIcon icon={RefreshIcon} size={16} />
              <span>Try Again</span>
            </Group>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full px-6 py-6 bg-white dark:bg-gray-950 min-h-screen">
        <Stack gap="lg">
          {/* Header Skeleton */}
          <div className="flex justify-between items-start">
            <div>
              <Skeleton height="32px" width="180px" radius="md" />
              <Skeleton height="16px" width="280px" radius="md" mt={8} />
            </div>
            <div className="flex gap-2">
              <Skeleton height="36px" width="100px" radius="md" />
              <Skeleton height="36px" width="140px" radius="md" />
            </div>
          </div>

          {/* Status Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    <Skeleton height="14px" width="60px" radius="md" />
                    <Skeleton height="28px" width="40px" radius="md" mt={8} />
                  </div>
                  <Skeleton height="48px" width="48px" radius="lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Search Skeleton */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <Skeleton height="44px" radius="lg" />
          </div>

          {/* Table Skeleton */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <Skeleton height="32px" width="200px" radius="md" />
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton height="40px" width="4px" radius="md" />
                  <Skeleton height="16px" width="100px" radius="md" />
                  <Skeleton height="16px" width="200px" radius="md" className="flex-1" />
                  <Skeleton height="24px" width="80px" radius="md" />
                  <Skeleton height="16px" width="60px" radius="md" />
                </div>
              ))}
            </div>
          </div>
        </Stack>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full h-[calc(100vh-2rem)] flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
        <Stack gap="sm" className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-none px-4 pt-3 pb-2">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-sm font-bold font-brand text-gray-900 dark:text-gray-100">
                Work Orders
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  disabled={processedWorkOrders.length === 0}
                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                >
                  <HugeiconsIcon icon={Download01Icon} size={14} />
                </button>
                <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                  <button
                    onClick={() => setView('table')}
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-all ${view === 'table'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                  >
                    <HugeiconsIcon icon={ListViewIcon} size={12} />
                    Table
                  </button>
                  <button
                    onClick={() => setView('map')}
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-all ${view === 'map'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                  >
                    <HugeiconsIcon icon={Location01Icon} size={12} />
                    Map
                  </button>
                </div>
                <button
                  onClick={onCreateNew}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors"
                >
                  <HugeiconsIcon icon={Add01Icon} size={12} />
                  <span>{isMobile ? 'New' : 'New Work Order'}</span>
                </button>
              </div>
            </div>

            {/* Command Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <HugeiconsIcon icon={Search01Icon} size={14} className="text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} />
                  </button>
                )}
              </div>
              <button
                onClick={toggleFilters}
                className={`inline-flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium rounded transition-colors border ${filtersOpened ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <HugeiconsIcon icon={FilterIcon} size={12} />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full bg-primary-600 dark:bg-primary-500 text-white text-[9px] font-semibold">
                    {[searchQuery, statusFilter.length > 0, priorityFilter.length > 0, technicianFilter.length > 0, locationFilter.length > 0].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>



          {/* Active Filters Display - "Ribbon" Style */}
          {hasActiveFilters && !filtersOpened && (
            <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
              {statusFilter.map(status => (
                <span key={status} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-[10px] font-medium border border-purple-200 dark:border-purple-800">
                  {status}
                  <button onClick={() => setStatusFilter(statusFilter.filter(s => s !== status))} className="hover:text-purple-900 dark:hover:text-purple-100 flex items-center justify-center">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              ))}
              {priorityFilter.map(priority => (
                <span key={priority} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-[10px] font-medium border border-purple-200 dark:border-purple-800">
                  {priority}
                  <button onClick={() => setPriorityFilter(priorityFilter.filter(p => p !== priority))} className="hover:text-purple-900 dark:hover:text-purple-100 flex items-center justify-center">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              ))}
              {technicianFilter.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-[10px] font-medium border border-purple-200 dark:border-purple-800">
                  {technicianFilter.length} technician{technicianFilter.length > 1 ? 's' : ''}
                  <button onClick={() => setTechnicianFilter([])} className="hover:text-purple-900 dark:hover:text-purple-100 flex items-center justify-center">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}
              {locationFilter.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-[10px] font-medium border border-purple-200 dark:border-purple-800">
                  {locationFilter.length} location{locationFilter.length > 1 ? 's' : ''}
                  <button onClick={() => setLocationFilter([])} className="hover:text-purple-900 dark:hover:text-purple-100 flex items-center justify-center">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-[10px] font-medium border border-gray-200 dark:border-gray-700">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-gray-900 dark:hover:text-gray-100 flex items-center justify-center">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}
              {(statusFilter.length > 0 || priorityFilter.length > 0 || technicianFilter.length > 0 || locationFilter.length > 0 || searchQuery) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline ml-1"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Search and Filters Panel - Only visible when Filters button is clicked */}
          {filtersOpened && (
            <div className="mx-4 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md">
              <div className="space-y-3">
                {/* Filter Dropdowns */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">Status</label>
                    <MultiSelect
                      placeholder="All statuses"
                      data={statusOptions}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      clearable
                      size="xs"
                      className="[&_input]:rounded [&_input]:text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">Priority</label>
                    <MultiSelect
                      placeholder="All priorities"
                      data={priorityOptions}
                      value={priorityFilter}
                      onChange={setPriorityFilter}
                      clearable
                      size="xs"
                      className="[&_input]:rounded [&_input]:text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">Technician</label>
                    <MultiSelect
                      placeholder="All technicians"
                      data={technicianOptions}
                      value={technicianFilter}
                      onChange={setTechnicianFilter}
                      clearable
                      searchable
                      size="xs"
                      className="[&_input]:rounded [&_input]:text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">Location</label>
                    <MultiSelect
                      placeholder="All locations"
                      data={locationOptions}
                      value={locationFilter}
                      onChange={setLocationFilter}
                      clearable
                      searchable
                      size="xs"
                      className="[&_input]:rounded [&_input]:text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{processedWorkOrders.length}</span> of {allWorkOrders?.length || 0} work orders
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <HugeiconsIcon icon={FilterRemoveIcon} size={12} />
                      <span>Reset filters</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedRecords.length > 0 && (
            <div className="mx-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-md p-2 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-xs font-medium text-primary-900 dark:text-primary-100">
                    {selectedRecords.length} work order{selectedRecords.length !== 1 ? 's' : ''} selected
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Menu>
                    <Menu.Target>
                      <button className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 rounded text-[10px] font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />
                        Status
                        <HugeiconsIcon icon={ArrowDown01Icon} size={10} />
                      </button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {statusOptions.map(option => (
                        <Menu.Item
                          key={option.value}
                          leftSection={<HugeiconsIcon icon={STATUS_CONFIG[option.value as keyof typeof STATUS_CONFIG]?.icon} size={12} />}
                          onClick={() => handleBulkStatusUpdate(option.value)}
                        >
                          {option.label}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>

                  <Menu>
                    <Menu.Target>
                      <button className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 rounded text-[10px] font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                        <HugeiconsIcon icon={UserAdd01Icon} size={12} />
                        Assign
                        <HugeiconsIcon icon={ArrowDown01Icon} size={10} />
                      </button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {technicians?.map(tech => (
                        <Menu.Item
                          key={tech.id}
                          leftSection={
                            <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[8px] font-bold text-gray-600 dark:text-gray-400">
                              {tech.name.charAt(0)}
                            </div>
                          }
                          onClick={() => handleBulkAssign(tech.id)}
                        >
                          {tech.name}
                        </Menu.Item>
                      )) || []}
                    </Menu.Dropdown>
                  </Menu>

                  <button
                    onClick={handleBulkDeleteClick}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded text-[10px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={12} />
                    Delete
                  </button>

                  <button
                    onClick={() => setSelectedRecords([])}
                    className="p-1 text-primary-400 dark:text-primary-500 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded transition-colors"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Toggle and Content */}
          <ErrorBoundary>
            <div className="flex-1 flex flex-col overflow-hidden">


              {view === 'table' && (
                <div className="relative px-4">
                  <button
                    onClick={() => setColumnMenuOpened(!columnMenuOpened)}
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <HugeiconsIcon icon={LayoutTwoColumnIcon} size={12} />
                    <span>Columns</span>
                    <HugeiconsIcon icon={columnMenuOpened ? ArrowUp01Icon : ArrowDown01Icon} size={10} />
                  </button>

                  {columnMenuOpened && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setColumnMenuOpened(false)}
                      />

                      {/* Dropdown Menu */}
                      <div className="absolute right-4 top-full mt-1 z-20 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                            Show columns ({visibleColumns.length}/{MAX_VISIBLE_COLUMNS})
                          </p>
                        </div>

                        {/* Column List - Only show optional columns */}
                        <div className="max-h-56 overflow-y-auto py-0.5">
                          {OPTIONAL_COLUMNS.map(col => {
                            const isChecked = visibleColumns.includes(col.value);
                            const isDisabled = !isChecked && visibleColumns.length >= MAX_VISIBLE_COLUMNS;

                            return (
                              <button
                                key={col.value}
                                onClick={() => !isDisabled && toggleColumn(col.value)}
                                disabled={isDisabled}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-[10px] transition-colors ${isDisabled
                                  ? 'cursor-not-allowed opacity-50'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
                                  }`}
                              >
                                {/* Custom Checkbox */}
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${isChecked
                                  ? 'bg-primary-600 border-primary-600'
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                                  }`}>
                                  {isChecked && (
                                    <HugeiconsIcon icon={Tick01Icon} size={10} className="text-white" />
                                  )}
                                </div>

                                {/* Label */}
                                <span className={isChecked ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                                  {col.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Footer */}
                        <div className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={resetColumnsToDefault}
                            className="text-[10px] text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                          >
                            Reset to defaults
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}


              {/* Content Area - No overflow here, let children handle it */}
              <div className="flex-1 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 overscroll-y-contain">
                {view === 'table' && (
                  <EnhancedWorkOrderDataTable
                    workOrders={preset === 'active-loaners' ? processedWorkOrders.filter(wo => (wo as any).hasActiveLoaner ?? (wo as any).has_active_loaner) : processedWorkOrders}
                    technicians={technicians}
                    locations={locations}
                    customers={customers}
                    vehicles={vehicles}
                    profiles={profiles}
                    serviceCategories={serviceCategories}
                    onEdit={(wo) => { setEditingWorkOrder(wo); setIsFormDialogOpen(true); }}
                    onDelete={handleDeleteClick}
                    onUpdateWorkOrder={handleUpdateWorkOrder}
                    onViewDetails={handleViewDetails}
                    loading={isLoading}
                    visibleColumns={visibleColumns}
                    emergencyBikeAssignments={emergencyBikeAssignments}
                  />
                )}
                {view === 'map' && (
                  <div className="flex-1 p-4 min-h-[500px]">
                    <WorkOrdersMap
                      workOrders={processedWorkOrders}
                      locations={locations}
                      onWorkOrderClick={(workOrder) => handleViewDetails(workOrder.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          </ErrorBoundary>

          {/* Floating Action Button for Mobile */}
          {isMobile && (
            <div className="fixed bottom-20 right-4 z-30">
              <button
                onClick={onCreateNew}
                className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform active:scale-95"
                aria-label="Create Work Order"
              >
                <HugeiconsIcon icon={Add01Icon} size={24} />
              </button>
            </div>
          )}

          {/* Work Order Details Drawer */}
          <WorkOrderDetailsDrawer
            open={!!drawerWorkOrderId}
            onClose={() => {
              setDrawerWorkOrderId(null);
              isDrawerOpenRef.current = false;
            }}
            workOrderId={drawerWorkOrderId}
            onWorkOrderChange={(id) => setDrawerWorkOrderId(id)}
          />

          {/* Create Work Order Form Modal */}
          <CreateWorkOrderForm
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleConfirmDelete}
            title={workOrderToDelete ? "Delete Work Order" : "Delete Work Orders"}
            message={workOrderToDelete
              ? `Are you sure you want to delete work order ${workOrderToDelete.workOrderNumber || workOrderToDelete.id.substring(0, 8)}? This action cannot be undone.`
              : `Are you sure you want to delete ${selectedRecords.length} work orders? This action cannot be undone.`}
            itemName={workOrderToDelete ? (workOrderToDelete.workOrderNumber || "this work order") : `${selectedRecords.length} work orders`}
            isDeleting={isDeleting}
          />
        </Stack>
      </div >
    </ErrorBoundary >
  );
};

export default WorkOrdersPage;