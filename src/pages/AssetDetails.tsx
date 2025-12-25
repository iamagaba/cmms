import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { Stack, Button, Skeleton, Tabs } from '@/components/tailwind-components';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, Customer, WorkOrder } from '@/types/supabase';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { AssetFormDialog } from '@/components/AssetFormDialog';
import { showSuccess, showError } from '@/utils/toast';
import AppBreadcrumb from '@/components/Breadcrumbs';
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
      return (data || []).map(wo => snakeToCamelCase(wo)) as WorkOrder[];
    },
    enabled: !!id
  });

  const isLoading = loadingVehicle || loadingWorkOrders;

  if (isLoading) {
    return (
      <div className="w-full px-6 py-6">
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
      <div className="w-full px-6 py-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
          <Icon icon="mdi:alert-circle" className="mx-auto text-gray-400 dark:text-gray-500 mb-4" width={64} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Asset Not Found</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">The asset you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/assets')}>Back to Assets</Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    'Normal': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    'Available': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    'In Repair': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    'Decommissioned': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
  };

  const recentWorkOrders = workOrders?.slice(0, 5) || [];
  const totalWorkOrders = workOrders?.length || 0;
  const openWorkOrders = workOrders?.filter(wo => wo.status === 'Open' || wo.status === 'In Progress').length || 0;

  const pageActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(`/work-orders?vehicle=${id}`)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Icon icon="tabler:clipboard-list" width={16} />
        <span className="hidden sm:inline">View Work Orders</span>
        <span className="sm:hidden">Work Orders</span>
      </button>
      <button
        onClick={() => setIsEditDialogOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
      >
        <Icon icon="tabler:edit" width={16} />
        <span className="hidden sm:inline">Edit Asset</span>
        <span className="sm:hidden">Edit</span>
      </button>
    </div>
  );

  return (
    <>
      <AppBreadcrumb 
        actions={pageActions}
        customBreadcrumbs={[
          { label: 'Home', path: '/', icon: 'tabler:home' },
          { label: 'Assets', path: '/assets', icon: 'tabler:motorbike' },
          { label: vehicle.license_plate || 'Asset Details', path: `/assets/${id}`, isClickable: false }
        ]}
      />
      <div className="w-full px-6 pt-2 pb-6">
        <Stack gap="md">

        {/* Vehicle Header Card with Owner & Specifications */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          {/* Vehicle Title Section */}
          <div className="flex items-start gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-14 h-14 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Icon icon="tabler:motorbike" className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{vehicle.license_plate}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded text-xs font-medium border ${statusColors[vehicle.status || 'Normal']}`}>
                  {vehicle.status || 'Normal'}
                </span>
                {vehicle.is_emergency_bike && (
                  <span className="px-2.5 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                    <Icon icon="tabler:lifebuoy" width={12} className="inline mr-1" />
                    Emergency Bike
                  </span>
                )}
                {vehicle.warranty_end_date && dayjs(vehicle.warranty_end_date).isAfter(dayjs()) && (
                  <span className="px-2.5 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                    <Icon icon="tabler:shield-check" width={12} className="inline mr-1" />
                    Under Warranty
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Owner Information & Vehicle Specifications - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
            {/* Owner Information */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Icon icon="tabler:user-circle" width={18} className="text-gray-600 dark:text-gray-400" />
                  Owner Information
                </h3>
                {vehicle.customers?.phone && (
                  <a
                    href={`tel:${vehicle.customers.phone}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <Icon icon="tabler:phone" width={14} />
                    Call
                  </a>
                )}
              </div>
              <div className="space-y-2">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Owner Name</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{vehicle.customers?.name || 'N/A'}</div>
                </div>
                {vehicle.customers?.phone && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{vehicle.customers.phone}</div>
                  </div>
                )}
                {vehicle.customers?.email && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{vehicle.customers.email}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Icon icon="tabler:info-circle" width={18} className="text-gray-600 dark:text-gray-400" />
                Vehicle Specifications
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">License Plate</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{vehicle.license_plate}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">VIN</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono break-all">{vehicle.vin || 'N/A'}</div>
                </div>
                {vehicle.motor_number && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Motor Number</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">{vehicle.motor_number}</div>
                  </div>
                )}
                {vehicle.mileage && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Mileage</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{vehicle.mileage.toLocaleString()} km</div>
                  </div>
                )}
                {vehicle.battery_capacity && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Battery Capacity</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{vehicle.battery_capacity} kWh</div>
                  </div>
                )}
                {vehicle.date_of_manufacture && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date of Manufacture</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dayjs(vehicle.date_of_manufacture).format('MMM DD, YYYY')}</div>
                  </div>
                )}
                {vehicle.year && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Year</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{vehicle.year}</div>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Added to System</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dayjs(vehicle.created_at).format('MMM DD, YYYY')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer"
            onClick={() => navigate(`/work-orders?vehicle=${id}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Work Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalWorkOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon icon="tabler:clipboard-list" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <Icon icon="tabler:arrow-right" className="w-3 h-3" />
              <span>View all</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Open Work Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{openWorkOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                <Icon icon="tabler:clock" className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            {openWorkOrders > 0 && (
              <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Icon icon="tabler:alert-circle" className="w-3 h-3" />
                <span>Needs attention</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Status</p>
                <div className="mt-1">
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${statusColors[vehicle.status || 'Normal']}`}>
                    {vehicle.status || 'Normal'}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <Icon icon="tabler:circle-check" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Warranty Status</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {vehicle.warranty_end_date && dayjs(vehicle.warranty_end_date).isAfter(dayjs()) ? 'Active' : 'Expired'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                <Icon icon="tabler:shield-check" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            {vehicle.warranty_end_date && dayjs(vehicle.warranty_end_date).isAfter(dayjs()) && (
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Expires {dayjs(vehicle.warranty_end_date).fromNow()}
              </div>
            )}
          </div>
        </div>

        {/* Service History */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Icon icon="tabler:history" width={18} className="text-gray-600 dark:text-gray-400" />
              Service History
            </h3>
            <button
              onClick={() => navigate(`/work-orders?vehicle=${id}`)}
              className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              View All
              <Icon icon="tabler:arrow-right" width={14} />
            </button>
          </div>
          {recentWorkOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <Icon icon="tabler:clipboard-off" className="text-gray-400 dark:text-gray-500" width={32} />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No service history</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This vehicle hasn't had any work orders yet</p>
              <button
                onClick={() => navigate(`/work-orders/new?vehicle=${id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                <Icon icon="tabler:plus" width={14} />
                Create First Work Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 pb-3 px-3">Work Order #</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 pb-3 px-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 pb-3 px-3">Description</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 pb-3 px-3">Priority</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 pb-3 px-3">Technician</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 pb-3 px-3">Service Type</th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 pb-3 px-3">Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWorkOrders.slice(0, 5).map((wo) => (
                    <tr
                      key={wo.id}
                      className="group border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50/30 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                    >
                      <td className="py-3 px-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                          {wo.workOrderNumber || `WO-${wo.id.substring(0, 6).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap border ${
                          wo.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                          wo.status === 'In Progress' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                          wo.status === 'On Hold' ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' :
                          wo.status === 'Ready' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                          wo.status === 'Confirmation' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' :
                          'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                        }`}>
                          {wo.status || 'Open'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs">
                          {wo.description || wo.service || 'General Service'}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap border ${
                          wo.priority === 'Critical' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                          wo.priority === 'High' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                          wo.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                          wo.priority === 'Low' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                          'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                        }`}>
                          {wo.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {wo.assignedTechnicianId ? 'Assigned' : 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {wo.service || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-700 dark:text-gray-300">{dayjs(wo.created_at).format('MMM DD, YYYY')}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{dayjs(wo.created_at).fromNow()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {workOrders && workOrders.length > 5 && (
                <button
                  onClick={() => navigate(`/work-orders?vehicle=${id}`)}
                  className="w-full py-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors mt-2"
                >
                  View {workOrders.length - 5} more work orders
                </button>
              )}
            </div>
          )}
        </div>

        {/* Warranty Information */}
        {vehicle.warranty_end_date && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Icon icon="tabler:shield-check" width={18} className="text-gray-600 dark:text-gray-400" />
              Warranty Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</div>
                <div className="text-sm font-semibold">
                  {dayjs(vehicle.warranty_end_date).isAfter(dayjs()) ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Icon icon="tabler:circle-check" width={16} />
                      Active
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                      <Icon icon="tabler:circle-x" width={16} />
                      Expired
                    </span>
                  )}
                </div>
              </div>
              {vehicle.warranty_start_date && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dayjs(vehicle.warranty_start_date).format('MMM DD, YYYY')}</div>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dayjs(vehicle.warranty_end_date).format('MMM DD, YYYY')}</div>
              </div>
              {vehicle.warranty_months && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Duration</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{vehicle.warranty_months} months</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Stack>

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
