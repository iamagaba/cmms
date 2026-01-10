import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  FilterIcon,
  Add01Icon,
  Car01Icon,
  ClipboardIcon,
  Motorbike01Icon,
  PencilEdit02Icon,
  Delete01Icon,
  Clock01Icon,
  TagIcon,
  MapsIcon
} from '@hugeicons/core-free-icons';
import { AssetDataTable } from "@/components/AssetDataTable";
import { AssetFormDialog } from "@/components/AssetFormDialog";
import { Vehicle, WorkOrder } from "@/types/supabase";
import { useAssetManagement } from "@/hooks/useAssetManagement";
import { Input } from "@/components/ui/enterprise";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { useDensity } from "@/context/DensityContext";
import { useDensitySpacing } from "@/hooks/useDensitySpacing";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { useEffect } from "react";
dayjs.extend(relativeTime);

const AssetsPage = () => {
  const navigate = useNavigate();
  const { isCompact } = useDensity();
  const spacing = useDensitySpacing();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Vehicle | null>(null);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    // State
    searchTerm, setSearchTerm,
    ageFilter, setAgeFilter,
    modelFilter, setModelFilter,
    productionDateFilter, setProductionDateFilter,
    statusFilter, setStatusFilter,
    healthFilter, setHealthFilter,
    customerTypeFilter, setCustomerTypeFilter,
    emergencyOnly, setEmergencyOnly,

    // Data
    vehicles, // Filtered vehicles
    allVehicles,
    // metrics,
    customers,
    locations,
    workOrders,
    availableModels,
    isLoading,

    // Actions
    handleClearFilters,
    saveAsset,
    deleteAsset
  } = useAssetManagement();

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);



  const handleSave = async (vehicleData: Partial<Vehicle>) => {
    try {
      await saveAsset(vehicleData);
      setIsDialogOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error("Failed to save asset:", error);
    }
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setAssetToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAsset(assetToDelete.id);
      if (selectedAsset?.id === assetToDelete.id) {
        setSelectedAsset(null);
      }
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error("Failed to delete asset:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleSelectAsset = (vehicle: Vehicle) => {
    setSelectedAsset(vehicle);
  };

  // Sync selectedAsset with updated data from vehicles list
  useEffect(() => {
    if (selectedAsset && vehicles) {
      const updatedAsset = vehicles.find(v => v.id === selectedAsset.id);
      if (updatedAsset && JSON.stringify(updatedAsset) !== JSON.stringify(selectedAsset)) {
        setSelectedAsset(updatedAsset);
      }
    }
  }, [vehicles, selectedAsset]);

  const hasActiveFilters = searchTerm || ageFilter !== 'all' || modelFilter !== 'all' || productionDateFilter !== 'all' || statusFilter !== 'all' || healthFilter !== 'all' || customerTypeFilter !== 'All' || emergencyOnly;

  // Fetch emergency assignments for this asset if it is an emergency bike
  const { data: emergencyAssignments } = useQuery({
    queryKey: ['asset-emergency-assignments', selectedAsset?.id],
    enabled: !!selectedAsset?.is_emergency_bike,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_bike_assignments')
        .select('work_order_id, assigned_at, returned_at')
        .eq('emergency_bike_asset_id', selectedAsset!.id);

      if (error) throw error;
      return data;
    },
  });

  // Compute actual asset status based on work orders
  const getComputedAssetStatus = (asset: Vehicle): string => {
    if (!asset) return 'Normal';

    // Check if there are any active work orders for this asset
    const assetWorkOrders = workOrders?.filter(wo => wo.vehicleId === asset.id) || [];
    const hasActiveWorkOrder = assetWorkOrders.some(wo =>
      wo.status === 'Open' ||
      wo.status === 'Confirmation' ||
      wo.status === 'Ready' ||
      wo.status === 'In Progress' ||
      wo.status === 'On Hold'
    );

    // If there are active work orders, status should be "In Repair"
    if (hasActiveWorkOrder) {
      return 'In Repair';
    }

    // If asset is marked as Decommissioned, keep that status
    if (asset.status === 'Decommissioned') {
      return 'Decommissioned';
    }

    // Otherwise, return Normal
    return 'Normal';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-white dark:bg-gray-950 overflow-hidden">
        {/* List Column */}
        <div className="w-80 flex-none border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Detail Column */}
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-950">
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] w-full bg-white dark:bg-gray-950 overflow-hidden">
      {/* List Column - Asset List */}
      <div className="w-56 flex-none border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header with Stat Ribbon */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          {/* Page Title */}
          <div className="px-3 py-2">
            <h1 className="text-sm font-bold font-brand text-gray-900 dark:text-gray-100">Assets</h1>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <HugeiconsIcon icon={Search01Icon} size={14} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Toggle */}
          <div className="px-3 pb-2 flex items-center justify-between">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ${filtersOpen || hasActiveFilters
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
            >
              <HugeiconsIcon icon={FilterIcon} size={12} />
              Filters
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full bg-primary-600 dark:bg-primary-500 text-white text-[9px] font-semibold">
                  {[searchTerm, ageFilter !== 'all', modelFilter !== 'all', productionDateFilter !== 'all', statusFilter !== 'all', healthFilter !== 'all', customerTypeFilter !== 'All', emergencyOnly].filter(Boolean).length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setEditingVehicle(null); setIsDialogOpen(true); }}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors"
            >
              <HugeiconsIcon icon={Add01Icon} size={12} />
              Add Asset
            </button>
          </div>

          {/* Advanced Filters */}
          {filtersOpen && (
            <div className="px-3 pb-2 border-t border-gray-100 dark:border-gray-800 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-7 w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-2 text-[10px]"
                  >
                    <option value="all">All</option>
                    <option value="Normal">Normal</option>
                    <option value="In Repair">In Repair</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">Age</label>
                  <select
                    value={ageFilter}
                    onChange={(e) => setAgeFilter(e.target.value)}
                    className="h-7 w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-2 text-[10px]"
                  >
                    <option value="all">All</option>
                    <option value="new">New (≤1yr)</option>
                    <option value="recent">Recent (1-3yr)</option>
                    <option value="mature">Mature (3-7yr)</option>
                    <option value="old">Old (&gt;7yr)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center pt-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emergencyOnly}
                    onChange={(e) => setEmergencyOnly(e.target.value === 'on' || e.target.checked)}
                    className="w-3.5 h-3.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                    Emergency Bikes Only
                  </span>
                </label>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline mt-1"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Asset List */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent overscroll-y-contain">
          {vehicles.length === 0 ? (
            <div className="empty-state p-4">
              <HugeiconsIcon icon={Car01Icon} size={32} className="empty-state-icon text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-0.5 text-center">No assets found</p>
              <p className="text-[10px] text-gray-500 text-center">
                {hasActiveFilters ? "Try adjusting your filters" : "Add your first asset to get started"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {vehicles.map((vehicle) => {
                const customer = customers?.find(c => c.id === vehicle.customer_id);
                const assetWorkOrders = workOrders?.filter(wo => wo.vehicleId === vehicle.id) || [];
                const isSelected = selectedAsset?.id === vehicle.id;

                return (
                  <div
                    key={vehicle.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                    onClick={() => handleSelectAsset(vehicle)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                          <HugeiconsIcon icon={Car01Icon} size={12} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold font-data text-gray-900 dark:text-gray-100">
                            {vehicle.license_plate || 'No License'}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {vehicle.make} {vehicle.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const computedStatus = getComputedAssetStatus(vehicle);
                          return (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${computedStatus === 'Normal' ? 'bg-industrial-50 dark:bg-industrial-900/30 text-industrial-700 dark:text-industrial-300 border-industrial-200 dark:border-industrial-800' :
                              computedStatus === 'In Repair' ? 'bg-maintenance-50 dark:bg-maintenance-900/30 text-maintenance-700 dark:text-maintenance-300 border-maintenance-200 dark:border-maintenance-800' :
                                'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                              }`}>
                              {computedStatus}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                      <span>{customer?.name || 'No Customer'}</span>
                      {assetWorkOrders.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <HugeiconsIcon icon={ClipboardIcon} size={10} />
                          {assetWorkOrders.length} WO{assetWorkOrders.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Column */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-950">
        {selectedAsset ? (
          <div className="flex flex-col h-full">
            <div className="flex-none px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-10">
              {/* Header: Title, Status, Actions */}
              {(() => {
                const computedStatus = getComputedAssetStatus(selectedAsset);
                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                        <HugeiconsIcon icon={Motorbike01Icon} size={16} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold font-data text-gray-900 dark:text-gray-100">
                            {selectedAsset.license_plate}
                          </h2>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${computedStatus === 'Normal' ? 'bg-industrial-50 text-industrial-700 border-industrial-200 dark:bg-industrial-900/20 dark:text-industrial-400 dark:border-industrial-800' :
                            computedStatus === 'In Repair' ? 'bg-maintenance-50 text-maintenance-700 border-maintenance-200 dark:bg-maintenance-900/20 dark:text-maintenance-400 dark:border-maintenance-800' :
                              'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                            }`}>
                            <span className={`w-1 h-1 rounded-full ${computedStatus === 'Normal' ? 'bg-industrial-500' :
                              computedStatus === 'In Repair' ? 'bg-maintenance-500' :
                                'bg-gray-500'
                              }`} />
                            {computedStatus}
                          </span>
                          {selectedAsset.is_emergency_bike && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                              <span className="w-1 h-1 rounded-full bg-blue-500" />
                              Emergency
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedAsset.make && selectedAsset.model ? `${selectedAsset.make} ${selectedAsset.model}` : 'Unknown Model'}
                          {selectedAsset.year && ` (${selectedAsset.year})`}
                          {' • '}
                          {(() => {
                            const customer = customers?.find(c => c.id === selectedAsset.customer_id);
                            return customer?.name || 'No Customer';
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(selectedAsset)}
                        className="px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <HugeiconsIcon icon={PencilEdit02Icon} size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(selectedAsset)}
                        className="px-2.5 py-1 text-xs font-medium text-error-600 dark:text-error-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-error-50 dark:hover:bg-error-900/20 rounded shadow-sm transition-colors flex items-center gap-1.5">
                        <HugeiconsIcon icon={Delete01Icon} size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent overscroll-y-contain">

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {(() => {
                  const assetWorkOrders = workOrders?.filter(wo => wo.vehicleId === selectedAsset.id) || [];
                  const openWorkOrders = assetWorkOrders.filter(wo => wo.status === 'Open' || wo.status === 'In Progress' || wo.status === 'Ready').length;
                  const warrantyActive = selectedAsset.warranty_end_date && dayjs(selectedAsset.warranty_end_date).isAfter(dayjs());

                  return (
                    <>
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Total WOs</p>
                            <p className="text-lg font-bold font-data text-gray-900 dark:text-gray-100 mt-0.5">{assetWorkOrders.length}</p>
                          </div>
                          <div className="w-6 h-6 rounded bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                            <HugeiconsIcon icon={ClipboardIcon} size={12} className="text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Open WOs</p>
                            <p className="text-lg font-bold font-data text-gray-900 dark:text-gray-100 mt-0.5">{openWorkOrders}</p>
                          </div>
                          <div className="w-6 h-6 rounded bg-maintenance-50 dark:bg-maintenance-900/30 flex items-center justify-center">
                            <HugeiconsIcon icon={Clock01Icon} size={12} className="text-maintenance-600 dark:text-maintenance-400" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Downtime</p>
                            <div className="mt-0.5">
                              {(() => {
                                const totalMinutes = assetWorkOrders.reduce((acc, wo) => {
                                  // Only count downtime for In Progress or Completed work orders
                                  if (wo.status === 'Completed' || wo.status === 'In Progress') {
                                    // Check both camelCase (from fetch) and snake_case (fallback) to be safe
                                    const start = (wo as any).workStartedAt ? dayjs((wo as any).workStartedAt) :
                                      (wo.work_started_at ? dayjs(wo.work_started_at) :
                                        ((wo as any).createdAt ? dayjs((wo as any).createdAt) : dayjs(wo.created_at)));
                                    const end = wo.completedAt ? dayjs(wo.completedAt) : dayjs();
                                    return acc + end.diff(start, 'minute');
                                  }
                                  return acc;
                                }, 0);

                                const hours = Math.floor(totalMinutes / 60);
                                const days = Math.floor(hours / 24);
                                const remainingHours = hours % 24;

                                return (
                                  <p className="text-lg font-bold font-data text-gray-900 dark:text-gray-100">
                                    {days > 0 ? `${days}d ${remainingHours}h` : `${hours}h`}
                                  </p>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded bg-error-50 dark:bg-error-900/30 flex items-center justify-center">
                            <HugeiconsIcon icon={Clock01Icon} size={12} className="text-error-600 dark:text-error-400" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Repair Cost</p>
                            <p className="text-lg font-bold font-data text-gray-900 dark:text-gray-100 mt-0.5">
                              {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(
                                assetWorkOrders.reduce((sum, wo) => sum + ((wo as any).cost || 0), 0)
                              )}
                            </p>
                          </div>
                          <div className="w-6 h-6 rounded bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                            <HugeiconsIcon icon={TagIcon} size={12} className="text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Asset Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div>
                  <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Basic Information</h3>
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="p-2.5">
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">License Plate</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5 font-bold font-data">{selectedAsset.license_plate || 'Not specified'}</p>
                    </div>
                    <div className="p-2.5">
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Make & Model</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{selectedAsset.make} {selectedAsset.model}</p>
                    </div>
                    <div className="p-2.5">
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Year</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{selectedAsset.year || 'Unknown'}</p>
                    </div>
                    {/* Add Mileage Section */}
                    <div className="p-2.5">
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Mileage</label>
                      <p className="text-xs font-bold font-data text-gray-900 dark:text-gray-100">
                        {selectedAsset.current_mileage?.toLocaleString() || '0'} km
                      </p>
                    </div>
                    <div className="p-2.5">
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Ownership Type</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">
                        {selectedAsset.is_company_asset ? 'Company Asset' : 'Individual Asset'}
                      </p>
                    </div>
                    <div className="p-2.5">
                      <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Date Added</label>
                      <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">
                        {selectedAsset.created_at ? new Date(selectedAsset.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Customer Information</h3>
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md divide-y divide-gray-100 dark:divide-gray-800">
                    {(() => {
                      const customer = customers?.find(c => c.id === selectedAsset.customer_id);
                      return customer ? (
                        <>
                          <div className="p-2.5">
                            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Customer Name</label>
                            <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5 font-medium">{customer.name}</p>
                          </div>
                          <div className="p-2.5">
                            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Email</label>
                            <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{customer.email || 'Not provided'}</p>
                          </div>
                          <div className="p-2.5">
                            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Phone</label>
                            <p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">{customer.phone || 'Not provided'}</p>
                          </div>
                        </>
                      ) : (
                        <div className="p-2.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">No customer assigned</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Work Orders */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Work Orders</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {workOrders?.filter(wo => wo.vehicleId === selectedAsset.id).length || 0} total
                    </span>
                    <button
                      onClick={() => navigate(`/work-orders/new?vehicleId=${selectedAsset.id}`)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors"
                    >
                      <HugeiconsIcon icon={Add01Icon} size={10} />
                      New
                    </button>
                  </div>
                </div>

                {(() => {
                  const assetWorkOrders = workOrders?.filter(wo => {
                    // Direct matches (asset is the primary vehicle)
                    if (wo.vehicleId === selectedAsset?.id) return true;

                    // Emergency assignments (asset was assigned as emergency bike)
                    if (selectedAsset?.is_emergency_bike && emergencyAssignments) {
                      return emergencyAssignments.some(a => a.work_order_id === wo.id);
                    }

                    return false;
                  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

                  return assetWorkOrders.length > 0 ? (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="text-[10px] text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                              <th className="px-3 py-2 font-medium">Work Order</th>
                              <th className="px-3 py-2 font-medium">Summary</th>
                              <th className="px-3 py-2 font-medium">Status</th>
                              <th className="px-3 py-2 font-medium">Location</th>
                              <th className="px-3 py-2 font-medium text-right">Created</th>
                              <th className="px-3 py-2 font-medium text-right">Priority</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {assetWorkOrders.slice(0, 10).map((workOrder) => {
                              const locationName = locations?.find(l => l.id === workOrder.locationId)?.name || 'Unknown';

                              return (
                                <tr
                                  key={workOrder.id}
                                  className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors cursor-pointer group"
                                  onClick={() => setSelectedWorkOrderId(workOrder.id)}
                                >
                                  <td className="px-3 py-2 font-bold font-data text-gray-900 dark:text-gray-100">
                                    {workOrder.workOrderNumber || `WO-${workOrder.id.substring(0, 6).toUpperCase()}`}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                                    {workOrder.description || workOrder.service || 'General Service'}
                                  </td>
                                  <td className="px-3 py-2">
                                    {(() => {
                                      const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
                                        'Open': { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
                                        'Confirmation': { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
                                        'On Hold': { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
                                        'Ready': { bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
                                        'In Progress': { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
                                        'Completed': { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
                                        'Cancelled': { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
                                      };
                                      const config = statusColors[workOrder.status || 'Open'] || statusColors['Open'];
                                      return (
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border border-current/20 ${config.bg} ${config.text}`}>
                                          <span className={`w-1 h-1 rounded-full ${config.dot}`} />
                                          {workOrder.status}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <HugeiconsIcon icon={MapsIcon} size={10} className="text-gray-400" />
                                      {locationName}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {dayjs(workOrder.created_at).fromNow()}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {workOrder.priority && (
                                      <span className={`inline-block px-1 py-0.5 rounded text-[9px] font-medium border ${workOrder.priority === 'Critical' ? 'bg-error-50 text-error-700 border-error-100 dark:bg-error-900/20 dark:text-error-400 dark:border-error-900/30' :
                                        workOrder.priority === 'High' ? 'bg-maintenance-50 text-maintenance-700 border-maintenance-100 dark:bg-maintenance-900/20 dark:text-maintenance-400 dark:border-maintenance-900/30' :
                                          'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                        }`}>
                                        {workOrder.priority}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {assetWorkOrders.length > 10 && (
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 text-center border-t border-gray-200 dark:border-gray-800">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            View {assetWorkOrders.length - 10} more work orders
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6">
                      <div className="text-center">
                        <div className="mx-auto w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                          <HugeiconsIcon icon={ClipboardIcon} size={18} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-0.5">No work orders</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">This asset has no work order history</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HugeiconsIcon icon={Car01Icon} size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5">Select an Asset</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose an asset from the list to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Asset Form Dialog */}
      {isDialogOpen && (
        <AssetFormDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          vehicle={editingVehicle}
          customers={customers || []}
        />
      )}

      {/* Work Order Details Drawer */}
      <WorkOrderDetailsDrawer
        open={!!selectedWorkOrderId}
        onClose={() => setSelectedWorkOrderId(null)}
        workOrderId={selectedWorkOrderId}
        onWorkOrderChange={(id) => setSelectedWorkOrderId(id)}
      />
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        itemName={assetToDelete ? `${assetToDelete.license_plate} (${assetToDelete.make} ${assetToDelete.model})` : undefined}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AssetsPage;