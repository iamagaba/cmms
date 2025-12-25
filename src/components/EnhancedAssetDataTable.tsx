import React from 'react';
import { ModernAssetDataTable } from './tables/ModernAssetDataTable';
import { Vehicle as Asset, Location, Customer, WorkOrder } from '@/types/supabase';

interface EnhancedAssetDataTableProps {
  assets: Asset[];
  locations: Location[];
  customers: Customer[];
  workOrders: WorkOrder[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onViewDetails: (assetId: string) => void;
  onScheduleMaintenance?: (asset: Asset) => void;
  onCreateWorkOrder?: (asset: Asset) => void;
  loading?: boolean;
}

export function EnhancedAssetDataTable({
  assets,
  locations,
  customers,
  workOrders,
  onEdit,
  onDelete,
  onViewDetails,
  onScheduleMaintenance,
  onCreateWorkOrder,
  loading = false,
}: EnhancedAssetDataTableProps) {
  // Use the new modern table component with enhanced features
  return (
    <ModernAssetDataTable
      assets={assets}
      locations={locations}
      customers={customers}
      workOrders={workOrders}
      onEdit={onEdit}
      onDelete={onDelete}
      onViewDetails={onViewDetails}
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

