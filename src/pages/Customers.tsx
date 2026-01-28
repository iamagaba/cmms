import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Filter,
  Search,
  ExternalLink,
  Car,
  ClipboardList,
  Clock,
  Calendar,
  ArrowRight,
  Users,
  ArrowLeft
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Customer, Vehicle, WorkOrder } from "@/types/supabase";
import { snakeToCamelCase } from "@/utils/data-helpers";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

import { useMediaQuery } from '@/hooks/tailwind';

import { EnhancedWorkOrderDataTable } from "@/components/EnhancedWorkOrderDataTable";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";

// shadcn/ui components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from '@/components/ui/empty-state';

dayjs.extend(relativeTime);

const CustomersPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Fetch customers
  const { data: customers, isLoading: loadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(c => snakeToCamelCase(c)) as Customer[];
    },
  });

  // Fetch vehicles for customer counts
  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw error;
      return (data || []).map(v => snakeToCamelCase(v)) as Vehicle[];
    },
  });

  // Fetch work orders for customer activity
  const { data: workOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw error;
      return (data || []).map(wo => snakeToCamelCase(wo)) as WorkOrder[];
    },
  });

  // Fetch contextual data for the table
  const { locations, profiles, technicians, serviceCategories } = useWorkOrderData();

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!customers) return { total: 0, individual: 0, business: 0, fleet: 0 };

    return {
      total: customers.length,
      individual: customers.filter(c => c.customerType === 'individual').length,
      business: customers.filter(c => c.customerType === 'business').length,
      fleet: customers.filter(c => c.customerType === 'fleet').length,
    };
  }, [customers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];

    let filtered = customers;

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (customerTypeFilter !== 'all') {
      filtered = filtered.filter(c => (c.customerType || c.customer_type) === customerTypeFilter);
    }

    return filtered;
  }, [customers, searchTerm, customerTypeFilter]);

  // Get customer stats
  const getCustomerStats = (customerId: string) => {
    const customerVehicles = vehicles?.filter(v => v.customer_id === customerId) || [];
    const customerWorkOrders = workOrders?.filter(wo => wo.customer_id === customerId) || [];
    const openWorkOrders = customerWorkOrders.filter(wo => wo.status !== 'Completed' && wo.status !== 'Cancelled');

    return {
      vehicleCount: customerVehicles.length,
      totalWorkOrders: customerWorkOrders.length,
      openWorkOrders: openWorkOrders.length,
    };
  };

  const hasActiveFilters = searchTerm || customerTypeFilter !== 'all';
  const isLoading = loadingCustomers;

  const handleClearFilters = () => {
    setSearchTerm('');
    setCustomerTypeFilter('all');
  };

  const handleViewDetails = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const selectedCustomer = selectedCustomerId ? customers?.find(c => c.id === selectedCustomerId) : null;
  const selectedCustomerStats = selectedCustomerId ? getCustomerStats(selectedCustomerId) : null;

  return (
    <div className="flex h-[calc(100vh-2rem)] w-full overflow-hidden">
      {/* Left Panel - Customer List */}
      <div className="w-full sm:w-80 border-r flex flex-col">
        {/* Header */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold">Customers</h1>
            <Button
              variant={filtersOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="w-7 p-0"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search customers..."
              aria-label="Search customers"
              className="pl-8 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          {filtersOpen && (
            <div className="mt-3 pt-2 border-t">
              <div className="mb-3">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Customer Type</label>
                <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="WATU">WATU</SelectItem>
                    <SelectItem value="B2B">B2B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6 text-muted-foreground" />}
              title="No customers found"
              description={hasActiveFilters ? "Try adjusting your filters" : "Add your first customer"}
            />
          ) : (
            <div className="divide-y">
              {filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                const isSelected = selectedCustomerId === customer.id;
                const customerType = customer.customerType || customer.customer_type || 'Unknown';

                return (
                  <button
                    key={customer.id}
                    className={`w-full text-left p-2.5 transition-colors hover:bg-accent ${isSelected ? 'bg-accent border-l-2 border-l-primary' : ''
                      }`}
                    onClick={() => handleViewDetails(customer.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="text-sm font-medium truncate">
                            {customer.name}
                          </h3>
                          <Badge variant={customerType === 'WATU' ? 'default' : 'secondary'} className="text-xs h-3.5 px-1">
                            {customerType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Car className="w-3 h-3" />
                            {stats.vehicleCount}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <ClipboardList className="w-3 h-3" />
                            {stats.totalWorkOrders}
                          </span>
                          {stats.openWorkOrders > 0 && (
                            <Badge variant="outline" className="text-xs h-3.5 px-1">
                              {stats.openWorkOrders}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Customer Details */}
      <div className={`${isMobile ? (selectedCustomerId ? 'flex-1 w-full' : 'hidden') : 'flex-1'} flex flex-col`}>
        {selectedCustomer ? (
          <>
            {/* Header */}
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomerId(null)}
                      className="mr-1 -ml-1 h-7 w-7 p-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="text-sm">
                      {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-base font-semibold">{selectedCustomer.name}</h2>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/customers/${selectedCustomer.id}`)}
                  className="text-xs h-7"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Details
                </Button>
              </div>
            </div>

            {/* Stats Ribbon */}
            <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vehicles</p>
                </div>
                <p className="text-xl font-bold">{selectedCustomerStats?.vehicleCount || 0}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                </div>
                <p className="text-xl font-bold">{selectedCustomerStats?.totalWorkOrders || 0}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Open</p>
                </div>
                <p className="text-xl font-bold">{selectedCustomerStats?.openWorkOrders || 0}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Since</p>
                </div>
                <p className="text-sm font-semibold">
                  {dayjs(selectedCustomer.created_at).format('MMM YYYY')}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 overscroll-y-contain">
              <div className="space-y-4">
                {/* Contact Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedCustomer.phone && (
                        <div className="bg-muted rounded-md p-2.5">
                          <div className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wide">Phone</div>
                          <div className="text-sm font-semibold">{selectedCustomer.phone}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Work Order History</CardTitle>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate(`/work-orders?customer=${selectedCustomer.id}`)}
                        className="h-auto p-0 text-xs"
                      >
                        View All <ArrowRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pt-0">
                    {workOrders && workOrders.filter(wo => wo.customer_id === selectedCustomer.id).length > 0 ? (
                      <EnhancedWorkOrderDataTable
                        workOrders={workOrders.filter(wo => wo.customer_id === selectedCustomer.id)}
                        technicians={technicians}
                        locations={locations}
                        customers={customers ? [selectedCustomer] : []}
                        vehicles={vehicles || []}
                        profiles={profiles}
                        serviceCategories={serviceCategories}
                        onEdit={(wo) => navigate(`/work-orders/${wo.id}`)}
                        onDelete={() => { }}
                        onUpdateWorkOrder={() => { }}
                        onViewDetails={(id) => navigate(`/work-orders/${id}`)}
                        enableBulkActions={false}
                        enableAdvancedFilters={false}
                        enableExport={false}
                        compactMode={true}
                        visibleColumns={['workOrderNumber', 'status', 'priority', 'createdAt', 'service']}
                      />
                    ) : (
                      <EmptyState
                        icon={<ClipboardList className="w-6 h-6 text-muted-foreground" />}
                        title="No work orders yet"
                        description="Work orders will appear here"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">Select a Customer</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Choose a customer from the list to view their details, vehicles, and service history.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;


