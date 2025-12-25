import * as React from "react";
import { ModernWorkOrderDataTable } from "./tables/ModernWorkOrderDataTable";
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from "@/types/supabase";

interface WorkOrderDataTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
  customers: Customer[];
  vehicles: Vehicle[];
  profiles: Profile[];
  onEdit: (workOrderData: WorkOrder) => void;
  onDelete: (workOrderData: WorkOrder) => void;
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onViewDetails: (workOrderId: string) => void;
  visibleColumns?: string[];
  onVisibleColumnsChange?: (columns: string[]) => void;
  selectedRecords?: any[];
  onSelectedRecordsChange?: (records: any[]) => void;
  onBulkAssign?: (workOrderIds: string[], technicianId: string) => void;
  enableStickySummary?: boolean;
  virtualized?: boolean;
  searchTerm?: string;
  loading?: boolean;
  error?: string;
}

export function WorkOrderDataTable({ 
  workOrders, 
  technicians, 
  locations, 
  customers, 
  vehicles, 
  profiles, 
  onEdit, 
  onDelete, 
  onUpdateWorkOrder, 
  onViewDetails, 
  visibleColumns = [],
  selectedRecords = [],
  onSelectedRecordsChange,
  onBulkAssign,
  enableStickySummary = true,
  virtualized = false,
  searchTerm = '',
  loading = false,
  error
}: WorkOrderDataTableProps) {
  // Use the new modern table component
  return (
    <ModernWorkOrderDataTable
      workOrders={workOrders}
      technicians={technicians}
      locations={locations}
      customers={customers}
      vehicles={vehicles}
      profiles={profiles}
      onEdit={onEdit}
      onDelete={onDelete}
      onUpdateWorkOrder={onUpdateWorkOrder}
      onViewDetails={onViewDetails}
      loading={loading}
      error={error}
      enableBulkActions={enableStickySummary}
      enableAdvancedFilters={true}
      enableExport={true}
      compactMode={virtualized}
    />
  );
}