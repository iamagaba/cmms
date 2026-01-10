import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  Wrench01Icon,
  UserIcon,
  ClipboardIcon,
  Car01Icon,
  Tag01Icon as TagIcon,
  PackageIcon,
  File01Icon as FileIcon,
  TimelineIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Flag01Icon as FlagIcon,
  Coins01Icon as CoinsDollarIcon,
  BarChartIcon as Chart01Icon,
  ChartHistogramIcon,
  ChartLineData01Icon,
  TableIcon,
  Car01Icon as TruckIcon,
  ActivityIcon as Activity01Icon,
  Calendar01Icon as CalendarCheckIn01Icon,
  Invoice01Icon as ReceiptDollarIcon,
} from '@hugeicons/core-free-icons';
import { Link, useSearchParams } from 'react-router-dom';
import { Stack, Button, Group, Card, Badge, Skeleton, Select, Tabs } from '@/components/tailwind-components';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Vehicle } from '@/types/supabase';
import dayjs from 'dayjs';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { professionalColors } from '@/theme/professional-colors';
import InventoryReport from '@/components/reports/InventoryReport';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

type ReportType = 'overview' | 'technician' | 'workorder' | 'asset' | 'financial' | 'inventory' | 'fleet';
type DateRange = '7days' | '30days' | '90days' | 'year' | 'custom';

