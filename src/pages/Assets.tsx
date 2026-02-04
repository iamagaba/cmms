import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AssetDataTable } from "@/components/AssetDataTable";
import { AssetFormDialog } from "@/components/AssetFormDialog";
import { Vehicle, WorkOrder } from "@/types/supabase";
import { getWorkOrderNumber } from '@/utils/work-order-display';
import { useAssetManagement } from "@/hooks/useAssetManagement";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import PageHeader from '@/components/layout/PageHeader';
import MasterListShell from '@/components/layout/MasterListShell';
import MasterListRow from '@/components/layout/MasterListRow';


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { CreateWorkOrderForm } from "@/components/work-orders/CreateWorkOrderForm";
import { cn } from '@/lib/utils';
import { Bike, ClipboardList, Clock, Map, Plus, Search, Tag, Users, Filter, Car, Edit, Trash2, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
dayjs.extend(relativeTime);

const AssetsPage = () => {
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Vehicle | null>(null);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = useState(false);

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
      wo.status === 'New' ||
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
            <Skeleton className="h-6 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>

        {/* Detail Column */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-4" />
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
      <MasterListShell
        title="Assets"
        subtitle="Manage your fleet vehicles"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search assets..."
        onCreateNew={() => { setEditingVehicle(null); setIsDialogOpen(true); }}
        createButtonText="Add Asset"
        showFilters={true}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        filtersActive={filtersOpen || hasActiveFilters}
        itemCount={vehicles.length}
        filterContent={
          filtersOpen && (
            <div className="mt-3 pt-2 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-xs font-medium text-muted-foreground mb-0.5">Status</Label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                    <SelectTrigger className="w-full text-xs">
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
                    <SelectTrigger className="w-full text-xs">
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
                  className="text-xs text-muted-foreground underline mt-1"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )
        }
        emptyState={
          <EmptyState
            icon={<Car className="w-6 h-6 text-muted-foreground" />}
            title="No assets found"
            description={hasActiveFilters ? "Try adjusting your filters" : "Add your first asset to get started"}
          />
        }
      >
        {vehicles.length > 0 && (
          <div className="divide-y">
            {vehicles.map((vehicle) => {
              const isSelected = selectedAsset?.id === vehicle.id;
              const assetWorkOrders = workOrders?.filter(wo => wo.asset_id === vehicle.id) || [];
              const customer = customers?.find(c => c.id === vehicle.customer_id);
              const computedStatus = getComputedAssetStatus(vehicle);

              return (
                <MasterListRow
                  key={vehicle.id}
                  title={vehicle.license_plate || 'No License'}
                  subtitle={`${vehicle.make || 'Unknown'} ${vehicle.model || 'Model'}`}
                  description={customer?.name || 'No Customer'}
                  badge={{
                    text: computedStatus,
                    variant: computedStatus === 'Normal' ? 'success' :
                      computedStatus === 'In Repair' ? 'warning' : 'outline'
                  }}
                  icon={<Car className="w-4 h-4 text-primary" />}
                  isSelected={isSelected}
                  onClick={() => {
                    setSelectedAsset(vehicle);
                    setFiltersOpen(false);
                  }}
                  metadata={assetWorkOrders.length > 0 ? [{
                    label: 'WO',
                    value: assetWorkOrders.length,
                    icon: <ClipboardList className="w-3 h-3" />
                  }] : undefined}
                />
              );
            })}
          </div>
        )}
      </MasterListShell>

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
                          <Bike className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold font-mono">
                              {selectedAsset.license_plate}
                            </h2>
                            <Badge variant={
                              computedStatus === 'Normal' ? 'success' :
                                computedStatus === 'In Repair' ? 'warning' :
                                  'outline'
                            }>
                              <span className={`w-1 h-1 rounded-full mr-1 ${computedStatus === 'Normal' ? 'bg-success' :
                                computedStatus === 'In Repair' ? 'bg-warning' :
                                  'bg-muted-foreground'
                                }`} />
                              {computedStatus}
                            </Badge>
                            {selectedAsset.is_emergency_bike && (
                              <Badge variant="info">
                                <span className="w-1 h-1 rounded-full bg-blue-500 mr-1" />
                                Emergency
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedAsset.make && selectedAsset.model ? `${selectedAsset.make} ${selectedAsset.model}` : 'Unknown Model'}
                            {selectedAsset.year && ` (${selectedAsset.year})`}
                            {' • '}
                            {(() => {
                              const customer = customers?.find(c => c.id === selectedAsset.customer_id);
                              return customer?.name || 'No Customer Assigned';
                            })()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(selectedAsset)}
                          className="px-2.5 py-1 text-xs font-medium flex items-center gap-1.5"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(selectedAsset)}
                          className="px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex-1 overflow-auto px-4 py-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent overscroll-y-contain">
                <div className="max-w-6xl mx-auto">
                  {/* Stats Grid */}
                  <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm mb-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
                      {(() => {
                        const assetWorkOrders = workOrders?.filter(wo => wo.vehicleId === selectedAsset.id) || [];
                        const openWorkOrders = assetWorkOrders.filter(wo => wo.status === 'New' || wo.status === 'In Progress' || wo.status === 'Ready').length;

                        const stats = [
                          {
                            title: "Total WOs",
                            value: assetWorkOrders.length,
                            icon: ClipboardList,
                            color: "primary"
                          },
                          {
                            title: "Open WOs",
                            value: openWorkOrders,
                            icon: Clock,
                            color: openWorkOrders > 0 ? "amber" : "primary"
                          },
                          {
                            title: "Downtime",
                            value: (() => {
                              const totalMinutes = assetWorkOrders.reduce((acc, wo) => {
                                if (wo.status === 'Completed' || wo.status === 'In Progress') {
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
                              return days > 0 ? `${days}d ${remainingHours}h` : `${hours}h`;
                            })(),
                            icon: Clock,
                            color: "primary"
                          },
                          {
                            title: "Repair Cost",
                            value: new Intl.NumberFormat('en-UG', {
                              style: 'currency',
                              currency: 'UGX',
                              maximumFractionDigits: 0,
                              notation: 'compact'
                            }).format(
                              assetWorkOrders.reduce((sum, wo) => sum + ((wo as any).cost || 0), 0)
                            ),
                            icon: Tag,
                            color: "primary"
                          }
                        ];

                        return stats.map((stat, index) => {
                          const IconComponent = stat.icon;
                          const getIconColorClass = (color: string) => {
                            switch (color) {
                              case 'primary': return 'text-primary';
                              case 'emerald': return 'text-success';
                              case 'amber': return 'text-warning';
                              case 'red': return 'text-destructive';
                              default: return 'text-muted-foreground';
                            }
                          };

                          return (
                            <div key={index} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <IconComponent className={cn('w-4 h-4', getIconColorClass(stat.color))} />
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      {stat.title}
                                    </p>
                                  </div>
                                  <p className="text-2xl font-bold text-foreground font-mono">
                                    {stat.value}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Asset Details */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Vehicle Information */}
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Car className="w-4 h-4 text-primary" />
                          Vehicle Information
                        </h3>
                        <Card className="overflow-hidden rounded-lg">
                          <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">License Plate</Label>
                                <p className="text-sm mt-1 font-bold font-mono text-foreground">
                                  {selectedAsset.license_plate || <span className="text-muted-foreground italic font-normal">Not specified</span>}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Make & Model</Label>
                                <p className="text-sm mt-1 font-medium text-foreground">
                                  {selectedAsset.make && selectedAsset.model ? `${selectedAsset.make} ${selectedAsset.model}` : <span className="text-muted-foreground italic font-normal">Not specified</span>}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Year</Label>
                                <p className="text-sm mt-1 font-medium text-foreground">
                                  {selectedAsset.year || <span className="text-muted-foreground italic font-normal">Unknown</span>}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Production Date</Label>
                                <p className="text-sm mt-1 font-medium text-foreground">
                                  {selectedAsset.date_of_manufacture ? dayjs(selectedAsset.date_of_manufacture).format('MMM DD, YYYY') : <span className="text-muted-foreground italic font-normal">Not specified</span>}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Operational Details */}
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          Operational Details
                        </h3>
                        <Card className="overflow-hidden rounded-lg">
                          <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mileage</Label>
                                <p className="text-sm mt-1 font-bold font-mono text-foreground">
                                  {selectedAsset.mileage != null ? `${selectedAsset.mileage.toLocaleString()} km` : '0 km'}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Warranty</Label>
                                <p className="text-sm mt-1 font-medium">
                                  {(() => {
                                    const endDate = selectedAsset.warranty_end_date || (selectedAsset.date_of_manufacture ? dayjs(selectedAsset.date_of_manufacture).add(1, 'year').toISOString() : null);
                                    if (!endDate) return <span className="text-muted-foreground italic font-normal">No warranty info</span>;
                                    const warrantyEnd = dayjs(endDate);
                                    const today = dayjs();
                                    if (warrantyEnd.isBefore(today)) {
                                      return <span className="text-destructive font-semibold">Expired • {warrantyEnd.format('MMM DD, YYYY')}</span>;
                                    }
                                    const daysRemaining = warrantyEnd.diff(today, 'day');
                                    if (daysRemaining <= 30) {
                                      return <span className="text-warning font-semibold">{daysRemaining}d left</span>;
                                    }
                                    const monthsRemaining = warrantyEnd.diff(today, 'month');
                                    return <span className="text-success font-semibold">{monthsRemaining}mo left</span>;
                                  })()}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ownership Type</Label>
                              <p className="text-sm mt-1 font-medium text-foreground">
                                {selectedAsset.is_company_asset ? 'Company Asset' : 'Individual Asset'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Customer Information */}
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Customer Information
                        </h3>
                        <Card className="overflow-hidden rounded-lg">
                          <CardContent className="p-0">
                            {(() => {
                              const customer = customers?.find(c => c.id === selectedAsset.customer_id);
                              return customer ? (
                                <div className="p-4 space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer</Label>
                                      <p className="text-sm mt-1 font-semibold text-foreground">{customer.name}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
                                      <p className="text-sm mt-1 font-medium text-foreground">{customer.email || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone</Label>
                                    <p className="text-sm mt-1 font-medium text-foreground">{customer.phone || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-6 text-center">
                                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                    <Users className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                  <p className="text-sm font-semibold text-foreground mb-1">No customer assigned</p>
                                  <p className="text-xs text-muted-foreground">
                                    Assign a customer to track ownership
                                  </p>
                                </div>
                              );
                            })()}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Work Orders */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-primary" />
                        Work Orders
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {workOrders?.filter(wo => wo.vehicleId === selectedAsset.id).length || 0} total
                        </span>
                        <Button
                          size="sm"
                          onClick={() => setIsCreateWorkOrderOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Create
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
                                <TableHeader className="bg-muted border-none sticky top-0 z-10">
                                  <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="px-3 py-2 font-medium h-auto">
                                      <div className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        Work Order
                                      </div>
                                    </TableHead>
                                    <TableHead className="px-3 py-2 font-medium h-auto">
                                      <div className="flex items-center gap-1">
                                        <ClipboardList className="w-3 h-3" />
                                        Issue
                                      </div>
                                    </TableHead>
                                    <TableHead className="px-3 py-2 font-medium h-auto">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Status
                                      </div>
                                    </TableHead>
                                    <TableHead className="px-3 py-2 font-medium h-auto">
                                      <div className="flex items-center gap-1">
                                        <Map className="w-3 h-3" />
                                        Location
                                      </div>
                                    </TableHead>
                                    <TableHead className="px-3 py-2 font-medium text-right h-auto">
                                      <div className="flex items-center justify-end gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Created
                                      </div>
                                    </TableHead>
                                    <TableHead className="px-3 py-2 font-medium text-right h-auto">
                                      <div className="flex items-center justify-end gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Priority
                                      </div>
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TooltipProvider>
                                    {assetWorkOrders.slice(0, 10).map((workOrder, index) => {
                                      const locationName = locations?.find(l => l.id === workOrder.locationId)?.name || 'Unknown';
                                      const issueText = diagnosticCategories?.find(cat => cat.id === workOrder.service)?.label || workOrder.description || workOrder.service || 'General Service';

                                      return (
                                        <tr
                                          key={workOrder.id}
                                          className="transition-colors cursor-pointer group border-b border-border/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                                          onClick={() => setSelectedWorkOrderId(workOrder.id)}
                                        >
                                          <td className="px-3 py-2 font-mono text-left">
                                            {getWorkOrderNumber(workOrder)}
                                          </td>
                                          <td className="px-3 py-2 text-muted-foreground max-w-[150px]">
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <span className="block truncate cursor-default">
                                                  {issueText}
                                                </span>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p className="max-w-xs">{issueText}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </td>
                                          <td className="px-3 py-2">
                                            {(() => {
                                              const statusVariantMap: Record<string, 'open' | 'in-progress' | 'completed' | 'error' | 'warning' | 'info'> = {
                                                'New': 'open',
                                                'Confirmation': 'info',
                                                'On Hold': 'warning',
                                                'Ready': 'info',
                                                'In Progress': 'in-progress',
                                                'Completed': 'completed',
                                                'Cancelled': 'error',
                                              };
                                              const variant = statusVariantMap[workOrder.status || 'New'] || 'open';
                                              const dotColorClass =
                                                workOrder.status === 'Completed'
                                                  ? 'bg-emerald-500'
                                                  : workOrder.status === 'In Progress'
                                                    ? 'bg-amber-500'
                                                    : workOrder.status === 'On Hold'
                                                      ? 'bg-slate-400'
                                                      : workOrder.status === 'Cancelled'
                                                        ? 'bg-rose-500'
                                                        : 'bg-slate-500';
                                              return (
                                                <Badge variant={variant} className="inline-flex items-center gap-1">
                                                  <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />
                                                  {workOrder.status}
                                                </Badge>
                                              );
                                            })()}
                                          </td>
                                          <td className="px-3 py-2 text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                              <Map className="w-3 h-3 text-muted-foreground" />
                                              {locationName}
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-right text-muted-foreground whitespace-nowrap">
                                            {dayjs(workOrder.created_at).fromNow()}
                                          </td>
                                          <td className="px-3 py-2 text-right">
                                            {workOrder.priority && (
                                              <div className="inline-flex items-center justify-end gap-1.5">
                                                <Badge
                                                  variant={
                                                    workOrder.priority === 'Critical' ? 'critical' :
                                                      workOrder.priority === 'High' ? 'high' :
                                                        workOrder.priority === 'Medium' ? 'medium' :
                                                          'low'
                                                  }
                                                  className="inline-flex items-center gap-1"
                                                >
                                                  {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1).toLowerCase()}
                                                </Badge>
                                                <ChevronRight
                                                  className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                />
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </TooltipProvider>
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
                          <CardContent className="py-12">
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ClipboardList className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <h3 className="text-base font-semibold text-foreground mb-1">
                                No work orders yet
                              </h3>
                              <p className="text-sm text-muted-foreground max-w-sm">
                                Create your first work order to get started.
                              </p>
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
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Car className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold mb-1 flex items-center justify-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  Select an Asset
                </h3>
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

      {/* Create Work Order Form */}
      {selectedAsset && (
        <CreateWorkOrderForm
          isOpen={isCreateWorkOrderOpen}
          onClose={() => setIsCreateWorkOrderOpen(false)}
          initialData={{
            vehicleId: selectedAsset.id,
            customerId: selectedAsset.customer_id || '',
            licensePlate: selectedAsset.license_plate || '',
            contactPhone: customers?.find(c => c.id === selectedAsset.customer_id)?.phone || '',
            customerLocation: null // We'll need to handle location separately if needed
          }}
        />
      )}
    </div>
  );
};

export default AssetsPage;


