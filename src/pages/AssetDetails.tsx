import { AlertCircle, Bike, CheckCircle, ClipboardList, Clock, Info, Lock, Plus, UserCircle, History, Edit, Phone, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/layout/PageHeader';


import { Stack, Button, Skeleton, Tabs } from '@/components/tailwind-components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, Customer, WorkOrder } from '@/types/supabase';
import { getWorkOrderNumber } from '@/utils/work-order-display';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { AssetFormDialog } from '@/components/AssetFormDialog';
import { showSuccess, showError } from '@/utils/toast';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';


dayjs.extend(relativeTime);

const AssetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);



  // Fetch vehicle details
  const { data: vehicle, isLoading: loadingVehicle } = useQuery<Vehicle & { customers: Customer } | null>({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, customers(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return snakeToCamelCase(data) as Vehicle & { customers: Customer };
    },
    enabled: !!id
  });

  // Fetch work orders for this vehicle
  const { data: workOrders, isLoading: loadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['vehicle-work-orders', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('vehicle_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      const transformed = (data || []).map(wo => snakeToCamelCase(wo)) as WorkOrder[];
      console.log('Work Orders Data:', transformed); // Debug log
      return transformed;
    },
    enabled: !!id
  });

  const isLoading = loadingVehicle || loadingWorkOrders;

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <Stack gap="lg">
          <Skeleton height={40} width={200} />
          <Skeleton height={300} />
          <Skeleton height={200} />
        </Stack>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto text-muted-foreground mb-4" size={48} />
            <CardTitle className="text-xl mb-2">Asset Not Found</CardTitle>
            <CardDescription className="mb-4">The asset you're looking for doesn't exist.</CardDescription>
            <Button onClick={() => navigate('/assets')}>Back to Assets</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors = {
    'Normal': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    'In Repair': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    'Decommissioned': 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30'
  };

  const recentWorkOrders = workOrders?.slice(0, 5) || [];
  const totalWorkOrders = workOrders?.length || 0;
  const openWorkOrders = workOrders?.filter(wo => wo.status === 'New' || wo.status === 'In Progress').length || 0;

  const pageActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(`/work-orders?vehicle=${id}`)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border hover:bg-muted rounded-lg transition-colors"
      >
        <ClipboardList className="w-5 h-5" />
        <span className="hidden sm:inline">View Work Orders</span>
        <span className="sm:hidden">Work Orders</span>
      </button>
      <button
        onClick={() => setIsEditDialogOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
      >
        <Edit className="w-4 h-4" />
        <span className="hidden sm:inline">Edit Asset</span>
        <span className="sm:hidden">Edit</span>
      </button>
    </div>
  );

  return (
    <>
      <div className="w-full px-6 py-4">
        <PageHeader
          title={vehicle.license_plate}
          subtitle={`${vehicle.make} ${vehicle.model} ${vehicle.year ? `(${vehicle.year})` : ''}`}
          icon={<Bike className="w-5 h-5 text-muted-foreground" />}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/work-orders?vehicle=${id}`)}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">View Work Orders</span>
                <span className="sm:hidden">Work Orders</span>
              </Button>
              <Button onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Edit Asset</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
          }
        />
      </div>
      <div className="w-full px-6 pt-2 pb-6">
        <div className="space-y-6">

          {/* Vehicle Header Card with Owner & Specifications */}
          <Card>
            <CardContent className="p-6">
              {/* Vehicle Status and Badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant={vehicle.status === 'Normal' ? 'success' : vehicle.status === 'In Repair' ? 'warning' : 'destructive'}>
                  {vehicle.status || 'Normal'}
                </Badge>
                {vehicle.is_emergency_bike && (
                  <Badge variant="info" className="gap-1">
                    <Info className="w-4 h-4" />
                    Emergency Bike
                  </Badge>
                )}
                {vehicle.warranty_end_date && dayjs(vehicle.warranty_end_date).isAfter(dayjs()) && (
                  <Badge variant="outline" className="gap-1 border-primary/20 text-primary">
                    <Lock className="w-4 h-4" />
                    Under Warranty
                  </Badge>
                )}
              </div>

              {/* Owner Information & Vehicle Specifications - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* Owner Information */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-muted-foreground" />
                      Owner Information
                    </h3>
                    {vehicle.customers?.phone && (
                      <a
                        href={`tel:${vehicle.customers.phone}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Owner Name</div>
                      <div className="text-sm font-semibold text-foreground">{vehicle.customers?.name || 'N/A'}</div>
                    </div>
                    {vehicle.customers?.phone && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Phone Number</div>
                        <div className="text-sm font-semibold text-foreground">{vehicle.customers.phone}</div>
                      </div>
                    )}
                    {vehicle.customers?.email && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Email Address</div>
                        <div className="text-sm font-semibold text-foreground truncate">{vehicle.customers.email}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Specifications */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-muted-foreground" />
                    Vehicle Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Ownership Type</div>
                      <div className="text-sm font-semibold text-foreground">
                        {vehicle.is_company_asset ? 'Company Asset' : 'Individual Asset'}
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-1">License Plate</div>
                      <div className="text-sm font-semibold text-foreground">{vehicle.license_plate}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-1">VIN</div>
                      <div className="text-sm font-semibold text-foreground font-mono break-all">{vehicle.vin || 'N/A'}</div>
                    </div>
                    {vehicle.motor_number && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Motor Number</div>
                        <div className="text-sm font-semibold text-foreground font-mono">{vehicle.motor_number}</div>
                      </div>
                    )}
                    {vehicle.mileage && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Mileage</div>
                        <div className="text-sm font-semibold text-foreground">{vehicle.mileage.toLocaleString()} km</div>
                      </div>
                    )}
                    {vehicle.battery_capacity && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Battery Capacity</div>
                        <div className="text-sm font-semibold text-foreground">{vehicle.battery_capacity} kWh</div>
                      </div>
                    )}
                    {vehicle.date_of_manufacture && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Date of Manufacture</div>
                        <div className="text-sm font-semibold text-foreground">{dayjs(vehicle.date_of_manufacture).format('MMM DD, YYYY')}</div>
                      </div>
                    )}
                    {vehicle.year && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Year</div>
                        <div className="text-sm font-semibold text-foreground">{vehicle.year}</div>
                      </div>
                    )}
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Added to System</div>
                      <div className="text-sm font-semibold text-foreground">{dayjs(vehicle.created_at).format('MMM DD, YYYY')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="cursor-pointer hover:bg-muted/50 hover:border-primary/20 transition-all"
              onClick={() => navigate(`/work-orders?vehicle=${id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Work Orders</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{totalWorkOrders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                  <ChevronRight className="w-3 h-3" />
                  <span>View all</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Open Work Orders</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{openWorkOrders}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                {openWorkOrders > 0 && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>Needs attention</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${statusColors[vehicle.status || 'Normal']}`}>
                        {vehicle.status || 'Normal'}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Warranty Status</p>
                    <p className="text-sm font-bold text-foreground mt-1">
                      {vehicle.warranty_end_date && dayjs(vehicle.warranty_end_date).isAfter(dayjs()) ? 'Active' : 'Expired'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                </div>
                {vehicle.warranty_end_date && dayjs(vehicle.warranty_end_date).isAfter(dayjs()) && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Expires {dayjs(vehicle.warranty_end_date).fromNow()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Service History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="w-5 h-5 text-muted-foreground" />
                  Service History
                </CardTitle>
                <button
                  onClick={() => navigate(`/work-orders?vehicle=${id}`)}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
            {recentWorkOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-lg bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="text-muted-foreground w-8 h-8" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No service history</p>
                <p className="text-xs text-muted-foreground mb-4">This vehicle hasn't had any work orders yet</p>
                <button
                  onClick={() => navigate(`/work-orders/new?vehicle=${id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create First Work Order
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 px-5 w-[140px]">Work Order</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 px-3">Issue</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 px-3 w-[130px]">Status</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 px-3 w-[150px]">Location</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 px-3 w-[120px]">Created</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 px-5 w-[110px]">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWorkOrders.slice(0, 5).map((wo, index) => (
                      <tr
                        key={wo.id}
                        className={`group border-b border-border last:border-b-0 hover:bg-primary/5 hover:shadow-sm transition-all duration-200 cursor-pointer ${
                          index % 2 === 1 ? 'bg-muted/30' : 'bg-background'
                        }`}
                        onClick={() => navigate(`/work-orders/${wo.id}`)}
                      >
                        <td className="py-5 px-5">
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors font-mono">
                            {getWorkOrderNumber(wo)}
                          </span>
                        </td>
                        <td className="py-5 px-3">
                          <p className="text-sm text-foreground line-clamp-1">
                            {wo.description || wo.service || 'General Service'}
                          </p>
                        </td>
                        <td className="py-5 px-3">
                          <Badge 
                            variant={
                              wo.status === 'Completed' ? 'success' :
                              wo.status === 'In Progress' ? 'warning' :
                              wo.status === 'On Hold' ? 'secondary' :
                              wo.status === 'Ready' ? 'info' :
                              wo.status === 'Confirmation' ? 'default' :
                              wo.status === 'New' ? 'info' : 'secondary'
                            }
                            className="gap-1.5"
                          >
                            {wo.status === 'Completed' && <CheckCircle className="w-4 h-4" />}
                            {(wo.status === 'New' || wo.status === 'In Progress') && <Clock className="w-4 h-4" />}
                            {wo.status || 'New'}
                          </Badge>
                        </td>
                        <td className="py-5 px-3">
                          <div className="flex items-center gap-1.5">
                            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">
                              {wo.locationId ? 'Service Center' : 'Not assigned'}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-3">
                          <span className="text-sm text-muted-foreground" title={wo.createdAt ? dayjs(wo.createdAt).format('MMMM D, YYYY h:mm A') : wo.created_at ? dayjs(wo.created_at).format('MMMM D, YYYY h:mm A') : 'N/A'}>
                            {wo.createdAt ? dayjs(wo.createdAt).format('MMM D, YYYY') : wo.created_at ? dayjs(wo.created_at).format('MMM D, YYYY') : 'N/A'}
                          </span>
                        </td>
                        <td className="py-5 px-5 text-right">
                          <Badge 
                            variant={
                              (wo.priority === 'urgent' || wo.priority === 'Critical' || wo.priority === 'Urgent') ? 'destructive' :
                              (wo.priority === 'high' || wo.priority === 'High') ? 'warning' :
                              (wo.priority === 'medium' || wo.priority === 'Medium') ? 'secondary' :
                              (wo.priority === 'low' || wo.priority === 'Low') ? 'outline' : 'secondary'
                            }
                            className="gap-1.5"
                          >
                            {(wo.priority === 'urgent' || wo.priority === 'Critical' || wo.priority === 'Urgent') && (
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            )}
                            {(wo.priority === 'high' || wo.priority === 'High') && (
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            )}
                            {(wo.priority === 'medium' || wo.priority === 'Medium') && (
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            )}
                            {wo.priority ? wo.priority.charAt(0).toUpperCase() + wo.priority.slice(1) : 'Medium'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {workOrders && workOrders.length > 5 && (
                  <button
                    onClick={() => navigate(`/work-orders?vehicle=${id}`)}
                    className="w-full py-3 text-sm font-medium text-primary hover:text-primary/80 hover:bg-muted/50 rounded-lg transition-colors mt-1 border-t border-border"
                  >
                    View {workOrders.length - 5} more work orders
                  </button>
                )}
              </div>
            )}
            </CardContent>
          </Card>

          {/* Warranty Information */}
          {vehicle.warranty_end_date && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  Warranty Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3 border border-border">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Status</div>
                    <div className="text-sm font-semibold">
                      {dayjs(vehicle.warranty_end_date).isAfter(dayjs()) ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-5 h-5" />
                          Active
                        </span>
                      ) : (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Expired
                        </span>
                      )}
                    </div>
                  </div>
                  {vehicle.warranty_start_date && (
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Start Date</div>
                      <div className="text-sm font-semibold text-foreground">{dayjs(vehicle.warranty_start_date).format('MMM DD, YYYY')}</div>
                    </div>
                  )}
                  <div className="bg-muted/50 rounded-lg p-3 border border-border">
                    <div className="text-xs font-medium text-muted-foreground mb-1">End Date</div>
                    <div className="text-sm font-semibold text-foreground">{dayjs(vehicle.warranty_end_date).format('MMM DD, YYYY')}</div>
                  </div>
                  {vehicle.warranty_months && (
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Duration</div>
                      <div className="text-sm font-semibold text-foreground">{vehicle.warranty_months} months</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Asset Dialog */}
        <AssetFormDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={async (vehicleData) => {
            try {
              const snakeCaseData = camelToSnakeCase(vehicleData);
              const { error } = await supabase
                .from('vehicles')
                .update(snakeCaseData)
                .eq('id', id);

              if (error) throw error;

              // Invalidate and refetch
              queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
              showSuccess('Asset updated successfully');
              setIsEditDialogOpen(false);
            } catch (error) {
              console.error('Failed to update asset:', error);
              showError('Failed to update asset');
            }
          }}
          vehicle={vehicle || undefined}
        />
      </div>
    </>
  );
};

export default AssetDetails;




