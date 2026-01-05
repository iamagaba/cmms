import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserCircleIcon,
  ClipboardIcon,
  PencilEdit02Icon,
  Mail01Icon,
  Call02Icon,
  Car01Icon,
  LinkSquare02Icon,
  Clock01Icon,
  Alert01Icon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  Motorbike01Icon,
  TimelineIcon,
  Add01Icon,
  InformationCircleIcon,
  Location01Icon
} from '@hugeicons/core-free-icons';
import { Stack, Button, Skeleton } from '@/components/tailwind-components';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Vehicle, WorkOrder } from '@/types/supabase';
import { snakeToCamelCase } from '@/utils/data-helpers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch customer details
  const { data: customer, isLoading: loadingCustomer } = useQuery<Customer | null>({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return snakeToCamelCase(data) as Customer;
    },
    enabled: !!id
  });

  // Fetch customer's vehicles
  const { data: vehicles, isLoading: loadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['customer-vehicles', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(v => snakeToCamelCase(v)) as Vehicle[];
    },
    enabled: !!id
  });

  // Fetch customer's work orders
  const { data: workOrders, isLoading: loadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['customer-work-orders', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []).map(wo => snakeToCamelCase(wo)) as WorkOrder[];
    },
    enabled: !!id
  });

  const isLoading = loadingCustomer || loadingVehicles || loadingWorkOrders;

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

  if (!customer) {
    return (
      <div className="w-full px-6 py-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <HugeiconsIcon icon={Alert01Icon} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Customer Not Found</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">The customer you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/customers')}>Back to Customers</Button>
        </div>
      </div>
    );
  }

  const totalWorkOrders = workOrders?.length || 0;
  const openWorkOrders = workOrders?.filter(wo => wo.status !== 'Completed' && wo.status !== 'Cancelled').length || 0;
  const completedWorkOrders = workOrders?.filter(wo => wo.status === 'Completed').length || 0;
  const totalVehicles = vehicles?.length || 0;

  const customerTypeColors = {
    'individual': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    'business': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    'fleet': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  };

  return (
    <div className="w-full px-6 pt-2 pb-6">
      <Stack gap="md">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/customers')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="rotate-180" />
              Customers
            </button>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/work-orders?customer=${id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HugeiconsIcon icon={ClipboardIcon} size={16} />
              <span className="hidden sm:inline">View Work Orders</span>
              <span className="sm:hidden">Work Orders</span>
            </button>
            <button
              onClick={() => navigate(`/customers`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
              <span className="hidden sm:inline">Edit Customer</span>
              <span className="sm:hidden">Edit</span>
            </button>
          </div>
        </div>

        {/* Customer Header Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 text-primary-700 dark:text-primary-400 font-semibold text-2xl">
              {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{customer.name}</h1>
              {customer.company && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{customer.company}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded text-xs font-medium ${customerTypeColors[customer.customerType || 'individual']}`}>
                  {customer.customerType || 'Individual'}
                </span>
                {customer.email && (
                  <span className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <HugeiconsIcon icon={Mail01Icon} size={12} className="inline mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
            <div
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => navigate(`/assets?customer=${id}`)}
            >
              <div className="flex items-center gap-2 mb-1">
                <HugeiconsIcon icon={Car01Icon} className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Vehicles</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalVehicles}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3" />
                <span>View vehicles</span>
              </div>
            </div>

            <div
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => navigate(`/work-orders?customer=${id}`)}
            >
              <div className="flex items-center gap-2 mb-1">
                <HugeiconsIcon icon={ClipboardIcon} className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Work Orders</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalWorkOrders}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3" />
                <span>View all</span>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Open Work Orders</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{openWorkOrders}</p>
              {openWorkOrders > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <HugeiconsIcon icon={Alert01Icon} className="w-3 h-3" />
                  <span>Needs attention</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Completed</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedWorkOrders}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <HugeiconsIcon icon={UserCircleIcon} size={18} className="text-gray-600 dark:text-gray-400" />
                Contact Information
              </h3>
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <HugeiconsIcon icon={Call02Icon} size={14} />
                  Call Customer
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {customer.phone && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{customer.phone}</div>
                </div>
              )}
              {customer.email && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{customer.email}</div>
                </div>
              )}
              {customer.address && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{customer.address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Vehicles */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <HugeiconsIcon icon={Car01Icon} size={18} className="text-gray-600 dark:text-gray-400" />
                Vehicles
              </h3>
              <button
                onClick={() => navigate(`/assets?customer=${id}`)}
                className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                View All
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            </div>
            {vehicles && vehicles.length > 0 ? (
              <div className="space-y-2">
                {vehicles.slice(0, 5).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="group border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/30 dark:hover:bg-primary-900/20 transition-all cursor-pointer"
                    onClick={() => navigate(`/assets/${vehicle.id}`)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <HugeiconsIcon icon={Motorbike01Icon} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                            {vehicle.license_plate}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                          </p>
                        </div>
                      </div>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                ))}
                {vehicles.length > 5 && (
                  <button
                    onClick={() => navigate(`/assets?customer=${id}`)}
                    className="w-full py-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    View {vehicles.length - 5} more vehicles
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <HugeiconsIcon icon={Car01Icon} className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No Vehicles</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This customer doesn't have any vehicles yet</p>
                <button
                  onClick={() => navigate(`/assets/new?customer=${id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <HugeiconsIcon icon={Add01Icon} size={14} />
                  Add Vehicle
                </button>
              </div>
            )}
          </div>

          {/* Recent Work Orders */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <HugeiconsIcon icon={TimelineIcon} size={18} className="text-gray-600 dark:text-gray-400" />
                Service History
              </h3>
              <button
                onClick={() => navigate(`/work-orders?customer=${id}`)}
                className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                View All
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            </div>
            {workOrders && workOrders.length > 0 ? (
              <div className="space-y-2">
                {workOrders.slice(0, 5).map((wo) => {
                  const vehicle = vehicles?.find(v => v.id === wo.vehicleId);

                  return (
                    <div
                      key={wo.id}
                      className="group border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/30 dark:hover:bg-primary-900/20 transition-all cursor-pointer"
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                              {wo.workOrderNumber || `WO-${wo.id.substring(0, 6).toUpperCase()}`}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${wo.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              wo.status === 'In Progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                wo.status === 'On Hold' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                              {wo.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{wo.description || wo.service || 'General Service'}</p>
                        </div>
                        <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          {vehicle && (
                            <>
                              <HugeiconsIcon icon={Car01Icon} className="w-3 h-3" />
                              {vehicle.license_plate}
                            </>
                          )}
                        </span>
                        <span>{dayjs(wo.created_at).fromNow()}</span>
                      </div>
                    </div>
                  );
                })}
                {workOrders.length > 5 && (
                  <button
                    onClick={() => navigate(`/work-orders?customer=${id}`)}
                    className="w-full py-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    View {workOrders.length - 5} more work orders
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <HugeiconsIcon icon={ClipboardIcon} className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No Service History</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This customer hasn't had any work orders yet</p>
                <button
                  onClick={() => navigate(`/work-orders/new?customer=${id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <HugeiconsIcon icon={Add01Icon} size={14} />
                  Create Work Order
                </button>
              </div>
            )}
          </div>

          {/* Additional Information */}
          {(customer.notes || customer.created_at) && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <HugeiconsIcon icon={InformationCircleIcon} size={18} className="text-gray-600 dark:text-gray-400" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customer.notes && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{customer.notes}</div>
                  </div>
                )}
                {customer.created_at && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Customer Since</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {dayjs(customer.created_at).format('MMMM D, YYYY')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {dayjs(customer.created_at).fromNow()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Stack>
    </div>
  );
};

export default CustomerDetails;
