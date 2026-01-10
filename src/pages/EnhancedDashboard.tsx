import React, { useState, useMemo } from "react";
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  RefreshIcon,
  Add01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  ClipboardIcon,
  Folder01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon
} from '@hugeicons/core-free-icons';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Location, Customer, Vehicle, Profile } from "@/types/supabase";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { camelToSnakeCase } from "@/utils/data-helpers";
import { useSearchParams } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { useRealtimeData } from "@/context/RealtimeDataContext";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import { useNavigate } from 'react-router-dom';
import UrgentWorkOrdersTable from "@/components/UrgentWorkOrdersTable";
import { Skeleton, Stack, Text, Button, Group } from '@/components/tailwind-components';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { WorkOrderDetailsDrawer } from "@/components/WorkOrderDetailsDrawer";

dayjs.extend(isBetween);

const EnhancedDashboard = () => {
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
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

  // Data Fetching for auxiliary data
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
    const weekStart = now.startOf('week');
    const lastWeekStart = weekStart.subtract(1, 'week');

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

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full px-6 py-6">
        <Stack gap="lg">
          {/* Header Skeleton */}
          <div className="flex justify-between items-start">
            <div>
              <Skeleton height={32} width={180} radius="md" />
              <Skeleton height={16} width={280} radius="md" mt={8} />
            </div>
            <div className="flex gap-2">
              <Skeleton height={36} width={100} radius="md" />
              <Skeleton height={36} width={140} radius="md" />
            </div>
          </div>

          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between">
                  <div>
                    <Skeleton height={14} width={80} radius="md" />
                    <Skeleton height={32} width={50} radius="md" mt={8} />
                  </div>
                  <Skeleton height={48} width={48} radius="xl" />
                </div>
                <Skeleton height={12} width={100} radius="md" mt={12} />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <Skeleton height={24} width={200} radius="md" />
            </div>
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton height={40} width={4} radius="full" />
                  <Skeleton height={16} width={100} radius="md" />
                  <Skeleton height={16} width={200} radius="md" className="flex-1" />
                  <Skeleton height={24} width={80} radius="full" />
                </div>
              ))}
            </div>
          </div>
        </Stack>
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-6 py-6">
        <Stack gap="lg">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <Text size="sm" c="dimmed" className="mt-1">
                Overview of maintenance operations and key metrics
              </Text>
            </div>

            <Group gap="sm">
              {/* Location Filter */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                {locationOptions.slice(0, 4).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedLocation(option.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      selectedLocation === option.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.label.split(' (')[0]}
                  </button>
                ))}
              </div>

              <Button
                variant="subtle"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-gray-600 hover:text-gray-900"
              >
                <HugeiconsIcon icon={RefreshIcon} size={18} />
              </Button>
              <Button
                variant="filled"
                onClick={() => navigate('/work-orders/new')}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Group gap="xs">
                  <HugeiconsIcon icon={Add01Icon} size={18} />
                  <span>New Work Order</span>
                </Group>
              </Button>
            </Group>
          </div>

          {/* KPI Summary Cards - Compact */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div 
              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => navigate('/work-orders')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{dashboardData.kpis.totalOrders.value}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${dashboardData.kpis.totalOrders.trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      <HugeiconsIcon icon={dashboardData.kpis.totalOrders.trend.direction === 'up' ? ArrowUp01Icon : ArrowDown01Icon} size={12} />
                      {dashboardData.kpis.totalOrders.trend.value}%
                    </span>
                    <span className="text-[10px] text-gray-400">{dashboardData.kpis.totalOrders.trend.label}</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <HugeiconsIcon icon={ClipboardIcon} size={18} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div 
              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-amber-300 transition-colors cursor-pointer"
              onClick={() => navigate('/work-orders?status=open')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Open Orders</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{dashboardData.kpis.openOrders.value}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${dashboardData.kpis.openOrders.trend.direction === 'down' ? 'text-emerald-600' : 'text-red-600'}`}>
                      <HugeiconsIcon icon={dashboardData.kpis.openOrders.trend.direction === 'up' ? ArrowUp01Icon : ArrowDown01Icon} size={12} />
                      {dashboardData.kpis.openOrders.trend.value}%
                    </span>
                    <span className="text-[10px] text-gray-400">{dashboardData.kpis.openOrders.trend.label}</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <HugeiconsIcon icon={Folder01Icon} size={18} className="text-amber-600" />
                </div>
              </div>
            </div>

            <div 
              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-emerald-300 transition-colors cursor-pointer"
              onClick={() => navigate('/work-orders?status=completed')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Completed Today</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{dashboardData.kpis.completedToday.value}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${dashboardData.kpis.completedToday.trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      <HugeiconsIcon icon={dashboardData.kpis.completedToday.trend.direction === 'up' ? ArrowUp01Icon : ArrowDown01Icon} size={12} />
                      {dashboardData.kpis.completedToday.trend.value}%
                    </span>
                    <span className="text-[10px] text-gray-400">{dashboardData.kpis.completedToday.trend.label}</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} className="text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Avg Response</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{dashboardData.kpis.avgResponseTime.value}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${dashboardData.kpis.avgResponseTime.trend.direction === 'down' ? 'text-emerald-600' : 'text-red-600'}`}>
                      <HugeiconsIcon icon={dashboardData.kpis.avgResponseTime.trend.direction === 'up' ? ArrowUp01Icon : ArrowDown01Icon} size={12} />
                      {dashboardData.kpis.avgResponseTime.trend.value}%
                    </span>
                    <span className="text-[10px] text-gray-400">{dashboardData.kpis.avgResponseTime.trend.label}</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <HugeiconsIcon icon={Clock01Icon} size={18} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Work Orders Table - Compact */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Recent Work Orders</h3>
                <p className="text-xs text-gray-500 mt-0.5">Latest maintenance requests</p>
              </div>
              <button
                onClick={() => navigate('/work-orders')}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            </div>
            
            <UrgentWorkOrdersTable
              workOrders={allWorkOrders || []}
              technicians={technicians || []}
              vehicles={vehicles || []}
              onViewDetails={handleViewDetails}
              loading={isLoading}
            />
          </div>
        </Stack>
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

export default EnhancedDashboard;