import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Fragment } from 'react';
import {
  Car,
  User,
  Plus,
  RefreshCw,
  Download,
  Filter,
  X,
  Search,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  List,
  MapPin,
  Check,
  Clock,
  Pause,
  AlertCircle,
  Menu,
  FilterX,
  UserPlus,
  Columns,
  Bell,
  ClipboardList,
  Calendar,
  Settings,
  Lock,
  LayoutGrid,
  RotateCcw
} from 'lucide-react';



// shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkOrdersSkeleton } from "@/components/skeletons/WorkOrdersSkeleton";

import { useDisclosure, useMediaQuery } from '@/hooks/tailwind';
import { EnhancedWorkOrderDataTable } from "@/components/EnhancedWorkOrderDataTable";
import { REQUIRED_COLUMNS, OPTIONAL_COLUMNS, ALL_COLUMNS } from "@/components/work-order-columns-constants";
import { WorkOrderDetailsDrawer } from "@/components/WorkOrderDetailsDrawer";
import { CreateWorkOrderForm } from "@/components/work-orders/CreateWorkOrderForm";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { WorkOrderStatusBar } from "@/components/work-orders/WorkOrderStatusBar";


// Utility functions
import ErrorBoundary from "@/components/ErrorBoundary";

import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';

import {
  useWorkOrderData,
} from "@/hooks/useWorkOrderData";
import { useWorkOrderSearch } from "@/hooks/useWorkOrderSearch";
import { useWorkOrderMutations } from "@/hooks/useWorkOrderMutations";
import { useWorkOrderFilters } from "@/hooks/useWorkOrderFilters";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useNotifications } from '@/hooks/useNotifications';
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { WorkOrder } from "@/types/supabase";
import { getWorkOrderNumber } from '@/utils/work-order-display';
import { WorkOrdersMap } from "@/components/maps/WorkOrdersMap";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fix import if file exists, otherwise comment out or remove if verified unused
// import WorkOrderProgressTimeline from "@/components/WorkOrderProgressTimeline";
import { WorkOrderTimeline, useWorkOrderTimeline } from "@/components/work-order-timeline";

const WorkOrderTimelineWrapper = ({ workOrders, vehicles, onWorkOrderClick, isLoading }: { workOrders: WorkOrder[], vehicles?: any[], onWorkOrderClick: (wo: any) => void, isLoading?: boolean }) => {
  // Shared currentTime state - ensures hook and component use the same time reference
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update currentTime every second for accurate synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for accuracy
    return () => clearInterval(timer);
  }, []);

  // Pass currentTime to the hook so bar positions match the "Now" line
  const timelineData = useWorkOrderTimeline(workOrders, vehicles, currentTime);
  return <WorkOrderTimeline workOrders={timelineData} onWorkOrderClick={onWorkOrderClick} className="h-full" isLoading={isLoading} externalCurrentTime={currentTime} />;
};

dayjs.extend(isBetween);
dayjs.extend(relativeTime);

type WorkOrderView = 'table' | 'map' | 'timeline';

// Enhanced status and priority configurations
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/config/status';

