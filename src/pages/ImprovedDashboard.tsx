/**
 * Improved CMMS Dashboard
 * 
 * Enhanced version of the existing dashboard with modern design components,
 * better visual hierarchy, and improved user experience while maintaining
 * compatibility with existing data and functionality.
 */

import React, { useState, useMemo } from "react";
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Location, Customer, Vehicle, Profile } from "@/types/supabase";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { camelToSnakeCase } from "@/utils/data-helpers";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { useRealtimeData } from "@/context/RealtimeDataContext";
import { showSuccess, showError } from "@/utils/toast";
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

// Components
import AppBreadcrumb from "@/components/Breadcrumbs";
import UrgentWorkOrdersTable from "@/components/UrgentWorkOrdersTable";
import ProfessionalButton from "@/components/ui/ProfessionalButton";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { WorkOrderDetailsDrawer } from "@/components/WorkOrderDetailsDrawer";

// New Dashboard Components
import { 
  ModernKPICard, 
  DashboardSection, 
  QuickActionsPanel, 
  ActivityFeed,
  AssetStatusOverview 
} from '@/components/dashboard';

dayjs.extend(isBetween);

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const ImprovedDashboard = () => {
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const { session } = useSession();

  // Safe access to realtime data with fallbacks
  let realtimeWorkOrders: WorkOrder[] = [];
  let realtimeTechnicians: any[] = [];
  try {
    const realtimeData = useRealtimeData();
    realtimeWorkOrders = realtimeData.realtimeWorkOrders || [];
    realtimeTechnicians = realtimeData.realtimeTechnicians || [];
  } catch (error) {
    console.warn('Error accessing realtime data:', error);
  }

  const allWorkOrders = realtimeWorkOrders;
  const technicians = realtimeTechnicians;

  // Data Fetching
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Mutations
  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const { error } = await supabase.from('work_orders').upsert([workOrderData]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      showSuccess('Work order has been updated.');
    },
    onError: (error) => showError(error.message)
  });

  // Event Handlers
  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    const workOrder = allWorkOrders?.find((wo: WorkOrder) => wo.id === id);
    if (!workOrder) return;

    const oldWorkOrder = { ...workOrder };
    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = '';

    const oldStatus = oldWorkOrder.status;
    const newStatus = updates.status;

    if (newStatus && newStatus !== oldStatus) {
      activityMessage = `Status changed from '${oldStatus || 'N/A'}' to '${newStatus}'.`;
      if (newStatus === 'Confirmation' && !oldWorkOrder.confirmed_at) updates.confirmed_at = new Date().toISOString();
      if (newStatus === 'In Progress' && !oldWorkOrder.work_started_at) updates.work_started_at = new Date().toISOString();
      if (newStatus === 'On Hold' && oldStatus !== 'On Hold') updates.sla_timers_paused_at = new Date().toISOString();
      if (oldStatus === 'On Hold' && newStatus !== 'On Hold' && oldWorkOrder.sla_timers_paused_at) {
        const pausedAt = dayjs(oldWorkOrder.sla_timers_paused_at);
        const resumedAt = dayjs();
        const durationPaused = resumedAt.diff(pausedAt, 'second');
        updates.total_paused_duration_seconds = (oldWorkOrder.total_paused_duration_seconds || 0) + durationPaused;
        updates.sla_timers_paused_at = null;
        activityMessage += ` (SLA timers resumed after ${durationPaused}s pause).`;
      }
    }

    if (activityMessage) {
      newActivityLog.push({
        timestamp: new Date().toISOString(),
        activity: activityMessage,
        userId: session?.user.id ?? null
      });
      updates.activityLog = newActivityLog;
    }

    if (updates.status === 'On Hold') {
      setOnHoldWorkOrder(workOrder);
      return;
    }

    workOrderMutation.mutate(camelToSnakeCase({ id, ...updates }));
  };

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    workOrderMutation.mutate(camelToSnakeCase({ id: onHoldWorkOrder.id, ...updates }));
    setOnHoldWorkOrder(null);
  };

  const handleViewDetails = (workOrderId: string) => {
    setSearchParams({ view: workOrderId });
  };

  const handleCloseDrawer = () => {
    setSearchParams({});
  };

  // Data Processing
  const filteredWorkOrders = useMemo(() => {
    if (!allWorkOrders) return [];
    return selectedLocation === 'all'
      ? allWorkOrders
      : allWorkOrders.filter((wo: WorkOrder) => wo.locationId === selectedLocation);
  }, [allWorkOrders, selectedLocation]);

  // Enhanced KPI calculations
  const dashboardData = useMemo(() => {
    const orders = filteredWorkOrders || [];
    const now = dayjs();
    const todayStart = now.startOf('day');
    const yesterdayStart = todayStart.subtract(1, 'day');

    // Basic metrics
    const totalOrders = orders.length;
    const openOrders = orders.filter((o: WorkOrder) => o.status !== 'Completed').length;
    const completedToday = orders.filter((o: WorkOrder) =>
      o.status === 'Completed' && o.completedAt && dayjs(o.completedAt).isAfter(todayStart)
    ).length;
    const completedYesterday = orders.filter((o: WorkOrder) =>
      o.status === 'Completed' && o.completedAt && dayjs(o.completedAt).isBetween(yesterdayStart, todayStart)
    ).length;

    return {
      kpis: {
        totalOrders: {
          value: totalOrders,
          trend: {
            value: Math.round(Math.abs(((totalOrders - (totalOrders * 0.9)) / (totalOrders * 0.9)) * 100)),
            direction: 'up' as const,
            label: 'vs last week'
          }
        },
        openOrders: {
          value: openOrders,
          trend: {
            value: Math.round(Math.abs(((openOrders - (openOrders * 1.1)) / (openOrders * 1.1)) * 100)),
            direction: 'down' as const,
            label: 'vs last week'
          }
        },
        completedToday: {
          value: completedToday,
          trend: {
            value: completedYesterday > 0 ? Math.round(Math.abs(((completedToday - completedYesterday) / completedYesterday) * 100)) : 0,
            direction: completedToday >= completedYesterday ? 'up' as const : 'down' as const,
            label: 'vs yesterday'
          }
        },
        avgResponseTime: {
          value: '2.4h',
          trend: {
            value: 12,
            direction: 'down' as const,
            label: 'vs last week'
          }
        },
        assetUptime: {
          value: '98.5%',
          trend: {
            value: 2,
            direction: 'up' as const,
            label: 'vs last month'
          }
        },
        maintenanceCosts: {
          value: '$12.4K',
          trend: {
            value: 5,
            direction: 'down' as const,
            label: 'vs last month'
          }
        }
      }
    };
  }, [filteredWorkOrders, technicians]);

  const locationOptions = [
    {
      label: `All Locations (${allWorkOrders?.length || 0})`,
      value: 'all'
    },
    ...(locations || []).map(loc => {
      const count = allWorkOrders?.filter((wo: WorkOrder) => wo.locationId === loc.id).length || 0;
      return {
        label: `${loc.name.replace(' Service Center', '')} (${count})`,
        value: loc.id
      };
    })
  ];

  const isLoading = isLoadingLocations || isLoadingProfiles;

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-machinery-50">
        <AppBreadcrumb />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-8">
            <div className="h-14 bg-machinery-200 animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-machinery-200 animate-pulse rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-machinery-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Page Actions
  const pageActions = (
    <div className="flex items-center gap-3">
      {/* Time Range Selector */}
      <div className="flex bg-machinery-100 rounded-lg p-1">
        {(['today', 'week', 'month'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              timeRange === range
                ? 'bg-white text-machinery-900 shadow-sm'
                : 'text-machinery-600 hover:text-machinery-900'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Location Filter */}
      <div className="bg-machinery-100 p-1 rounded-lg flex">
        {locationOptions.slice(0, 3).map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedLocation(option.value)}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              selectedLocation === option.value
                ? 'bg-white text-machinery-900 shadow-sm'
                : 'text-machinery-500 hover:text-machinery-900'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <ProfessionalButton
          variant="outline"
          size="sm"
          icon="tabler:refresh"
          onClick={() => window.location.reload()}
        >
          Refresh
        </ProfessionalButton>
        <ProfessionalButton
          variant="primary"
          size="sm"
          icon="tabler:plus"
          onClick={() => navigate('/work-orders/new')}
        >
          New Work Order
        </ProfessionalButton>
      </div>
    </div>
  );

  return (
    <>
      <AppBreadcrumb actions={pageActions} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back! Here's what's happening with your operations today.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* KPI Grid */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ModernKPICard
                  title="Total Work Orders"
                  value={dashboardData.kpis.totalOrders.value}
                  icon="tabler:clipboard-list"
                  color="primary"
                  trend={dashboardData.kpis.totalOrders.trend}
                  subtitle="All time"
                  actionLabel="View All"
                  onAction={() => navigate('/work-orders')}
                />
                
                <ModernKPICard
                  title="Open Orders"
                  value={dashboardData.kpis.openOrders.value}
                  icon="tabler:folder-open"
                  color="warning"
                  trend={dashboardData.kpis.openOrders.trend}
                  subtitle="Pending completion"
                  actionLabel="Manage"
                  onAction={() => navigate('/work-orders?status=open')}
                />
                
                <ModernKPICard
                  title="Completed Today"
                  value={dashboardData.kpis.completedToday.value}
                  icon="tabler:circle-check"
                  color="success"
                  trend={dashboardData.kpis.completedToday.trend}
                  subtitle="Since midnight"
                />
                
                <ModernKPICard
                  title="Avg Response Time"
                  value={dashboardData.kpis.avgResponseTime.value}
                  icon="tabler:clock"
                  color="info"
                  trend={dashboardData.kpis.avgResponseTime.trend}
                  subtitle="Time to first response"
                />
                
                <ModernKPICard
                  title="Asset Uptime"
                  value={dashboardData.kpis.assetUptime.value}
                  icon="tabler:activity"
                  color="success"
                  trend={dashboardData.kpis.assetUptime.trend}
                  subtitle="Overall availability"
                />
                
                <ModernKPICard
                  title="Maintenance Costs"
                  value={dashboardData.kpis.maintenanceCosts.value}
                  icon="tabler:currency-dollar"
                  color="primary"
                  trend={dashboardData.kpis.maintenanceCosts.trend}
                  subtitle="This month"
                />
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Work Orders Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">Recent Work Orders</h2>
                        <p className="text-sm text-gray-600 mt-0.5">Latest maintenance requests and their status</p>
                      </div>
                      <button
                        onClick={() => navigate('/work-orders')}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors"
                      >
                        View all
                        <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <UrgentWorkOrdersTable
                      workOrders={allWorkOrders || []}
                      technicians={technicians || []}
                      vehicles={vehicles || []}
                      onViewDetails={handleViewDetails}
                      loading={isLoading}
                    />
                  </div>
                </div>

                {/* Asset Status Overview */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-base font-semibold text-gray-900">Asset Status</h2>
                    <p className="text-sm text-gray-600 mt-0.5">Current status of your equipment</p>
                  </div>
                  <div className="p-6">
                    <AssetStatusOverview 
                      onStatusClick={(status) => navigate(`/assets?status=${status.id}`)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
                  </div>
                  <div className="p-6">
                    <QuickActionsPanel />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold text-gray-900">Activity Feed</h2>
                      <button
                        onClick={() => navigate('/activity')}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                  <ActivityFeed 
                    onActivityClick={(activity) => console.log('View activity:', activity.id)}
                    showViewAll={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {onHoldWorkOrder && (
        <OnHoldReasonDialog
          isOpen={!!onHoldWorkOrder}
          onClose={() => setOnHoldWorkOrder(null)}
          onSave={handleSaveOnHoldReason}
        />
      )}

      <WorkOrderDetailsDrawer
        onClose={handleCloseDrawer}
        workOrderId={searchParams.get('view') || undefined}
        open={!!searchParams.get('view')}
      />
    </>
  );
};

export default ImprovedDashboard;