import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  FilterHorizontalIcon,
  Add01Icon,
  Car01Icon,
  ClipboardIcon,
  Motorbike01Icon,
  Edit01Icon,
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

dayjs.extend(relativeTime);

const AssetsPage = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Vehicle | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
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

  // ... exisiting code ...

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

  const hasActiveFilters = searchTerm || ageFilter !== 'all' || modelFilter !== 'all' || productionDateFilter !== 'all' || statusFilter !== 'all' || healthFilter !== 'all' || customerTypeFilter !== 'all';

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
    <div className="flex h-screen w-full bg-white dark:bg-gray-950 overflow-hidden">
      {/* List Column - Asset List */}
      <div className="w-80 flex-none border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header with Stat Ribbon */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          {/* Page Title */}
          <div className="p-4 pb-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assets</h1>
          </div>

          {/* Search */}
          <div className="p-4 pt-3">
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<HugeiconsIcon icon={Search01Icon} size={14} className="text-gray-400" />}
            />
          </div>

          {/* Filters Toggle */}
          <div className="px-4 pb-3 flex items-center justify-between">
            <button
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${filtersOpen || hasActiveFilters
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
            >
              <HugeiconsIcon icon={FilterHorizontalIcon} size={14} />
              Filters
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary-600 dark:bg-primary-500 text-white text-[10px] font-semibold">
                  {[searchTerm, ageFilter !== 'all', modelFilter !== 'all', productionDateFilter !== 'all', statusFilter !== 'all', healthFilter !== 'all', customerTypeFilter !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setEditingVehicle(null); setIsDialogOpen(true); }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} />
              Add Asset
            </button>
          </div>

          {/* Advanced Filters */}
          {filtersOpen && (
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-2.5 py-1 text-xs"
                  >
                    <option value="all">All</option>
                    <option value="Normal">Normal</option>
                    <option value="In Repair">In Repair</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                  <select
                    value={ageFilter}
                    onChange={(e) => setAgeFilter(e.target.value)}
                    className="h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-2.5 py-1 text-xs"
                  >
                    <option value="all">All</option>
                    <option value="new">New (≤1yr)</option>
                    <option value="recent">Recent (1-3yr)</option>
                    <option value="mature">Mature (3-7yr)</option>
                    <option value="old">Old (&gt;7yr)</option>
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Asset List */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {vehicles.length === 0 ? (
            <div className="empty-state">
              <HugeiconsIcon icon={Car01Icon} size={48} className="empty-state-icon text-gray-300" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No assets found</p>
              <p className="empty-state-text">
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
                    className={`list-row cursor-pointer ${isSelected ? 'list-row-active' : ''}`}
                    onClick={() => handleSelectAsset(vehicle)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                          <HugeiconsIcon icon={Car01Icon} size={16} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {vehicle.license_plate || 'No License'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {vehicle.make} {vehicle.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const computedStatus = getComputedAssetStatus(vehicle);
                          return (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${computedStatus === 'Normal' ? 'bg-industrial-50 dark:bg-industrial-900/30 text-industrial-700 dark:text-industrial-300 border-industrial-200 dark:border-industrial-800' :
                          computedStatus === 'In Repair' ? 'bg-maintenance-50 dark:bg-maintenance-900/30 text-maintenance-700 dark:text-maintenance-300 border-maintenance-200 dark:border-maintenance-800' :
                            'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                          }`}>
                          {computedStatus}
                        </span>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{customer?.name || 'No Customer'}</span>
                      {assetWorkOrders.length > 0 && (
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={ClipboardIcon} size={12} />
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
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-950 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {selectedAsset ? (
          <div className="p-6">
            {/* Header: Title, Status, Actions */}
            {(() => {
              const computedStatus = getComputedAssetStatus(selectedAsset);
              return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <HugeiconsIcon icon={Motorbike01Icon} size={24} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedAsset.license_plate}
                    </h2>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${computedStatus === 'Normal' ? 'bg-industrial-50 text-industrial-700 border-industrial-200 dark:bg-industrial-900/20 dark:text-industrial-400 dark:border-industrial-800' :
                      computedStatus === 'In Repair' ? 'bg-maintenance-50 text-maintenance-700 border-maintenance-200 dark:bg-maintenance-900/20 dark:text-maintenance-400 dark:border-maintenance-800' :
                        'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${computedStatus === 'Normal' ? 'bg-industrial-500' :
                        computedStatus === 'In Repair' ? 'bg-maintenance-500' :
                          'bg-gray-500'
                        }`} />
                      {computedStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <HugeiconsIcon icon={Edit01Icon} size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(selectedAsset)}
                  className="px-3 py-1.5 text-sm font-medium text-error-600 dark:text-error-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                  <HugeiconsIcon icon={Delete01Icon} size={16} />
                  Delete
                </button>
              </div>
            </div>
              );
            })()}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {(() => {
                const assetWorkOrders = workOrders?.filter(wo => wo.vehicleId === selectedAsset.id) || [];
                const openWorkOrders = assetWorkOrders.filter(wo => wo.status === 'Open' || wo.status === 'In Progress' || wo.status === 'Ready').length;
                const warrantyActive = selectedAsset.warranty_end_date && dayjs(selectedAsset.warranty_end_date).isAfter(dayjs());

                return (
                  <>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total WOs</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{assetWorkOrders.length}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                          <HugeiconsIcon icon={ClipboardIcon} size={16} className="text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Open WOs</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{openWorkOrders}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-maintenance-50 dark:bg-maintenance-900/30 flex items-center justify-center">
                          <HugeiconsIcon icon={Clock01Icon} size={16} className="text-maintenance-600 dark:text-maintenance-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Downtime</p>
                          <div className="mt-1">
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
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                  {days > 0 ? `${days}d ${remainingHours}h` : `${hours}h`}
                                </p>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-error-50 dark:bg-error-900/30 flex items-center justify-center">
                          <HugeiconsIcon icon={Clock01Icon} size={16} className="text-error-600 dark:text-error-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Repair Cost</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                            {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(
                              assetWorkOrders.reduce((sum, wo) => sum + ((wo as any).cost || 0), 0)
                            )}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                          <HugeiconsIcon icon={TagIcon} size={16} className="text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Asset Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Basic Information</h3>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="p-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">License Plate</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 font-medium">{selectedAsset.license_plate || 'Not specified'}</p>
                  </div>
                  <div className="p-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Make & Model</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedAsset.make} {selectedAsset.model}</p>
                  </div>
                  <div className="p-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Year</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedAsset.year || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Customer Information</h3>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                  {(() => {
                    const customer = customers?.find(c => c.id === selectedAsset.customer_id);
                    return customer ? (
                      <>
                        <div className="p-3">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Customer Name</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 font-medium">{customer.name}</p>
                        </div>
                        <div className="p-3">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{customer.email || 'Not provided'}</p>
                        </div>
                        <div className="p-3">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{customer.phone || 'Not provided'}</p>
                        </div>
                      </>
                    ) : (
                      <div className="p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No customer assigned</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Work Orders */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Work Orders</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {workOrders?.filter(wo => wo.vehicleId === selectedAsset.id).length || 0} total
                  </span>
                  <button
                    onClick={() => navigate(`/work-orders/new?vehicleId=${selectedAsset.id}`)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors"
                  >
                    <HugeiconsIcon icon={Add01Icon} size={12} />
                    New
                  </button>
                </div>
              </div>

              {(() => {
                const assetWorkOrders = workOrders?.filter(wo => wo.vehicleId === selectedAsset.id) || [];

                return assetWorkOrders.length > 0 ? (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-4 py-3 font-medium">Work Order</th>
                            <th className="px-4 py-3 font-medium">Summary</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Location</th>
                            <th className="px-4 py-3 font-medium text-right">Created</th>
                            <th className="px-4 py-3 font-medium text-right">Priority</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {assetWorkOrders.slice(0, 10).map((workOrder) => {
                            const locationName = locations?.find(l => l.id === workOrder.locationId)?.name || 'Unknown';

                            return (
                              <tr
                                key={workOrder.id}
                                className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors cursor-pointer group"
                                onClick={() => setSelectedWorkOrder(workOrder)}
                              >
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                  {workOrder.workOrderNumber || `WO-${workOrder.id.substring(0, 6).toUpperCase()}`}
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                  {workOrder.description || workOrder.service || 'General Service'}
                                </td>
                                <td className="px-4 py-3">
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
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border border-current/20 ${config.bg} ${config.text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                        {workOrder.status}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1.5">
                                    <HugeiconsIcon icon={MapsIcon} size={14} className="text-gray-400" />
                                    {locationName}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                  {dayjs(workOrder.created_at).fromNow()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {workOrder.priority && (
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${workOrder.priority === 'Critical' ? 'bg-error-50 text-error-700 border-error-100 dark:bg-error-900/20 dark:text-error-400 dark:border-error-900/30' :
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
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 text-center border-t border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          View {assetWorkOrders.length - 10} more work orders
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8">
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3">
                        <HugeiconsIcon icon={ClipboardIcon} size={24} className="text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No work orders</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">This asset has no work order history</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HugeiconsIcon icon={Car01Icon} size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Select an Asset</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose an asset from the list to view details</p>
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
        open={!!selectedWorkOrder}
        onClose={() => setSelectedWorkOrder(null)}
        workOrderId={selectedWorkOrder?.id}
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