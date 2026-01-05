/**
 * Professional CMMS Dashboard
 * 
 * A sophisticated, data-driven dashboard designed specifically for maintenance
 * management operations. Features real-time metrics, actionable insights,
 * and contextual information for maintenance teams.
 * 
 * MIGRATED TO ENTERPRISE DESIGN SYSTEM ✅
 */

import { useState, useMemo } from "react";
import { Title } from '@/components/tailwind-components';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  RefreshIcon,
  Add01Icon,
  Task01Icon,
  Folder01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Location, Vehicle } from "@/types/supabase";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { useSearchParams, useNavigate } from "react-router-dom";
import { useRealtimeData } from "@/context/RealtimeDataContext";

// Enterprise Design System Components
// (Panel components removed - using direct divs with enterprise styling)
import { StatRibbon } from "@/components/dashboard/StatRibbon";
import { WorkOrderTrendsChart } from "@/components/dashboard/WorkOrderTrendsChart";
import { PriorityWorkOrders } from "@/components/dashboard/PriorityWorkOrders";
import { TechniciansList } from "@/components/dashboard/TechniciansList";

// Legacy Components
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import WorkOrderDetailsDrawer from "@/components/WorkOrderDetailsDrawer";

dayjs.extend(isBetween);

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const ProfessionalCMMSDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation] = useState<string>('all');
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);

  // Data queries
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Safe access to realtime data
  const {
    realtimeWorkOrders = [],
    realtimeTechnicians = [],
    isLoadingRealtimeData = false
  } = useRealtimeData() || {};

  const isLoading = isLoadingLocations || isLoadingRealtimeData;

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutations


  // Event handlers
  const handleViewDetails = (workOrderId: string) => {
    setSearchParams({ view: workOrderId });
  };

  const handleCloseDrawer = () => {
    setSearchParams({});
  };

  // Calculate metrics from realtime work orders
  const metrics = useMemo(() => {
    if (!realtimeWorkOrders || realtimeWorkOrders.length === 0) {
      return {
        totalOrders: 0,
        openOrders: 0,
        completedToday: 0,
        overdueOrders: 0,
        avgResponseTime: '0h',
        weeklyTrend: 0
      };
    }

    const now = dayjs();
    const today = now.startOf('day');
    const weekAgo = now.subtract(7, 'days');

    const totalOrders = realtimeWorkOrders.length;
    const openOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.status === 'Open' || wo.status === 'In Progress'
    ).length;
    const completedToday = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.status === 'Completed' && dayjs(wo.updated_at).isAfter(today)
    ).length;
    const overdueOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      wo.dueDate && dayjs(wo.dueDate).isBefore(now) && wo.status !== 'Completed'
    ).length;

    // Calculate weekly trend
    const thisWeekOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      dayjs(wo.created_at).isAfter(weekAgo)
    ).length;
    const lastWeekOrders = realtimeWorkOrders.filter((wo: WorkOrder) =>
      dayjs(wo.created_at).isBetween(weekAgo.subtract(7, 'days'), weekAgo)
    ).length;
    const weeklyTrend = lastWeekOrders > 0
      ? ((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100
      : 0;

    return {
      totalOrders,
      openOrders,
      completedToday,
      overdueOrders,
      avgResponseTime: '0h',
      weeklyTrend
    };
  }, [realtimeWorkOrders]);



  const filteredWorkOrders = useMemo(() => {
    if (!realtimeWorkOrders) return [];
    return selectedLocation === 'all'
      ? realtimeWorkOrders
      : realtimeWorkOrders.filter((wo: WorkOrder) => wo.locationId === selectedLocation);
  }, [realtimeWorkOrders, selectedLocation]);



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <Title order={1} className="font-brand font-bold text-machinery-900 tracking-tight">
              Operations Dashboard
            </Title>
            <p className="text-sm text-gray-600 mt-1">
              {dayjs().format('dddd, MMMM D, YYYY')} • {locations?.length || 0} locations active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-2 h-9 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
            >
              <HugeiconsIcon icon={RefreshIcon} size={16} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/work-orders')}
              className="inline-flex items-center gap-1.5 px-3 py-2 h-9 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
            >
              <HugeiconsIcon icon={Add01Icon} size={16} />
              New Work Order
            </button>
          </div>
        </div>

        {/* Stat Ribbon - Enterprise Design */}
        <StatRibbon
          stats={[
            {
              title: "Total Work Orders",
              value: metrics.totalOrders,
              subtitle: `${metrics.weeklyTrend >= 0 ? '+' : ''}${typeof metrics.weeklyTrend === 'number' ? metrics.weeklyTrend.toFixed(1) : '0'}% vs last week`,
              icon: Task01Icon,
              color: "primary",
              onClick: () => navigate('/work-orders')
            },
            {
              title: "Open Orders",
              value: metrics.openOrders,
              icon: Folder01Icon,
              color: "amber",
              onClick: () => navigate('/work-orders?status=open')
            },
            {
              title: "Completed Today",
              value: metrics.completedToday,
              icon: CheckmarkCircle01Icon,
              color: "emerald"
            },
            {
              title: "Overdue Orders",
              value: metrics.overdueOrders,
              icon: AlertCircleIcon,
              color: "red",
              onClick: () => navigate('/work-orders?status=overdue')
            }
          ]}
        />

        {/* Main Content Grid - Enterprise Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Trends Chart */}
            <WorkOrderTrendsChart data={[]} />

            <PriorityWorkOrders
              workOrders={filteredWorkOrders}
              vehicles={vehicles || []}
              onViewDetails={handleViewDetails}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <TechniciansList
              technicians={realtimeTechnicians}
              workOrders={filteredWorkOrders}
            />
          </div>
        </div>
      </div>

      {onHoldWorkOrder && (
        <OnHoldReasonDialog
          isOpen={!!onHoldWorkOrder}
          onClose={() => setOnHoldWorkOrder(null)}
          onSave={() => setOnHoldWorkOrder(null)}
        />
      )}

      <WorkOrderDetailsDrawer
        onClose={handleCloseDrawer}
        workOrderId={searchParams.get('view') || undefined}
        open={!!searchParams.get('view')}
      />
    </div>
  );
};

export default ProfessionalCMMSDashboard;