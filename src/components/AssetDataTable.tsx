import * as React from "react";
import { ModernAssetDataTable } from './tables/ModernAssetDataTable';
import { Vehicle, Customer, Location, WorkOrder } from "@/types/supabase";

export type AssetRow = Vehicle & {
  customer?: Customer;
};

interface AssetDataTableProps {
  vehicles: Vehicle[];
  customers: Customer[];
  locations?: Location[];
  workOrders?: WorkOrder[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onViewDetails?: (vehicleId: string) => void;
  onScheduleMaintenance?: (vehicle: Vehicle) => void;
  onCreateWorkOrder?: (vehicle: Vehicle) => void;
  loading?: boolean;
}

export function AssetDataTable({ 
  vehicles, 
  customers, 
  locations = [], 
  workOrders = [], 
  onEdit, 
  onDelete, 
  onViewDetails,
  onScheduleMaintenance,
  onCreateWorkOrder,
  loading = false 
}: AssetDataTableProps) {
  const handleViewDetails = (assetId: string) => {
    if (onViewDetails) {
      onViewDetails(assetId);
    } else {
      // Fallback to navigation if no custom handler provided
      window.location.href = `/assets/${assetId}`;
    }
  };

  // Use the new modern table component with enhanced features
  return (
    <ModernAssetDataTable
      assets={vehicles}
      locations={locations}
      customers={customers}
      workOrders={workOrders}
      onEdit={onEdit}
      onDelete={onDelete}
      onViewDetails={handleViewDetails}
      onScheduleMaintenance={onScheduleMaintenance}
      onCreateWorkOrder={onCreateWorkOrder}
      loading={loading}
      enableBulkActions={true}
      enableAdvancedFilters={true}
      enableExport={true}
      compactMode={false}
    />
  );
}