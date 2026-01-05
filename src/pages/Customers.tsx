import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FilterIcon,
  Search01Icon,
  LinkSquare02Icon,
  Car01Icon,
  ClipboardIcon,
  Clock01Icon,
  Calendar01Icon,
  ArrowRight01Icon,
  UserMultipleIcon
} from '@hugeicons/core-free-icons';
import { supabase } from "@/integrations/supabase/client";
import { Customer, Vehicle, WorkOrder } from "@/types/supabase";
import { snakeToCamelCase } from "@/utils/data-helpers";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

import { useMediaQuery } from '@/hooks/tailwind';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';

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
    const customerVehicles = vehicles?.filter(v => v.customerId === customerId) || [];
    const customerWorkOrders = workOrders?.filter(wo => wo.customerId === customerId) || [];
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
    <div className="flex h-[calc(100vh-2rem)] w-full bg-white dark:bg-gray-950 overflow-hidden">
      {/* Left Panel - Customer List */}
      <div className={`${isMobile ? (selectedCustomerId ? 'hidden' : 'w-full') : 'w-80'} border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900`}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customers</h1>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`p-2 rounded-lg transition-colors ${filtersOpen ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <HugeiconsIcon icon={FilterIcon} size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={16} className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          {filtersOpen && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Customer Type</label>
                <select
                  value={customerTypeFilter}
                  onChange={(e) => setCustomerTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="Cash">Cash</option>
                  <option value="WATU">WATU</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <HugeiconsIcon icon={UserMultipleIcon} size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No customers found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasActiveFilters ? "Try adjusting your filters" : "Add your first customer"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                const isSelected = selectedCustomerId === customer.id;

                return (
                  <div
                    key={customer.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' : ''
                      }`}
                    onClick={() => handleViewDetails(customer.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm flex-shrink-0">
                        {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {customer.name}
                          </h3>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${(customer.customerType || customer.customer_type) === 'Cash' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                            (customer.customerType || customer.customer_type) === 'B2B' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            }`}>
                            {customer.customerType || customer.customer_type || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span>{stats.vehicleCount} vehicles</span>
                          <span>{stats.totalWorkOrders} orders</span>
                          {stats.openWorkOrders > 0 && (
                            <span className="text-amber-600 dark:text-amber-400">{stats.openWorkOrders} open</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Customer Details */}
      <div className={`${isMobile ? (selectedCustomerId ? 'flex-1 w-full' : 'hidden') : 'flex-1'} flex flex-col bg-white dark:bg-gray-950`}>
        {selectedCustomer ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button
                      onClick={() => setSelectedCustomerId(null)}
                      className="mr-2 p-1 -ml-2 text-gray-500 hover:text-gray-900"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
                    </button>
                  )}
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-lg">
                    {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedCustomer.name}</h2>
                    {/* Removed company display as it does not exist in type */}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/customers/${selectedCustomer.id}`)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <HugeiconsIcon icon={LinkSquare02Icon} size={16} className="mr-1.5" />
                    View Full Details
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Ribbon */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={Car01Icon} size={16} className="text-blue-600 dark:text-blue-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicles</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedCustomerStats?.vehicleCount || 0}</p>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={ClipboardIcon} size={16} className="text-primary-600 dark:text-primary-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Orders</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedCustomerStats?.totalWorkOrders || 0}</p>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={Clock01Icon} size={16} className="text-amber-600 dark:text-amber-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Open Orders</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedCustomerStats?.openWorkOrders || 0}</p>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={Calendar01Icon} size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Customer Since</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {dayjs(selectedCustomer.created_at).format('MMM YYYY')}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 overscroll-y-contain">
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedCustomer.phone && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedCustomer.phone}</div>
                      </div>
                    )}
                    {/* Removed Email and Address as they do not exist in type */}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                    <button
                      onClick={() => navigate(`/work-orders?customer=${selectedCustomer.id}`)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {workOrders
                      ?.filter(wo => wo.customerId === selectedCustomer.id)
                      .slice(0, 5)
                      .map((wo) => {
                        const vehicle = vehicles?.find(v => v.id === wo.vehicleId);
                        return (
                          <div
                            key={wo.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all cursor-pointer"
                            onClick={() => navigate(`/work-orders/${wo.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {wo.workOrderNumber || `WO-${wo.id.substring(0, 6).toUpperCase()}`}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${wo.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' :
                                    wo.status === 'In Progress' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' :
                                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                    }`}>
                                    {wo.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                  {vehicle && (
                                    <span className="flex items-center gap-1">
                                      <HugeiconsIcon icon={Car01Icon} size={12} />
                                      {vehicle.license_plate}
                                    </span>
                                  )}
                                  <span>{dayjs(wo.created_at).fromNow()}</span>
                                </div>
                              </div>
                              <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-gray-400 dark:text-gray-500" />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon icon={UserMultipleIcon} size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Customer</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
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