const Reports: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as ReportType | null;
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();

  const [reportType, setReportType] = useState<ReportType>(tabFromUrl || 'overview');
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

  // Update report type when URL changes
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== reportType) {
      setReportType(tabFromUrl);
    }
  }, [tabFromUrl, reportType]);

  // Update date range when selection changes
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    const today = dayjs();

    switch (range) {
      case '7days':
        setStartDate(today.subtract(7, 'days').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
      case '30days':
        setStartDate(today.subtract(30, 'days').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
      case '90days':
        setStartDate(today.subtract(90, 'days').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
      case 'year':
        setStartDate(today.subtract(1, 'year').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
    }
  };

  // Fetch work orders
  const { data: workOrders, isLoading: loadingWorkOrders } = useQuery({
    queryKey: ['work-orders-reports', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*, technician:technicians(*), customer:customers(*), vehicle:vehicles(*)')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkOrder[];
    },
  });

  // Fetch technicians
  const { data: technicians, isLoading: loadingTechnicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Technician[];
    },
  });

  // Fetch vehicles
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Vehicle[];
    },
  });

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export functionality coming soon!');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    alert('Excel export functionality coming soon!');
  };

  if (loadingWorkOrders || loadingTechnicians || loadingVehicles) {
    return (
      <div className="flex h-screen bg-white">
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200">
            <Skeleton height={24} width={120} className="mb-3" />
            <Skeleton height={36} />
          </div>
          <div className="flex-1 p-4">
            <Skeleton height={400} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Skeleton height={48} width={48} className="mx-auto mb-3" />
            <Skeleton height={20} width={160} className="mx-auto mb-2" />
            <Skeleton height={16} width={240} className="mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left Panel - Report Navigation & Controls */}
      <div className="w-56 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2.5">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reports</h1>
            <button
              onClick={handleExportPDF}
              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <HugeiconsIcon icon={FileIcon} size={14} />
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="mb-3">
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value as DateRange)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {dateRange === 'custom' && (
            <div className="space-y-2 mb-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Report Type Selector */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Report Type</label>
            <div className="space-y-0.5">
              {[
                { id: 'overview', label: 'Overview', icon: Home01Icon },
                { id: 'fleet', label: 'Fleet Overview', icon: Car01Icon },
                { id: 'technician', label: 'Technician Performance', icon: UserIcon },
                { id: 'workorder', label: 'Work Order Analysis', icon: ClipboardIcon },
                { id: 'asset', label: 'Asset Reports', icon: Car01Icon },
                { id: 'financial', label: 'Financial Summary', icon: TagIcon },
                { id: 'inventory', label: 'Inventory Reports', icon: PackageIcon },
              ].map((report) => (
                <button
                  key={report.id}
                  onClick={() => setReportType(report.id as ReportType)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors ${reportType === report.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <HugeiconsIcon icon={report.icon} size={14} />
                  {report.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Export Options</h3>
          <div className="space-y-0.5">
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <HugeiconsIcon icon={FileIcon} size={14} />
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <HugeiconsIcon icon={FileIcon} size={14} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Date Range Info */}
        <div className="px-3 py-2.5">
          <h3 className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Current Period</h3>
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {dayjs(startDate).format('MMM D, YYYY')} - {dayjs(endDate).format('MMM D, YYYY')}
          </div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            {dayjs(endDate).diff(dayjs(startDate), 'days')} days
          </div>
        </div>
      </div>

      {/* Right Panel - Report Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {reportType === 'overview' ? 'Overview Report' :
              reportType === 'technician' ? 'Technician Performance' :
                reportType === 'workorder' ? 'Work Order Analysis' :
                  reportType === 'asset' ? 'Asset Reports' :
                    reportType === 'fleet' ? 'Fleet Overview' :
                      reportType === 'financial' ? 'Financial Summary' : 'Inventory Reports'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {reportType === 'overview' ? 'Comprehensive insights and performance metrics' :
              reportType === 'technician' ? 'Individual technician performance analysis' :
                reportType === 'workorder' ? 'Work order trends and patterns' :
                  reportType === 'asset' ? 'Asset maintenance and service history' :
                    reportType === 'fleet' ? 'Fleet status, health, and availability metrics' :
                      reportType === 'financial' ? 'Revenue and cost analysis' : 'Inventory valuation, movement, and analytics'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {reportType === 'overview' && (
            <OverviewReport
              workOrders={workOrders || []}
              technicians={technicians || []}
              vehicles={vehicles || []}
              startDate={startDate}
              endDate={endDate}
            />
          )}

          {reportType === 'fleet' && (
            <FleetOverviewReport
              vehicles={vehicles || []}
              workOrders={workOrders || []}
            />
          )}

          {reportType === 'technician' && (
            <TechnicianPerformanceReport
              workOrders={workOrders || []}
              technicians={technicians || []}
            />
          )}

          {reportType === 'workorder' && (
            <WorkOrderAnalysisReport
              workOrders={workOrders || []}
            />
          )}

          {reportType === 'asset' && (
            <AssetReport
              workOrders={workOrders || []}
              vehicles={vehicles || []}
            />
          )}

          {reportType === 'financial' && (
            <FinancialReport
              workOrders={workOrders || []}
            />
          )}

          {reportType === 'inventory' && (
            <InventoryReport />
          )}
        </div>
      </div>
    </div>
  );
};

// Chart colors from design system
const CHART_COLORS = {
  primary: professionalColors.chart.primary,
  extended: professionalColors.chart.extended,
  gradients: professionalColors.chart.gradients,

  // Semantic colors for specific use cases
  steelBlue: professionalColors.steelBlue[600],
  safetyOrange: professionalColors.safetyOrange[500],
  industrialGreen: professionalColors.industrialGreen[500],
  maintenanceYellow: professionalColors.maintenanceYellow[500],
  warningRed: professionalColors.warningRed[600],
  machineryGray: professionalColors.machineryGray[500],

  // Status colors - matching workOrderStatusColors from professional-colors.ts
  pending: professionalColors.maintenanceYellow[500],
  in_progress: professionalColors.safetyOrange[500],
  inProgress: professionalColors.safetyOrange[500],
  completed: professionalColors.industrialGreen[500],
  on_hold: professionalColors.maintenanceYellow[500],
  onHold: professionalColors.maintenanceYellow[500],
  open: professionalColors.steelBlue[600],
  ready: professionalColors.machineryGray[500],

  // Priority colors - matching priorityColors from professional-colors.ts
  urgent: professionalColors.warningRed[600],
  critical: professionalColors.warningRed[600],
  high: professionalColors.safetyOrange[600],
  medium: professionalColors.maintenanceYellow[600],
  low: professionalColors.machineryGray[500],
};

// Overview Report Component
const OverviewReport: React.FC<{
  workOrders: WorkOrder[];
  technicians: Technician[];
  vehicles: Vehicle[];
  startDate: string;
  endDate: string;
}> = ({ workOrders, technicians, vehicles, startDate, endDate }) => {
  const stats = useMemo(() => {
    const total = workOrders.length;
    const completed = workOrders.filter(wo => wo.status === 'completed').length;
    const inProgress = workOrders.filter(wo => wo.status === 'in_progress').length;
    const pending = workOrders.filter(wo => wo.status === 'pending').length;
    const onHold = workOrders.filter(wo => wo.status === 'on_hold').length;

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

    const totalCost = workOrders.reduce((sum, wo) => sum + (wo.total_cost || 0), 0);
    const avgCost = total > 0 ? (totalCost / total) : 0;

    const activeTechnicians = technicians.filter(t => t.status === 'active').length;
    const totalVehicles = vehicles.length;

    return {
      total,
      completed,
      inProgress,
      pending,
      onHold,
      completionRate,
      totalCost,
      avgCost,
      activeTechnicians,
      totalVehicles,
    };
  }, [workOrders, technicians, vehicles]);

  // Prepare chart data
  const statusChartData = useMemo(() => [
    { name: 'Pending', value: stats.pending, color: CHART_COLORS.pending },
    { name: 'In Progress', value: stats.inProgress, color: CHART_COLORS.inProgress },
    { name: 'Completed', value: stats.completed, color: CHART_COLORS.completed },
    { name: 'On Hold', value: stats.onHold, color: CHART_COLORS.onHold },
  ], [stats]);

  const priorityChartData = useMemo(() => {
    return ['urgent', 'high', 'medium', 'low'].map(priority => {
      const priorityKey = priority.charAt(0).toUpperCase() + priority.slice(1);
      return {
        name: priorityKey,
        count: workOrders.filter(wo => wo.priority?.toLowerCase() === priority).length,
        color: CHART_COLORS[priority as keyof typeof CHART_COLORS] as string,
      };
    });
  }, [workOrders]);

  // Timeline data - group by day
  const timelineData = useMemo(() => {
    const grouped: Record<string, { date: string; completed: number; created: number }> = {};

    workOrders.forEach(wo => {
      const createdDate = dayjs(wo.created_at).format('MMM DD');
      if (!grouped[createdDate]) {
        grouped[createdDate] = { date: createdDate, completed: 0, created: 0 };
      }
      grouped[createdDate].created += 1;
      if (wo.status === 'completed') {
        grouped[createdDate].completed += 1;
      }
    });

    return Object.values(grouped).sort((a, b) =>
      dayjs(a.date, 'MMM DD').valueOf() - dayjs(b.date, 'MMM DD').valueOf()
    );
  }, [workOrders]);

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Work Orders</span>
            <div className="p-1 bg-primary-50 dark:bg-primary-900/30 rounded">
              <HugeiconsIcon icon={ClipboardIcon} size={14} className="text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500">
            {dayjs(startDate).format('MMM D')} - {dayjs(endDate).format('MMM D, YYYY')}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Completion Rate</span>
            <div className="p-1 bg-green-50 dark:bg-green-900/30 rounded">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.completionRate}%</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500">
            {stats.completed} of {stats.total} completed
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Revenue</span>
            <div className="p-1 bg-green-50 dark:bg-green-900/30 rounded">
              <HugeiconsIcon icon={CoinsDollarIcon} size={14} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            UGX {(stats.totalCost / 1000000).toFixed(1)}M
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500">
            Avg: UGX {(stats.avgCost / 1000).toFixed(0)}K
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Technicians</span>
            <div className="p-1 bg-purple-50 dark:bg-purple-900/30 rounded">
              <HugeiconsIcon icon={Wrench01Icon} size={14} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.activeTechnicians}</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500">
            Managing {stats.totalVehicles} vehicles
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
            <HugeiconsIcon icon={Chart01Icon} size={14} className="text-primary-600 dark:text-primary-400" />
            Status Distribution
          </h3>
          {statusChartData.some(item => item.value > 0) ? (
            <PieChart
              series={[
                {
                  data: statusChartData.map((item, index) => ({
                    id: index,
                    value: item.value,
                    label: item.name,
                    color: item.color,
                  })),
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  valueFormatter: (value) => `${value.value}`,
                },
              ]}
              height={220}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'bottom', horizontal: 'middle' },
                  padding: 0,
                  itemMarkWidth: 8,
                  itemMarkHeight: 8,
                  labelStyle: { fontSize: 10 },
                },
              }}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No data available</div>
          )}
        </div>

        {/* Priority Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
            <HugeiconsIcon icon={ChartHistogramIcon} size={14} className="text-primary-600 dark:text-primary-400" />
            Priority Distribution
          </h3>
          {priorityChartData.length > 0 ? (
            <PieChart
              series={[
                {
                  data: priorityChartData.map((item, index) => ({
                    id: index,
                    value: item.count,
                    label: item.name,
                    color: item.color,
                  })),
                  highlightScope: { faded: 'global', highlighted: 'item' },
                },
              ]}
              height={220}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'bottom', horizontal: 'middle' },
                  padding: 0,
                  itemMarkWidth: 8,
                  itemMarkHeight: 8,
                  labelStyle: { fontSize: 10 },
                },
              }}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No data available</div>
          )}
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
          <HugeiconsIcon icon={ChartLineData01Icon} size={14} className="text-primary-600 dark:text-primary-400" />
          Work Orders Timeline
        </h3>
        {timelineData.length > 0 ? (
          <LineChart
            xAxis={[
              {
                scaleType: 'point',
                data: timelineData.map(item => item.date),
              },
            ]}
            series={[
              {
                label: 'Created',
                data: timelineData.map(item => item.created),
                color: CHART_COLORS.steelBlue,
                area: true,
                showMark: false,
              },
              {
                label: 'Completed',
                data: timelineData.map(item => item.completed),
                color: CHART_COLORS.industrialGreen,
                area: true,
                showMark: false,
              },
            ]}
            height={220}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 0,
                itemMarkWidth: 8,
                itemMarkHeight: 8,
                labelStyle: { fontSize: 10 },
              },
            }}
          />
        ) : (
          <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No data available</div>
        )}
      </div>
    </div>
  );
};

// Technician Performance Report
const TechnicianPerformanceReport: React.FC<{
  workOrders: WorkOrder[];
  technicians: Technician[];
}> = ({ workOrders, technicians }) => {
  const technicianStats = useMemo(() => {
    return technicians.map(tech => {
      const techWorkOrders = workOrders.filter(wo => wo.technician_id === tech.id);
      const completed = techWorkOrders.filter(wo => wo.status === 'completed').length;
      const inProgress = techWorkOrders.filter(wo => wo.status === 'in_progress').length;
      const total = techWorkOrders.length;
      const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
      const totalRevenue = techWorkOrders.reduce((sum, wo) => sum + (wo.total_cost || 0), 0);

      return {
        ...tech,
        total,
        completed,
        inProgress,
        completionRate: parseFloat(completionRate),
        totalRevenue,
      };
    }).sort((a, b) => b.total - a.total);
  }, [workOrders, technicians]);

  // Chart data for technician comparison
  const technicianChartData = useMemo(() => {
    return technicianStats.slice(0, 8).map(tech => ({
      name: tech.name.split(' ')[0], // First name only for chart
      completed: tech.completed,
      inProgress: tech.inProgress,
      total: tech.total,
    }));
  }, [technicianStats]);

  return (
    <div className="space-y-4">
      {/* Performance Comparison Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
          <HugeiconsIcon icon={ChartHistogramIcon} size={14} className="text-primary-600 dark:text-primary-400" />
          Technician Performance Comparison
        </h3>
        {technicianChartData.length > 0 ? (
          <BarChart
            xAxis={[
              {
                scaleType: 'band',
                data: technicianChartData.map(item => item.name),
              },
            ]}
            series={[
              {
                label: 'Completed',
                data: technicianChartData.map(item => item.completed),
                color: CHART_COLORS.completed,
                stack: 'total',
              },
              {
                label: 'In Progress',
                data: technicianChartData.map(item => item.inProgress),
                color: CHART_COLORS.inProgress,
                stack: 'total',
              },
            ]}
            height={220}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 0,
                itemMarkWidth: 8,
                itemMarkHeight: 8,
                labelStyle: { fontSize: 10 },
              },
            }}
          />
        ) : (
          <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No data available</div>
        )}
      </div>

      {/* Technician Performance Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-1.5 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Technician</th>
                <th className="text-center py-1.5 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Status</th>
                <th className="text-center py-1.5 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Total WOs</th>
                <th className="text-center py-1.5 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Completed</th>
                <th className="text-center py-1.5 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">In Progress</th>
                <th className="text-center py-1.5 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Completion Rate</th>
                <th className="text-right py-1.5 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {technicianStats.map(tech => (
                <tr key={tech.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="py-1.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <HugeiconsIcon icon={Wrench01Icon} size={16} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{tech.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{tech.specialization}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      tech.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {tech.status}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{tech.total}</span>
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    <span className="font-semibold text-green-600 dark:text-green-400">{tech.completed}</span>
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{tech.inProgress}</span>
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{tech.completionRate}%</span>
                  </td>
                  <td className="py-1.5 px-3 text-right">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      UGX {(tech.totalRevenue / 1000000).toFixed(1)}M
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Work Order Analysis Report
const WorkOrderAnalysisReport: React.FC<{
  workOrders: WorkOrder[];
}> = ({ workOrders }) => {
  const analysis = useMemo(() => {
    const byServiceType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    workOrders.forEach(wo => {
      // Service type
      const serviceType = wo.service_type || 'Unknown';
      byServiceType[serviceType] = (byServiceType[serviceType] || 0) + 1;

      // Status - normalize to lowercase with underscores
      const normalizedStatus = wo.status?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
      byStatus[normalizedStatus] = (byStatus[normalizedStatus] || 0) + 1;

      // Priority - normalize to lowercase
      const normalizedPriority = wo.priority?.toLowerCase() || 'low';
      byPriority[normalizedPriority] = (byPriority[normalizedPriority] || 0) + 1;
    });

    return { byServiceType, byStatus, byPriority };
  }, [workOrders]);

  // Service type chart data
  const serviceTypeChartData = useMemo(() => {
    return Object.entries(analysis.byServiceType)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        name: type,
        value: count,
      }));
  }, [analysis.byServiceType]);

  // Status chart data with proper colors
  const statusChartData = useMemo(() => {
    const statusColors: Record<string, string> = {
      pending: CHART_COLORS.pending,
      in_progress: CHART_COLORS.in_progress,
      completed: CHART_COLORS.completed,
      on_hold: CHART_COLORS.on_hold,
      cancelled: CHART_COLORS.warningRed,
      open: CHART_COLORS.open,
      ready: CHART_COLORS.ready,
    };

    return Object.entries(analysis.byStatus)
      .sort(([, a], [, b]) => b - a)
      .map(([status, count]) => {
        const statusLower = status.toLowerCase().replace(/\s+/g, '_');
        const displayName = status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return {
          name: displayName,
          value: count,
          color: statusColors[statusLower] || CHART_COLORS.machineryGray,
        };
      });
  }, [analysis.byStatus]);

  // Priority chart data with proper colors
  const priorityChartData = useMemo(() => {
    const priorityColors: Record<string, string> = {
      urgent: CHART_COLORS.urgent,
      critical: CHART_COLORS.critical,
      high: CHART_COLORS.high,
      medium: CHART_COLORS.medium,
      low: CHART_COLORS.low,
    };

    return Object.entries(analysis.byPriority)
      .sort(([, a], [, b]) => b - a)
      .map(([priority, count]) => {
        const priorityLower = priority.toLowerCase();
        const displayName = priority.charAt(0).toUpperCase() + priority.slice(1);
        return {
          name: displayName,
          value: count,
          color: priorityColors[priorityLower] || CHART_COLORS.machineryGray,
        };
      });
  }, [analysis.byPriority]);

  return (
    <div className="space-y-4">
      {/* Service Type Bar Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
          <HugeiconsIcon icon={ChartHistogramIcon} size={14} className="text-primary-600 dark:text-primary-400" />
          Work Orders by Service Type
        </h3>
        {serviceTypeChartData.length > 0 ? (
          <BarChart
            yAxis={[
              {
                scaleType: 'band',
                data: serviceTypeChartData.map(item => item.name),
              },
            ]}
            series={[
              {
                data: serviceTypeChartData.map(item => item.value),
                color: CHART_COLORS.steelBlue,
              },
            ]}
            layout="horizontal"
            height={220}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 0,
                itemMarkWidth: 8,
                itemMarkHeight: 8,
                labelStyle: { fontSize: 10 },
              },
            }}
          />
        ) : (
          <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No data available</div>
        )}
      </div>

      {/* Status and Priority Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
            <HugeiconsIcon icon={Chart01Icon} size={14} className="text-primary-600 dark:text-primary-400" />
            By Status
          </h3>
          {statusChartData.length > 0 ? (
            <PieChart
              series={[
                {
                  data: statusChartData.map((item, index) => ({
                    id: index,
                    value: item.value,
                    label: item.name,
                    color: item.color,
                  })),
                  highlightScope: { faded: 'global', highlighted: 'item' },
                },
              ]}
              height={220}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'bottom', horizontal: 'middle' },
                  padding: 0,
                  itemMarkWidth: 8,
                  itemMarkHeight: 8,
                  labelStyle: { fontSize: 10 },
                },
              }}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No data available</div>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
            <HugeiconsIcon icon={FlagIcon} size={14} className="text-primary-600 dark:text-primary-400" />
            By Priority
          </h3>
          {priorityChartData.length > 0 ? (
            <PieChart
              series={[
                {
                  data: priorityChartData.map((item, index) => ({
                    id: index,
                    value: item.value,
                    label: item.name,
                    color: item.color,
                  })),
                  highlightScope: { faded: 'global', highlighted: 'item' },
                },
              ]}
              height={220}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'bottom', horizontal: 'middle' },
                  padding: 0,
                  itemMarkWidth: 8,
                  itemMarkHeight: 8,
                  labelStyle: { fontSize: 10 },
                },
              }}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Asset Report
const AssetReport: React.FC<{
  workOrders: WorkOrder[];
  vehicles: Vehicle[];
}> = ({ workOrders, vehicles }) => {
  const vehicleStats = useMemo(() => {
    return vehicles.map(vehicle => {
      const vehicleWorkOrders = workOrders.filter(wo => wo.vehicle_id === vehicle.id);
      const totalCost = vehicleWorkOrders.reduce((sum, wo) => sum + (wo.total_cost || 0), 0);

      return {
        ...vehicle,
        workOrderCount: vehicleWorkOrders.length,
        totalCost,
      };
    }).sort((a, b) => b.workOrderCount - a.workOrderCount);
  }, [workOrders, vehicles]);

  // Top 10 for chart
  const top10VehiclesChartData = useMemo(() => {
    return vehicleStats.slice(0, 10).map(v => ({
      name: v.registration_number,
      workOrders: v.workOrderCount,
      cost: v.totalCost / 1000000, // Convert to millions
    }));
  }, [vehicleStats]);

  return (
    <div className="space-y-4">
      {/* Top Vehicles Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
          <HugeiconsIcon icon={ChartHistogramIcon} size={14} className="text-primary-600 dark:text-primary-400" />
          Top 10 Vehicles by Service Frequency
        </h3>
        {top10VehiclesChartData.length > 0 ? (
          <BarChart
            yAxis={[
              {
                scaleType: 'band',
                data: top10VehiclesChartData.map(item => item.name),
              },
            ]}
            series={[
              {
                data: top10VehiclesChartData.map(item => item.workOrders),
                color: CHART_COLORS.steelBlue,
                label: 'Work Orders',
              },
            ]}
            layout="horizontal"
            height={250}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 0,
                itemMarkWidth: 8,
                itemMarkHeight: 8,
                labelStyle: { fontSize: 10 },
              },
            }}
          />
        ) : (
          <div className="h-[250px] flex items-center justify-center text-xs text-gray-400">No data available</div>
        )}
      </div>

      {/* Detailed Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
        <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
            <HugeiconsIcon icon={TableIcon} size={12} className="text-primary-600 dark:text-primary-400" />
            All Vehicles Service History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-1.5 px-3 font-semibold text-gray-600 uppercase tracking-wider text-xs">Rank</th>
                <th className="text-left py-1.5 px-3 font-semibold text-gray-600 uppercase tracking-wider text-xs">Vehicle</th>
                <th className="text-left py-1.5 px-3 font-semibold text-gray-600 uppercase tracking-wider text-xs">Make/Model</th>
                <th className="text-center py-1.5 px-3 font-semibold text-gray-600 uppercase tracking-wider text-xs">Work Orders</th>
                <th className="text-right py-1.5 px-3 font-semibold text-gray-600 uppercase tracking-wider text-xs">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {vehicleStats.slice(0, 20).map((vehicle, index) => (
                <tr key={vehicle.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-1.5 px-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-600'
                      }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-1.5 px-3">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Car01Icon} size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{vehicle.registration_number}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-3 text-gray-600">
                    {vehicle.make} {vehicle.model}
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                      {vehicle.workOrderCount}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-gray-900">
                    UGX {(vehicle.totalCost / 1000000).toFixed(2)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {vehicleStats.length > 20 && (
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-[10px] text-gray-500 dark:text-gray-400">
            Showing top 20 of {vehicleStats.length} vehicles
          </div>
        )}
      </div>
    </div>
  );
};

// Financial Report
const FinancialReport: React.FC<{
  workOrders: WorkOrder[];
}> = ({ workOrders }) => {
  const financialStats = useMemo(() => {
    const totalRevenue = workOrders.reduce((sum, wo) => sum + (wo.total_cost || 0), 0);
    const totalLabor = workOrders.reduce((sum, wo) => sum + (wo.labor_cost || 0), 0);
    const totalParts = workOrders.reduce((sum, wo) => sum + (wo.parts_cost || 0), 0);

    const completedRevenue = workOrders
      .filter(wo => wo.status === 'completed')
      .reduce((sum, wo) => sum + (wo.total_cost || 0), 0);

    const pendingRevenue = workOrders
      .filter(wo => wo.status === 'pending' || wo.status === 'in_progress')
      .reduce((sum, wo) => sum + (wo.total_cost || 0), 0);

    return {
      totalRevenue,
      totalLabor,
      totalParts,
      completedRevenue,
      pendingRevenue,
      avgOrderValue: workOrders.length > 0 ? totalRevenue / workOrders.length : 0,
    };
  }, [workOrders]);

  // Revenue breakdown chart data
  const revenueBreakdownData = useMemo(() => [
    { name: 'Completed', value: financialStats.completedRevenue, color: CHART_COLORS.completed },
    { name: 'Pending', value: financialStats.pendingRevenue, color: CHART_COLORS.pending },
  ], [financialStats]);

  // Cost breakdown chart data
  const costBreakdownData = useMemo(() => [
    { name: 'Labor', value: financialStats.totalLabor, color: CHART_COLORS.steelBlue },
    { name: 'Parts', value: financialStats.totalParts, color: CHART_COLORS.industrialGreen },
  ], [financialStats]);

  return (
    <div className="space-y-4">
      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Revenue</span>
            <div className="p-1 bg-gray-50 dark:bg-gray-800 rounded">
              <HugeiconsIcon icon={CoinsDollarIcon} size={14} className="text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            UGX {(financialStats.totalRevenue / 1000000).toFixed(1)}M
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed Revenue</span>
            <div className="p-1 bg-green-50 dark:bg-green-900/30 rounded">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            UGX {(financialStats.completedRevenue / 1000000).toFixed(1)}M
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending Revenue</span>
            <div className="p-1 bg-yellow-50 dark:bg-yellow-900/30 rounded">
              <HugeiconsIcon icon={Clock01Icon} size={14} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
            UGX {(financialStats.pendingRevenue / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Revenue Breakdown Pie Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
            <HugeiconsIcon icon={Chart01Icon} size={14} className="text-primary-600 dark:text-primary-400" />
            Revenue by Status
          </h3>
          {revenueBreakdownData.some(item => item.value > 0) ? (
            <PieChart
              series={[
                {
                  data: revenueBreakdownData.map((item, index) => ({
                    id: index,
                    value: item.value,
                    label: item.name,
                    color: item.color,
                  })),
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  valueFormatter: (value) => `UGX ${(value.value / 1000000).toFixed(2)}M`,
                },
              ]}
              height={220}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'bottom', horizontal: 'middle' },
                  padding: 0,
                  itemMarkWidth: 8,
                  itemMarkHeight: 8,
                  labelStyle: { fontSize: 10 },
                },
              }}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No data available</div>
          )}
        </div>

        {/* Cost Breakdown Pie Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
            <HugeiconsIcon icon={Chart01Icon} size={14} className="text-primary-600 dark:text-primary-400" />
            Cost Breakdown
          </h3>
          {costBreakdownData.some(item => item.value > 0) ? (
            <PieChart
              series={[
                {
                  data: costBreakdownData.map((item, index) => ({
                    id: index,
                    value: item.value,
                    label: item.name,
                    color: item.color,
                  })),
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  valueFormatter: (value) => `UGX ${(value.value / 1000000).toFixed(2)}M`,
                },
              ]}
              height={220}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'bottom', horizontal: 'middle' },
                  padding: 0,
                  itemMarkWidth: 8,
                  itemMarkHeight: 8,
                  labelStyle: { fontSize: 10 },
                },
              }}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No data available</div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
          <HugeiconsIcon icon={ReceiptDollarIcon} size={14} className="text-primary-600 dark:text-primary-400" />
          Detailed Cost Analysis
        </h3>
        {financialStats.totalRevenue > 0 ? (
          <BarChart
            xAxis={[
              {
                scaleType: 'band',
                data: ['Labor Costs', 'Parts Costs'],
              },
            ]}
            series={[
              {
                data: [
                  (financialStats.totalLabor / financialStats.totalRevenue) * 100,
                  (financialStats.totalParts / financialStats.totalRevenue) * 100,
                ],
                label: '% of Total Revenue',
                valueFormatter: (value) => `${value.toFixed(1)}%`,
                color: CHART_COLORS.steelBlue,
              },
            ]}
            height={180}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 0,
                itemMarkWidth: 8,
                itemMarkHeight: 8,
                labelStyle: { fontSize: 10 },
              },
            }}
          />
        ) : (
          <div className="h-[180px] flex items-center justify-center text-xs text-gray-400">No data available</div>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">Labor Costs</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                UGX {(financialStats.totalLabor / 1000000).toFixed(2)}M
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {((financialStats.totalLabor / financialStats.totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">Parts Costs</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                UGX {(financialStats.totalParts / 1000000).toFixed(2)}M
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {((financialStats.totalParts / financialStats.totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-2 bg-primary-50 dark:bg-primary-900/30 rounded">
              <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">Avg Order Value</p>
              <p className="text-sm font-bold text-primary-700 dark:text-primary-400">
                UGX {(financialStats.avgOrderValue / 1000).toFixed(0)}K
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Per work order</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Fleet Overview Report
const FleetOverviewReport: React.FC<{
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
}> = ({ vehicles, workOrders }) => {
  const stats = useMemo(() => {
    const total = vehicles.length;
    
    // Use exact status values from your system
    const normal = vehicles.filter(v => v.status === 'Normal').length;
    const inRepair = vehicles.filter(v => v.status === 'In Repair').length;
    const decommissioned = vehicles.filter(v => v.status === 'Decommissioned').length;

    // Calculate availability rate (Normal vehicles are available)
    const availabilityRate = total > 0 ? ((normal / total) * 100).toFixed(1) : '0';

    // Calculate average age (mock calculation based on year)
    const currentYear = new Date().getFullYear();
    const totalAge = vehicles.reduce((sum, v) => sum + (currentYear - (v.year || currentYear)), 0);
    const avgAge = total > 0 ? (totalAge / total).toFixed(1) : '0';

    return { 
      total, 
      active: normal, // Normal = Active/Available
      maintenance: inRepair, // In Repair = Maintenance
      outOfService: decommissioned, // Decommissioned = Out of Service
      availabilityRate, 
      avgAge 
    };
  }, [vehicles]);

  // Status Chart Data - using your exact status values
  const statusData = useMemo(() => {
    const data = [
      { name: 'Normal', value: stats.active, color: CHART_COLORS.industrialGreen },
      { name: 'In Repair', value: stats.maintenance, color: CHART_COLORS.maintenanceYellow },
      { name: 'Decommissioned', value: stats.outOfService, color: CHART_COLORS.warningRed },
    ];
    
    return data.filter(item => item.value > 0);
  }, [stats]);

  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Fleet */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Fleet Size</span>
            <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded">
              <HugeiconsIcon icon={TruckIcon} size={14} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
        </div>

        {/* Availability Rate */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Availability Rate</span>
            <div className="p-1 bg-green-50 dark:bg-green-900/30 rounded">
              <HugeiconsIcon icon={Activity01Icon} size={14} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.availabilityRate}%</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500">{stats.active} vehicles available</div>
        </div>

        {/* In Maintenance */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">In Maintenance</span>
            <div className="p-1 bg-yellow-50 dark:bg-yellow-900/30 rounded">
              <HugeiconsIcon icon={Wrench01Icon} size={14} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.maintenance}</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500">Currently being serviced</div>
        </div>

        {/* Average Age */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Average Age</span>
            <div className="p-1 bg-gray-50 dark:bg-gray-800 rounded">
              <HugeiconsIcon icon={CalendarCheckIn01Icon} size={14} className="text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.avgAge}</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500">Years</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
            <HugeiconsIcon icon={Chart01Icon} size={14} className="text-primary-600 dark:text-primary-400" />
            Fleet Status Distribution
          </h3>
          {statusData.some(item => item.value > 0) ? (
            <PieChart
              series={[
                {
                  data: statusData.map((item, index) => ({
                    id: index,
                    value: item.value,
                    label: item.name,
                    color: item.color,
                  })),
                  highlightScope: { faded: 'global', highlighted: 'item' },
                },
              ]}
              height={220}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'bottom', horizontal: 'middle' },
                  padding: 0,
                  itemMarkWidth: 8,
                  itemMarkHeight: 8,
                  labelStyle: { fontSize: 10 },
                },
              }}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
