import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { useEffect } from "react";
dayjs.extend(relativeTime);

const AssetsPage = () => {
  const navigate = useNavigate();

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

  // Fetch diagnostic categories for issue labels
  const { data: diagnosticCategories } = useQuery({
    queryKey: ['diagnostic-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagnostic_categories')
        .select('*')
        .order('label');

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
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* List Column */}
        <div className="w-80 flex-none border-r border bg-card flex flex-col">
          <div className="p-4 border-b border">
            <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Detail Column */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="p-6 space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-1/3"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* List Column - Asset List */}
      <div className="w-full sm:w-80 flex-none flex flex-col bg-card">
        {/* Header */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold">Assets</h1>
            <div className="flex items-center gap-1">
              <Button
                variant={filtersOpen || hasActiveFilters ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="h-7 w-7 p-0"
              >
                <HugeiconsIcon icon={FilterIcon} className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditingVehicle(null); setIsDialogOpen(true); }}
                className="h-7 w-7 p-0"
                title="Add Asset"
              >
                <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={14} className="text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search assets..."
              className="w-full pl-8 h-8 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Advanced Filters */}
          {
            filtersOpen && (
              <div className="mt-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="block text-xs font-medium text-muted-foreground mb-0.5">Status</Label>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                      <SelectTrigger className="h-9 w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="In Repair">In Repair</SelectItem>
                        <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-muted-foreground mb-0.5">Age</Label>
                    <Select value={ageFilter} onValueChange={(value) => setAgeFilter(value)}>
                      <SelectTrigger className="h-9 w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="new">New (≤1yr)</SelectItem>
                        <SelectItem value="recent">Recent (1-3yr)</SelectItem>
                        <SelectItem value="mature">Mature (3-7yr)</SelectItem>
                        <SelectItem value="old">Old (&gt;7yr)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center pt-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={emergencyOnly}
                      onCheckedChange={(checked) => setEmergencyOnly(checked === true)}
                    />
                    <span className="text-xs font-medium">
                      Emergency Bikes Only
                    </span>
                  </label>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs text-muted-foreground underline mt-1 h-8"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            )
          }
        </div >

        {/* Asset List */}
        < div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent overscroll-y-contain" >
          {
            vehicles.length === 0 ? (
              <div className="empty-state p-4">
                <HugeiconsIcon icon={Car01Icon} size={40} className="empty-state-icon text-muted-foreground mx-auto mb-2" />
                <p className="text-xs font-medium mb-0.5 text-center">No assets found</p>
                <p className="text-xs text-muted-foreground text-center">
                  {hasActiveFilters ? "Try adjusting your filters" : "Add your first asset to get started"}
                </p>
              </div>
            ) : (
              <div className="divide-y relative">
                {vehicles.map((vehicle) => {
                  const isSelected = selectedAsset?.id === vehicle.id;
                  const assetWorkOrders = workOrders?.filter(wo => wo.asset_id === vehicle.id) || [];
                  const customer = customers?.find(c => c.id === vehicle.customer_id);

                  return (
                    <div
                      key={vehicle.id}
                      className={`p-3 cursor-pointer border-l-2 transition-all hover:bg-muted/50 ${isSelected
                        ? 'bg-muted border-l-primary'
                        : 'border-l-transparent'
                        }`}
                      onClick={() => {
                        setSelectedAsset(vehicle);
                        setFiltersOpen(false); // Close filters on selection on mobile
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                            <HugeiconsIcon icon={Car01Icon} size={12} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-bold font-mono">
                              {vehicle.license_plate || 'No License'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {vehicle.make} {vehicle.model}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {(() => {
                            const computedStatus = getComputedAssetStatus(vehicle);
                            return (
                              <Badge variant="outline" className={`px-1.5 py-0.5 rounded text-xs font-medium ${computedStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                computedStatus === 'In Repair' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                {computedStatus}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
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
            )
          }
        </div >
      </div >

      {/* Detail Column */}
      < div className="flex-1 flex flex-col overflow-hidden bg-background" >
        {
          selectedAsset ? (
            <div className="flex flex-col h-full" >
              <div className="flex-none px-4 py-2.5 bg-background z-10">
                {/* Header: Title, Status, Actions */}
                {(() => {
                  const computedStatus = getComputedAssetStatus(selectedAsset);
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <HugeiconsIcon icon={Motorbike01Icon} size={16} className="text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold font-mono">
                              {selectedAsset.license_plate}
                            </h2>
                            <Badge variant="outline" className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${computedStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              computedStatus === 'In Repair' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-muted text-muted-foreground'
                              }`}>
                              <span className={`w-1 h-1 rounded-full ${computedStatus === 'Normal' ? 'bg-emerald-500' :
                                computedStatus === 'In Repair' ? 'bg-amber-500' :
                                  'bg-muted-foreground'
                                }`} />
                              {computedStatus}
                            </Badge>
                            {selectedAsset.is_emergency_bike && (
                              <Badge variant="outline" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                                <span className="w-1 h-1 rounded-full bg-blue-500" />
                                Emergency
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(selectedAsset)}
                          className="px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 h-8"
                        >
                          <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(selectedAsset)}
                          className="px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1.5 h-8"
                        >
                          <HugeiconsIcon icon={Delete01Icon} size={14} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent overscroll-y-contain">
                <div className="max-w-6xl mx-auto">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {(() => {
                      const assetWorkOrders = workOrders?.filter(wo => wo.vehicleId === selectedAsset.id) || [];
                      const openWorkOrders = assetWorkOrders.filter(wo => wo.status === 'Open' || wo.status === 'In Progress' || wo.status === 'Ready').length;
                      const warrantyActive = selectedAsset.warranty_end_date && dayjs(selectedAsset.warranty_end_date).isAfter(dayjs());

                      return (
                        <>
                          <Card>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Total WOs</p>
                                  <p className="text-lg font-bold font-mono mt-0.5">{assetWorkOrders.length}</p>
                                </div>
                                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                                  <HugeiconsIcon icon={ClipboardIcon} size={14} className="text-primary" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Open WOs</p>
                                  <p className="text-lg font-bold font-mono mt-0.5">{openWorkOrders}</p>
                                </div>
                                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                                  <HugeiconsIcon icon={Clock01Icon} size={14} className="text-primary" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Downtime</p>
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
                                        <p className="text-lg font-bold font-mono">
                                          {days > 0 ? `${days}d ${remainingHours}h` : `${hours}h`}
                                        </p>
                                      );
                                    })()}
                                  </div>
                                </div>
                                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                                  <HugeiconsIcon icon={Clock01Icon} size={14} className="text-primary" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Repair Cost</p>
                                  <p className="text-lg font-bold font-mono mt-0.5">
                                    {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(
                                      assetWorkOrders.reduce((sum, wo) => sum + ((wo as any).cost || 0), 0)
                                    )}
                                  </p>
                                </div>
                                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                                  <HugeiconsIcon icon={TagIcon} size={14} className="text-primary" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      );
                    })()}
                  </div>

                  {/* Asset Details */}
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Vehicle Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Vehicle Information</h3>
                        <Card className="overflow-hidden rounded-md">
                          <CardContent className="p-4 grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">License Plate</Label>
                              <p className="text-xs mt-0.5 font-bold font-mono">{selectedAsset.license_plate || 'Not specified'}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Make & Model</Label>
                              <p className="text-xs mt-0.5">{selectedAsset.make && selectedAsset.model ? `${selectedAsset.make} ${selectedAsset.model}` : 'Not specified'}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Year</Label>
                              <p className="text-xs mt-0.5">{selectedAsset.year || 'Unknown'}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Production Date</Label>
                              <p className="text-xs mt-0.5">
                                {selectedAsset.date_of_manufacture ? dayjs(selectedAsset.date_of_manufacture).format('MMM DD, YYYY') : 'Not specified'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Operational Details */}
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Operational Details</h3>
                        <Card className="overflow-hidden rounded-md">
                          <CardContent className="p-4 grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Mileage</Label>
                              <p className="text-xs font-bold font-mono">
                                {selectedAsset.mileage != null ? `${selectedAsset.mileage.toLocaleString()} km` : '0 km'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Warranty</Label>
                              <p className="text-xs mt-0.5">
                                {(() => {
                                  const endDate = selectedAsset.warranty_end_date || (selectedAsset.date_of_manufacture ? dayjs(selectedAsset.date_of_manufacture).add(1, 'year').toISOString() : null);
                                  if (!endDate) return 'No warranty info';
                                  const warrantyEnd = dayjs(endDate);
                                  const today = dayjs();
                                  if (warrantyEnd.isBefore(today)) {
                                    return <span className="text-red-600 font-medium">Expired • {warrantyEnd.format('MMM DD, YYYY')}</span>;
                                  }
                                  const daysRemaining = warrantyEnd.diff(today, 'day');
                                  if (daysRemaining <= 30) {
                                    return <span className="text-amber-600 font-medium">{daysRemaining}d left</span>;
                                  }
                                  const monthsRemaining = warrantyEnd.diff(today, 'month');
                                  return <span className="text-emerald-600 font-medium">{monthsRemaining}mo left</span>;
                                })()}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Ownership Type</Label>
                              <p className="text-xs mt-0.5">
                                {selectedAsset.is_company_asset ? 'Company Asset' : 'Individual Asset'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Customer Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Customer Information</h3>
                        <Card className="overflow-hidden rounded-md">
                          <CardContent className="p-0">
                            {(() => {
                              const customer = customers?.find(c => c.id === selectedAsset.customer_id);
                              return customer ? (
                                <div className="p-4 grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Customer Name</Label>
                                    <p className="text-xs mt-0.5 font-medium">{customer.name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                                    <p className="text-xs mt-0.5">{customer.email || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                                    <p className="text-xs mt-0.5">{customer.phone || 'Not provided'}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4">
                                  <p className="text-xs text-muted-foreground italic">No customer assigned</p>
                                </div>
                              );
                            })()}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Work Orders */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Work Orders</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {workOrders?.filter(wo => wo.vehicleId === selectedAsset.id).length || 0} total
                        </span>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/work-orders/new?vehicleId=${selectedAsset.id}`)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium h-8"
                        >
                          <HugeiconsIcon icon={Add01Icon} size={14} />
                          New
                        </Button>
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
                        <Card className="overflow-hidden rounded-md">
                          <CardContent className="p-4">
                            <div className="overflow-x-auto" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
                              <Table>
                                <TableHeader className="bg-transparent border-none">
                                  <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="px-3 py-2 font-medium h-auto">Work Order</TableHead>
                                    <TableHead className="px-3 py-2 font-medium h-auto">Issue</TableHead>
                                    <TableHead className="px-3 py-2 font-medium h-auto">Status</TableHead>
                                    <TableHead className="px-3 py-2 font-medium h-auto">Location</TableHead>
                                    <TableHead className="px-3 py-2 font-medium text-right h-auto">Created</TableHead>
                                    <TableHead className="px-3 py-2 font-medium text-right h-auto">Priority</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {assetWorkOrders.slice(0, 10).map((workOrder) => {
                                    const locationName = locations?.find(l => l.id === workOrder.locationId)?.name || 'Unknown';

                                    return (
                                      <tr
                                        key={workOrder.id}
                                        className="hover:bg-accent transition-colors cursor-pointer group"
                                        onClick={() => setSelectedWorkOrderId(workOrder.id)}
                                      >
                                        <td className="px-3 py-2 font-mono">
                                          {workOrder.workOrderNumber || `WO-${workOrder.id.substring(0, 6).toUpperCase()}`}
                                        </td>
                                        <td className="px-3 py-2 text-muted-foreground max-w-[150px] truncate">
                                          {diagnosticCategories?.find(cat => cat.id === workOrder.service)?.label || workOrder.description || workOrder.service || 'General Service'}
                                        </td>
                                        <td className="px-3 py-2">
                                          {(() => {
                                            const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
                                              'Open': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
                                              'Confirmation': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
                                              'On Hold': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
                                              'Ready': { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
                                              'In Progress': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
                                              'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
                                              'Cancelled': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
                                            };
                                            const config = statusColors[workOrder.status || 'Open'] || statusColors['Open'];
                                            return (
                                              <Badge variant="secondary" className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border border-current/20 ${config.bg} ${config.text}`}>
                                                <span className={`w-1 h-1 rounded-full ${config.dot}`} />
                                                {workOrder.status}
                                              </Badge>
                                            );
                                          })()}
                                        </td>
                                        <td className="px-3 py-2 text-muted-foreground">
                                          <div className="flex items-center gap-1">
                                            <HugeiconsIcon icon={MapsIcon} size={14} className="text-muted-foreground" />
                                            {locationName}
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 text-right text-muted-foreground whitespace-nowrap">
                                          {dayjs(workOrder.created_at).fromNow()}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                          {workOrder.priority && (
                                            <Badge variant="outline" className={`inline-block px-1 py-0.5 rounded text-xs font-medium ${workOrder.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' :
                                              workOrder.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-muted text-muted-foreground'
                                              }`}>
                                              {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1).toLowerCase()}
                                            </Badge>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                            {assetWorkOrders.length > 10 && (
                              <div className="p-2 bg-muted text-center border-t border">
                                <p className="text-xs text-muted-foreground">
                                  View {assetWorkOrders.length - 10} more work orders
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent className="p-6">
                            <div className="text-center">
                              <div className="mx-auto w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-2">
                                <HugeiconsIcon icon={ClipboardIcon} size={18} className="text-muted-foreground" />
                              </div>
                              <p className="text-xs font-medium mb-0.5">No work orders</p>
                              <p className="text-xs text-muted-foreground">This asset has no work order history</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </div>
                </div> {/* Close max-width wrapper */}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <HugeiconsIcon icon={Car01Icon} size={36} className="text-muted-foreground mx-auto mb-3" />
                <h3 className="text-sm font-medium mb-0.5">Select an Asset</h3>
                <p className="text-xs text-muted-foreground">Choose an asset from the list to view details</p>
              </div>
            </div>
          )}
      </div >

      {/* Asset Form Dialog */}
      {
        isDialogOpen && (
          <AssetFormDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSave={handleSave}
            vehicle={editingVehicle}
            customers={customers || []}
          />
        )
      }

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