// Helper component for multi-select filters using shadcn
const FilterMultiSelect = ({ label, value, onChange, options, placeholder, className }: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (optionValue: string) => {
    const isSelected = value.includes(optionValue);
    if (isSelected) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className={`space-y-1 ${className || ''}`}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between h-7 text-xs"
          >
            <span className="truncate">
              {value.length === 0 ? placeholder || 'Select' : `${value.length} selected`}
            </span>
            <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className="flex items-center space-x-2 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                handleSelect(option.value);
              }}
            >
              <Checkbox
                checked={value.includes(option.value)}
                onChange={() => handleSelect(option.value)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs">{option.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

interface WorkOrdersPageProps {
  readOnly?: boolean;
}

const WorkOrdersPage: React.FC<WorkOrdersPageProps> = ({ readOnly = false }) => {
  // Feature flag for scalable search (can be controlled via localStorage or environment variable)
  const [useScalableSearch, setUseScalableSearch] = useState(() => {
    // Check localStorage for feature flag
    const stored = localStorage.getItem('useScalableSearch');
    // Default to true for new users, or respect stored preference
    return stored !== null ? stored === 'true' : true;
  });

  // Component state
  const [view, setView] = useState<WorkOrderView>('table');
  const isMobile = useMediaQuery('(max-width: 768px)');


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

  // Pagination state for scalable search
  const [page, setPage] = useState(0);
  const [pageSize] = useState(25);

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
    const defaultOptional = ['priority', 'technician', 'createdAt'];
    if (saved) {
      const parsed = JSON.parse(saved).filter((col: string) => col !== 'actions');
      // Ensure required columns are always included
      const withRequired = [...new Set([...REQUIRED_COLUMNS, ...parsed])];
      return withRequired;
    }
    return [...REQUIRED_COLUMNS, ...defaultOptional];
  });

  // Column order state
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('workOrderColumnOrder');
    if (saved) {
      return JSON.parse(saved);
    }
    return OPTIONAL_COLUMNS.map(col => col.value);
  });

  // Column selector menu state
  const [columnMenuOpened, setColumnMenuOpened] = useState(false);

  // Drag state
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  // Save visible columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workOrderVisibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Save column order to localStorage
  useEffect(() => {
    localStorage.setItem('workOrderColumnOrder', JSON.stringify(columnOrder));
  }, [columnOrder]);

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

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, columnValue: string) => {
    setDraggedColumn(columnValue);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumn) return;

    setColumnOrder(prev => {
      const newOrder = [...prev];
      const draggedIndex = newOrder.indexOf(draggedColumn);
      const targetIndex = newOrder.indexOf(targetColumn);

      // Remove dragged item and insert at target position
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumn);

      return newOrder;
    });

    setDraggedColumn(null);
  };

  // Reset columns to default
  const resetColumnsToDefault = () => {
    const defaultOptional = ['priority', 'technician', 'createdAt'];
    setVisibleColumns([...REQUIRED_COLUMNS, ...defaultOptional]);
    setColumnOrder(OPTIONAL_COLUMNS.map(col => col.value));
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
    refetch: refetchWorkOrders
  } = useWorkOrderData();

  // Server-side search hook (scalable approach)
  const {
    data: searchResult,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch
  } = useWorkOrderSearch({
    searchQuery: useScalableSearch ? debouncedSearchQuery : '',
    statusFilter: useScalableSearch ? statusFilter : [],
    priorityFilter: useScalableSearch ? priorityFilter : [],
    technicianFilter: useScalableSearch ? technicianFilter : [],
    locationFilter: useScalableSearch ? locationFilter : [],
    page: useScalableSearch ? page : 0,
    pageSize: useScalableSearch ? pageSize : 50,
    enabled: useScalableSearch,
  });

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
  // ⚠️ SCALABILITY WARNING: This client-side filtering approach will not scale beyond ~10k records
  // For production use with large datasets, see:
  // - SCALABILITY_SOLUTION_SUMMARY.md
  // - src/hooks/useWorkOrderSearch.ts (server-side search)
  // - src/pages/WorkOrdersScalable.tsx (scalable implementation)
  const processedWorkOrders = useMemo(() => {
    // Use server-side search results if enabled
    if (useScalableSearch && searchResult) {
      return searchResult.workOrders;
    }

    // Fall back to client-side filtering (legacy approach)
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
  }, [useScalableSearch, searchResult, filteredWorkOrders, debouncedSearchQuery, statusFilter, priorityFilter, technicianFilter, locationFilter, vehicles, customers, technicians, locations]);



  // Update search history with result count when search results change
  useEffect(() => {
    if (vehicleFilter.trim() && processedWorkOrders) {
      addToSearchHistory(vehicleFilter.trim(), processedWorkOrders.length);
    }
  }, [vehicleFilter, processedWorkOrders?.length, addToSearchHistory]);

  // Reset to page 0 when filters change (for scalable search)
  useEffect(() => {
    if (useScalableSearch) {
      setPage(0);
    }
  }, [useScalableSearch, debouncedSearchQuery, statusFilter, priorityFilter, technicianFilter, locationFilter]);

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
      // Manually refresh data to update UI
      if (useScalableSearch) {
        await refetchSearch();
      } else {
        await refetchWorkOrders();
      }

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
        getWorkOrderNumber(wo),
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
    setPage(0); // Reset pagination
  }, [setVehicleFilter]);

  // Pagination handlers for scalable search
  const handleNextPage = () => {
    if (useScalableSearch && searchResult?.hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (useScalableSearch && page > 0) {
      setPage(prev => prev - 1);
    }
  };

  const totalCount = useScalableSearch ? (searchResult?.totalCount || 0) : processedWorkOrders.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPageDisplay = page + 1;

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





  if (error || (useScalableSearch && searchError)) {
    const displayError = error || searchError;
    return (
      <div className="w-full px-4 py-4 bg-background min-h-screen">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-base mb-2">Error Loading Work Orders</CardTitle>
            <CardDescription className="mb-3 max-w-md text-xs">
              {(displayError as any).message || 'An unexpected error occurred while loading work orders.'}
            </CardDescription>
            <Button onClick={() => useScalableSearch ? refetchSearch() : refetchWorkOrders()} className="gap-1.5 h-8 text-xs">
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || (useScalableSearch && isSearching && page === 0)) {
    return <WorkOrdersSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden gap-4">
          <div className="flex-none px-4 pt-4 pb-2 space-y-4">


            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center p-0.5 bg-muted rounded-md border border-border">
                <Button
                  variant={view === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('table')}
                  className="gap-1.5 px-2 h-7 text-xs"
                >
                  <List className="w-3.5 h-3.5" />
                  Table
                </Button>
                <Button
                  variant={view === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('map')}
                  className="gap-1.5 px-2 h-7 text-xs"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Map
                </Button>
                <Button
                  variant={view === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('timeline')}
                  className="gap-1.5 px-2 h-7 text-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Timeline
                </Button>

              </div>

              <div className="flex-1" />

              {/* Search Bar */}
              {view === 'table' && (
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by license plate, work order, technician..."
                    aria-label="Search work orders"
                    className="w-full pl-7 pr-7 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 w-7 p-0 hover:bg-transparent"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  )}
                </div>
              )}

              {view === 'table' && !readOnly && (
                <Button onClick={onCreateNew} size="sm" className="gap-1.5 h-7 text-xs ml-auto">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isMobile ? 'New' : 'Create'}</span>
                </Button>
              )}
            </div>

            {/* Search and Columns Row - Only show in table view */}

          </div>

          {/* Status Bar - Visual summary of work order distribution */}
          {view === 'table' && (
            <div className="mx-4">
              <WorkOrderStatusBar workOrders={allWorkOrders || []} />
            </div>
          )}

          {/* Quick Status Tabs with Pagination and Column Selector */}
          <div className="mx-4 mt-2 border-b border-border flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-3 overflow-x-auto scrollbar-none">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter([])}
                className={`pb-2 h-auto text-sm font-medium whitespace-nowrap transition-colors relative border-b-2 rounded-none ${statusFilter.length === 0
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
                  }`}
              >
                <span>All</span>
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-lg text-xs font-semibold ${statusFilter.length === 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {allWorkOrders?.length || 0}
                </span>
              </Button>
              {['New', 'Confirmation', 'Ready', 'In Progress', 'Completed', 'On Hold'].map((status) => {
                const isActive = statusFilter.length === 1 && statusFilter[0] === status;
                const count = allWorkOrders?.filter(wo => wo.status === status).length || 0;
                return (
                  <Button
                    key={status}
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter([status])}
                    className={`pb-2 h-auto text-sm font-medium whitespace-nowrap transition-colors relative border-b-2 rounded-none ${isActive
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                      }`}
                  >
                    <span>{status}</span>
                    <span className={`ml-0.5 px-1.5 py-0.5 rounded-lg text-xs font-semibold ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {count}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Right side controls: Clear filters, Column Selector, Pagination */}
            <div className="flex items-center gap-2 pb-2">
              {(statusFilter.length > 0 || priorityFilter.length > 0 || technicianFilter.length > 0 || locationFilter.length > 0 || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline whitespace-nowrap h-auto"
                >
                  Clear all
                </Button>
              )}

              {/* Column Selector - Icon Only */}
              {view === 'table' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <Columns className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    {/* Header */}
                    <div className="px-3 py-2.5 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-foreground">Customize Columns</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {visibleColumns.length} of {MAX_VISIBLE_COLUMNS} selected
                          </p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Settings className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Optional Columns Section */}
                    <div className="px-2 py-2">
                      <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {columnOrder.map((colValue) => {
                          const col = OPTIONAL_COLUMNS.find(c => c.value === colValue);
                          if (!col) return null;

                          const isChecked = visibleColumns.includes(col.value);
                          const isDisabled = !isChecked && visibleColumns.length >= MAX_VISIBLE_COLUMNS;
                          const isDragging = draggedColumn === col.value;

                          return (
                            <div
                              key={col.value}
                              draggable
                              onDragStart={(e) => handleDragStart(e, col.value)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, col.value)}
                              className={`flex items-center gap-2 cursor-move px-2 py-1.5 rounded-md transition-all ${isChecked ? 'bg-muted/30' : ''
                                } ${isDisabled ? 'opacity-40' : ''} ${isDragging ? 'opacity-50' : ''
                                }`}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!isDisabled) toggleColumn(col.value);
                              }}
                            >
                              <Menu className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                              <div className="h-3.5 w-3.5 rounded border-2 border-muted-foreground/30 bg-muted flex items-center justify-center flex-shrink-0">
                                {isChecked && <Check className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2} />}
                              </div>
                              <span className="text-xs text-muted-foreground flex-1">{col.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Reset Button */}
                    <div className="p-2">
                      <DropdownMenuItem
                        onSelect={resetColumnsToDefault}
                        className="cursor-pointer px-2 py-1.5 rounded-md hover:bg-primary/5"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <RotateCcw className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs text-primary font-medium">Reset to default</span>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Pagination Controls */}
              {view === 'table' && useScalableSearch && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={page === 0 || isSearching}
                    className="gap-1 h-7 text-xs"
                  >
                    <ChevronUp className="w-3.5 h-3.5 rotate-[-90deg]" />
                    Prev
                  </Button>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Page {currentPageDisplay} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!searchResult?.hasMore || isSearching}
                    className="gap-1 h-7 text-xs"
                  >
                    Next
                    <ChevronDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedRecords.length > 0 && (
            <div className="mx-4 bg-accent border border-border rounded-md p-2 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-muted flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium">
                    {selectedRecords.length} work order{selectedRecords.length !== 1 ? 's' : ''} selected
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1 h-6 px-2 text-xs">
                        <CheckCircle className="w-4 h-4" />
                        Status
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {statusOptions.map(option => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => handleBulkStatusUpdate(option.value)}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          {React.createElement(STATUS_CONFIG[option.value as keyof typeof STATUS_CONFIG]?.icon, { className: "w-4 h-4" })}
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1 h-6 px-2 text-xs">
                        <UserPlus className="w-4 h-4" />
                        Assign
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
                      {technicians?.map(tech => (
                        <DropdownMenuItem
                          key={tech.id}
                          onClick={() => handleBulkAssign(tech.id)}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <div className="w-4 h-4 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {tech.name.charAt(0)}
                          </div>
                          {tech.name}
                        </DropdownMenuItem>
                      )) || []}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDeleteClick}
                    className="gap-1 h-6 px-2 text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecords([])}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* View Toggle and Content */}
          <ErrorBoundary>
            <div className="flex-1 flex flex-col overflow-hidden">


              {/* Table View Content is handled below */}


              {/* Content Area - No overflow here, let children handle it */}
              <div className="flex-1 min-h-0 px-4 overscroll-y-contain flex flex-col">
                {view === 'table' && (
                  <div className="flex-1 min-h-0 flex flex-col gap-2">
                    {/* Table */}
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
                      visibleColumns={visibleColumns}
                      columnOrder={columnOrder}
                      emergencyBikeAssignments={emergencyBikeAssignments}
                    />
                  </div>
                )}
                {view === 'map' && (
                  <div className="flex-1 h-full">
                    <WorkOrdersMap
                      workOrders={processedWorkOrders}
                      locations={locations}
                      vehicles={vehicles}
                      serviceCategories={serviceCategories}
                      onWorkOrderClick={(workOrder) => handleViewDetails(workOrder.id)}
                    />
                  </div>
                )}
                {view === 'timeline' && (
                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <WorkOrderTimelineWrapper
                      workOrders={processedWorkOrders}
                      vehicles={vehicles}
                      onWorkOrderClick={(wo) => handleViewDetails(wo.id)}
                      isLoading={isLoading}
                    />
                  </div>
                )}

              </div>
            </div>
          </ErrorBoundary>

          {/* Floating Action Button for Mobile */}
          {isMobile && (
            <div className="fixed bottom-20 right-4 z-30">
              <Button
                onClick={onCreateNew}
                size="sm"
                className="h-11 w-11 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
                aria-label="Create Work Order"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Work Order Details Drawer */}
          <WorkOrderDetailsDrawer
            open={!!drawerWorkOrderId && isDrawerOpenRef.current}
            onClose={() => {
              setDrawerWorkOrderId(null);
              isDrawerOpenRef.current = false;
            }}
            workOrderId={drawerWorkOrderId}
            readOnly={readOnly}
            onWorkOrderChange={(id) => {
              // If ID changes (e.g. via Related History), update the drawer ID
              // We need to close and reopen to trigger proper data fetching if using 'enabled'
              setDrawerWorkOrderId(id);
            }}
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
              ? `Are you sure you want to delete work order ${getWorkOrderNumber(workOrderToDelete)}? This action cannot be undone.`
              : `Are you sure you want to delete ${selectedRecords.length} work orders? This action cannot be undone.`}
            itemName={workOrderToDelete ? getWorkOrderNumber(workOrderToDelete) : `${selectedRecords.length} work orders`}
            isDeleting={isDeleting}
          />
        </div>
      </div >
    </ErrorBoundary >
  );
};

export default WorkOrdersPage;

