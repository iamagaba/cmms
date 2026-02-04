import { AlertCircle, Bike, CheckCircle, ClipboardList, Clock, Info, Mail, Plus, ChevronRight, Car, UserCircle, Phone, Edit, Clock as TimelineIcon, User } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';


import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Vehicle, WorkOrder } from '@/types/supabase';
import { getWorkOrderNumber } from '@/utils/work-order-display';
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
      <div className="w-full p-6">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-5 h-5 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Customer Not Found</h3>
            <p className="text-sm text-muted-foreground mb-4">The customer you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/customers')}>Back to Customers</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalWorkOrders = workOrders?.length || 0;
  const openWorkOrders = workOrders?.filter(wo => wo.status !== 'Completed' && wo.status !== 'Cancelled').length || 0;
  const completedWorkOrders = workOrders?.filter(wo => wo.status === 'Completed').length || 0;
  const totalVehicles = vehicles?.length || 0;

  // Customer type badge variants
  const customerTypeBadgeVariant = {
    'individual': 'success' as const,
    'business': 'warning' as const,
    'fleet': 'info' as const
  };

  return (
    <div className="w-full p-6">
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title={customer.name}
          subtitle={customer.company || undefined}
          icon={<User className="w-5 h-5 text-muted-foreground" />}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/work-orders?customer=${id}`)}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">View Work Orders</span>
                <span className="sm:hidden">Work Orders</span>
              </Button>
              <Button onClick={() => navigate(`/customers`)}>
                <Edit className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Edit Customer</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </>
          }
        />

        {/* Customer Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-2xl">
                {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold">{customer.name}</h1>
                {customer.company && (
                  <p className="text-sm text-muted-foreground mt-1">{customer.company}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant={customerTypeBadgeVariant[customer.customerType || 'individual']}>
                    {customer.customerType || 'Individual'}
                  </Badge>
                  {customer.email && (
                    <Badge variant="outline">
                      <Mail className="w-5 h-5 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Ribbon */}
        <Card>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            <button
              className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              onClick={() => navigate(`/assets?customer=${id}`)}
            >
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-4 h-4 text-muted-foreground dark:text-blue-400" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Vehicles</p>
              </div>
              <p className="text-2xl font-bold">{totalVehicles}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground dark:text-blue-400">
                <ChevronRight className="w-3 h-3" />
                <span>View vehicles</span>
              </div>
            </button>

            <button
              className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              onClick={() => navigate(`/work-orders?customer=${id}`)}
            >
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList className="w-5 h-5 text-primary" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Work Orders</p>
              </div>
              <p className="text-2xl font-bold">{totalWorkOrders}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                <ChevronRight className="w-3 h-3" />
                <span>View all</span>
              </div>
            </button>

            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Open Work Orders</p>
              </div>
              <p className="text-2xl font-bold">{openWorkOrders}</p>
              {openWorkOrders > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>Needs attention</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</p>
              </div>
              <p className="text-2xl font-bold">{completedWorkOrders}</p>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-muted-foreground" />
                Contact Information
              </CardTitle>
              {customer.phone && (
                <Button size="sm" asChild>
                  <a href={`tel:${customer.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Customer
                  </a>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {customer.phone && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Phone Number</div>
                    <div className="text-base font-medium text-slate-900">{customer.phone}</div>
                  </div>
                )}
                {customer.email && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Email Address</div>
                    <div className="text-base font-medium text-slate-900 truncate">{customer.email}</div>
                  </div>
                )}
                {customer.address && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Address</div>
                    <div className="text-base font-medium text-slate-900">{customer.address}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vehicles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-muted-foreground" />
                Vehicles
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/assets?customer=${id}`)}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {vehicles && vehicles.length > 0 ? (
                <div className="space-y-6">
                  {vehicles.slice(0, 5).map((vehicle, index) => (
                    <div key={vehicle.id}>
                      <button
                        className="group w-full text-left hover:bg-slate-50 -mx-6 px-6 py-4 transition-colors"
                        onClick={() => navigate(`/assets/${vehicle.id}`)}
                      >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">License Plate</div>
                            <div className="text-base font-medium text-slate-900 group-hover:text-primary transition-colors">
                              {vehicle.license_plate}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Make & Model</div>
                            <div className="text-base font-medium text-slate-900">
                              {vehicle.make} {vehicle.model}
                            </div>
                          </div>
                          {vehicle.year && (
                            <div>
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Year</div>
                              <div className="text-base font-medium text-slate-900">{vehicle.year}</div>
                            </div>
                          )}
                          {vehicle.vin && (
                            <div>
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">VIN</div>
                              <div className="text-base font-medium text-slate-900 font-mono text-sm">{vehicle.vin}</div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-xs text-primary">
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </button>
                      {index < vehicles.slice(0, 5).length - 1 && (
                        <div className="border-b border-border mt-6" />
                      )}
                    </div>
                  ))}
                  {vehicles.length > 5 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-4"
                      onClick={() => navigate(`/assets?customer=${id}`)}
                    >
                      View {vehicles.length - 5} more vehicles
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No Vehicles</p>
                  <p className="text-xs text-muted-foreground mb-4">This customer doesn't have any vehicles yet</p>
                  <Button size="sm" onClick={() => navigate(`/assets/new?customer=${id}`)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Service History
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/work-orders?customer=${id}`)}
                title="View in main table"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardHeader>

            {workOrders && workOrders.length > 0 ? (
              <CardContent className="p-6">
                <div className="space-y-4">
                  {workOrders.slice(0, 5).map((wo) => (
                    <button
                      key={wo.id}
                      className="group w-full border border-border rounded-lg p-4 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left"
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                              {getWorkOrderNumber(wo)}
                            </p>
                            <Badge variant={wo.status === 'Completed' ? 'completed' : wo.status === 'In Progress' ? 'in-progress' : 'open'}>
                              {wo.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {dayjs(wo.createdAt).format('MMM D, YYYY')} • {wo.description || 'No description'}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                  {workOrders.length > 5 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => navigate(`/work-orders?customer=${id}`)}
                    >
                      View {workOrders.length - 5} more work orders
                    </Button>
                  )}
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">No Service History</p>
                <p className="text-xs text-muted-foreground mb-4">This customer hasn't had any work orders yet</p>
                <Button size="sm" onClick={() => navigate(`/work-orders/new?customer=${id}`)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Work Order
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Additional Information */}
          {(customer.notes || customer.created_at) && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-muted-foreground" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {customer.created_at && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Customer Since</div>
                      <div className="text-base font-medium text-slate-900">
                        {dayjs(customer.created_at).format('MMMM D, YYYY')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {dayjs(customer.created_at).fromNow()}
                      </div>
                    </div>
                  )}
                  {customer.notes && (
                    <div className="sm:col-span-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</div>
                      <div className="text-base font-medium text-slate-900">{customer.notes}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
