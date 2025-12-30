import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  FileIcon,
  Download01Icon,
  Calendar01Icon,
  PackageIcon,
  Store01Icon,
  Loading01Icon,
  TimelineIcon,
  TagIcon,
  ArrowDataTransferHorizontalIcon,
  Clock01Icon,
  AnalyticsUpIcon,
  PieChartIcon,
  Layers01Icon,
  ChartIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  Invoice01Icon,
  Building04Icon,
  ChartLineData01Icon,
  PackageDeliveredIcon,
  Alert01Icon,
  GridIcon
} from '@hugeicons/core-free-icons';
import {
  useInventoryValuation,
  useStockMovementHistory,
  useSlowMovingStock,
  useDeadStock,
  useUsageTrends,
  useCostAnalysis,
  useInventoryTurnover,
} from '@/hooks/useInventoryReports';
import { ITEM_CATEGORY_LABELS } from '@/types/supabase';
import dayjs from 'dayjs';

type InventoryReportType = 'valuation' | 'movement' | 'slow-moving' | 'trends' | 'cost-analysis';

const INVENTORY_REPORT_TABS = [
  { id: 'valuation', label: 'Valuation', icon: TagIcon },
  { id: 'movement', label: 'Stock Movement', icon: ArrowDataTransferHorizontalIcon },
  { id: 'slow-moving', label: 'Slow/Dead Stock', icon: Clock01Icon },
  { id: 'trends', label: 'Usage Trends', icon: AnalyticsUpIcon },
  { id: 'cost-analysis', label: 'Cost Analysis', icon: PieChartIcon },
];

// Currency formatter for UGX
const formatCurrency = (amount: number) => `UGX ${amount.toLocaleString()}`;

const InventoryReport: React.FC = () => {
  const [activeReport, setActiveReport] = useState<InventoryReportType>('valuation');

  return (
    <div className="space-y-6">
      {/* Report Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {INVENTORY_REPORT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as InventoryReportType)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeReport === tab.id
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <HugeiconsIcon icon={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeReport === 'valuation' && <ValuationReport />}
        {activeReport === 'movement' && <StockMovementReport />}
        {activeReport === 'slow-moving' && <SlowMovingReport />}
        {activeReport === 'trends' && <UsageTrendsReport />}
        {activeReport === 'cost-analysis' && <CostAnalysisReport />}
      </div>
    </div>
  );
};

// ============ VALUATION REPORT ============

const ValuationReport: React.FC = () => {
  const { data, isLoading } = useInventoryValuation();

  if (isLoading) return <LoadingState />;
  if (!data) return <EmptyState message="No valuation data available" />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Items"
          value={data.totalItems.toLocaleString()}
          icon={PackageIcon}
          color="purple"
        />
        <StatCard
          label="Total Quantity"
          value={data.totalQuantity.toLocaleString()}
          icon={Layers01Icon}
          color="blue"
        />
        <StatCard
          label="Total Value"
          value={formatCurrency(data.totalValue)}
          icon={TagIcon}
          color="emerald"
        />
        <StatCard
          label="Avg Item Value"
          value={formatCurrency(data.averageItemValue)}
          icon={ChartIcon}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Value by Category */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Value by Category</h3>
          <div className="space-y-3 max-h-64 overflow-auto">
            {Object.entries(data.itemsByCategory)
              .sort(([, a], [, b]) => b.value - a.value)
              .map(([category, stats]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {ITEM_CATEGORY_LABELS[category as keyof typeof ITEM_CATEGORY_LABELS] || category}
                    </p>
                    <p className="text-xs text-gray-500">{stats.count} items</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(stats.value)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Value by Warehouse */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Value by Warehouse</h3>
          <div className="space-y-3 max-h-64 overflow-auto">
            {Object.entries(data.itemsByWarehouse)
              .sort(([, a], [, b]) => b.value - a.value)
              .map(([warehouse, stats]) => (
                <div key={warehouse} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{warehouse}</p>
                    <p className="text-xs text-gray-500">{stats.count} items</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(stats.value)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top Value Items */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top 10 Highest Value Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium">SKU</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Unit Price</th>
                <th className="pb-2 font-medium text-right">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.topValueItems.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded text-xs font-medium">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-2 text-gray-500">{item.sku || '-'}</td>
                  <td className="py-2 text-right text-gray-900 dark:text-gray-100">{item.quantity_on_hand}</td>
                  <td className="py-2 text-right text-gray-900 dark:text-gray-100">{formatCurrency(item.unit_price)}</td>
                  <td className="py-2 text-right font-semibold text-emerald-600">
                    {formatCurrency(item.total_value)}
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

// ============ STOCK MOVEMENT REPORT ============

const StockMovementReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  
  const getDateRange = () => {
    const now = dayjs();
    switch (dateRange) {
      case '7d': return { start: now.subtract(7, 'day').toISOString(), end: now.toISOString() };
      case '30d': return { start: now.subtract(30, 'day').toISOString(), end: now.toISOString() };
      case '90d': return { start: now.subtract(90, 'day').toISOString(), end: now.toISOString() };
      default: return { start: undefined, end: undefined };
    }
  };

  const { start, end } = getDateRange();
  const { data, isLoading } = useStockMovementHistory(undefined, start, end, 200);

  if (isLoading) return <LoadingState />;
  if (!data) return <EmptyState message="No movement data available" />;

  const REASON_LABELS: Record<string, string> = {
    received: 'Received',
    damaged: 'Damaged',
    returned: 'Returned',
    expired: 'Expired',
    theft: 'Theft',
    cycle_count: 'Cycle Count',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
    other: 'Other',
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Stock Movement History</h3>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total In"
          value={`+${data.totalIn.toLocaleString()}`}
          icon={ArrowDownIcon}
          color="emerald"
        />
        <StatCard
          label="Total Out"
          value={`-${data.totalOut.toLocaleString()}`}
          icon={ArrowUpIcon}
          color="red"
        />
        <StatCard
          label="Net Change"
          value={data.netChange >= 0 ? `+${data.netChange}` : data.netChange.toString()}
          icon={ArrowDataTransferHorizontalIcon}
          color={data.netChange >= 0 ? 'blue' : 'orange'}
        />
        <StatCard
          label="Transactions"
          value={data.records.length.toString()}
          icon={Invoice01Icon}
          color="purple"
        />
      </div>

      {/* Movement by Reason */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Movement by Reason</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(data.byReason).map(([reason, stats]) => (
            <div key={reason} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{REASON_LABELS[reason] || reason}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {stats.count} <span className="text-sm font-normal text-gray-500">transactions</span>
              </p>
              <p className={`text-sm ${stats.quantity >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.quantity >= 0 ? '+' : ''}{stats.quantity} units
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Movements Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Movements</h3>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white dark:bg-gray-900">
              <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium">Reason</th>
                <th className="pb-2 font-medium text-right">Change</th>
                <th className="pb-2 font-medium text-right">After</th>
                <th className="pb-2 font-medium">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.records.slice(0, 50).map(record => (
                <tr key={record.id}>
                  <td className="py-2 text-gray-500">{dayjs(record.created_at).format('MMM D, HH:mm')}</td>
                  <td className="py-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{record.item_name}</p>
                    {record.item_sku && <p className="text-xs text-gray-500">{record.item_sku}</p>}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      record.quantity_delta > 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {REASON_LABELS[record.reason] || record.reason}
                    </span>
                  </td>
                  <td className={`py-2 text-right font-medium ${
                    record.quantity_delta > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {record.quantity_delta > 0 ? '+' : ''}{record.quantity_delta}
                  </td>
                  <td className="py-2 text-right text-gray-900 dark:text-gray-100">{record.quantity_after}</td>
                  <td className="py-2 text-gray-500">{record.created_by_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============ SLOW-MOVING / DEAD STOCK REPORT ============

const SlowMovingReport: React.FC = () => {
  const [threshold, setThreshold] = useState<90 | 180 | 365>(90);
  const { data: slowMoving, isLoading: isLoadingSlow } = useSlowMovingStock(threshold);
  const { data: deadStock, isLoading: isLoadingDead } = useDeadStock(180);
  const { data: turnover, isLoading: isLoadingTurnover } = useInventoryTurnover(12);

  const isLoading = isLoadingSlow || isLoadingDead || isLoadingTurnover;

  if (isLoading) return <LoadingState />;

  const slowMovingValue = (slowMoving || []).reduce((sum, i) => sum + i.total_value, 0);
  const deadStockValue = (deadStock || []).reduce((sum, i) => sum + i.total_value, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Slow-Moving Items"
          value={(slowMoving?.length || 0).toString()}
          icon={Clock01Icon}
          color="orange"
        />
        <StatCard
          label="Slow-Moving Value"
          value={formatCurrency(slowMovingValue)}
          icon={TagIcon}
          color="orange"
        />
        <StatCard
          label="Dead Stock Items"
          value={(deadStock?.length || 0).toString()}
          icon={Alert01Icon}
          color="red"
        />
        <StatCard
          label="Dead Stock Value"
          value={formatCurrency(deadStockValue)}
          icon={TagIcon}
          color="red"
        />
      </div>

      {/* Threshold Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Show items with no movement for:</span>
        <div className="flex gap-2">
          {[90, 180, 365].map(days => (
            <button
              key={days}
              onClick={() => setThreshold(days as any)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                threshold === days
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {days}+ days
            </button>
          ))}
        </div>
      </div>

      {/* Slow-Moving Items Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Slow-Moving Stock ({threshold}+ days without movement)
        </h3>
        {!slowMoving?.length ? (
          <EmptyState message="No slow-moving items found" />
        ) : (
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-900">
                <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium">Warehouse</th>
                  <th className="pb-2 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium text-right">Value</th>
                  <th className="pb-2 font-medium text-right">Days Idle</th>
                  <th className="pb-2 font-medium">Last Movement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {slowMoving.slice(0, 20).map(item => (
                  <tr key={item.id}>
                    <td className="py-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                      {item.sku && <p className="text-xs text-gray-500">{item.sku}</p>}
                    </td>
                    <td className="py-2 text-gray-500">{item.warehouse || '-'}</td>
                    <td className="py-2 text-right text-gray-900 dark:text-gray-100">{item.quantity_on_hand}</td>
                    <td className="py-2 text-right font-medium text-orange-600">
                      {formatCurrency(item.total_value)}
                    </td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.days_since_movement >= 180 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.days_since_movement} days
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">
                      {item.last_movement_date 
                        ? dayjs(item.last_movement_date).format('MMM D, YYYY')
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ USAGE TRENDS REPORT ============

const UsageTrendsReport: React.FC = () => {
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const { data, isLoading } = useUsageTrends(periodType, periodType === 'daily' ? 30 : periodType === 'weekly' ? 12 : 12);

  if (isLoading) return <LoadingState />;
  if (!data) return <EmptyState message="No trend data available" />;

  const maxUsage = Math.max(...data.trends.map(t => t.totalUsed), 1);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Usage Trends & Forecasting</h3>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map(period => (
            <button
              key={period}
              onClick={() => setPeriodType(period)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                periodType === period
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Avg Monthly Usage"
          value={Math.round(data.averageMonthlyUsage).toLocaleString()}
          icon={ChartLineData01Icon}
          color="purple"
        />
        <StatCard
          label="Avg Monthly Received"
          value={Math.round(data.averageMonthlyReceived).toLocaleString()}
          icon={PackageDeliveredIcon}
          color="emerald"
        />
        <StatCard
          label="Projected Next Month"
          value={Math.round(data.projectedNextMonth).toLocaleString()}
          icon={AnalyticsUpIcon}
          color="blue"
        />
        <StatCard
          label="Growth Rate"
          value={`${data.growthRate >= 0 ? '+' : ''}${data.growthRate.toFixed(1)}%`}
          icon={data.growthRate >= 0 ? ArrowUpIcon : ArrowDownIcon}
          color={data.growthRate >= 0 ? 'emerald' : 'red'}
        />
      </div>

      {/* Trend Chart (Simple Bar Chart) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Usage Over Time
        </h3>
        <div className="space-y-2">
          {data.trends.map(trend => (
            <div key={trend.period} className="flex items-center gap-3">
              <span className="w-20 text-xs text-gray-500 flex-shrink-0">
                {periodType === 'monthly' 
                  ? dayjs(trend.period).format('MMM YY')
                  : periodType === 'weekly'
                  ? `W${dayjs(trend.period).week()}`
                  : dayjs(trend.period).format('MMM D')}
              </span>
              <div className="flex-1 flex items-center gap-2">
                {/* Usage bar (red) */}
                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative">
                  <div
                    className="h-full bg-red-400 dark:bg-red-500"
                    style={{ width: `${(trend.totalUsed / maxUsage) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    -{trend.totalUsed}
                  </span>
                </div>
                {/* Received bar (green) */}
                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-400 dark:bg-emerald-500"
                    style={{ width: `${(trend.totalReceived / maxUsage) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    +{trend.totalReceived}
                  </span>
                </div>
              </div>
              <span className={`w-16 text-xs font-medium text-right ${
                trend.netChange >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {trend.netChange >= 0 ? '+' : ''}{trend.netChange}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded" />
            <span className="text-xs text-gray-500">Used</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded" />
            <span className="text-xs text-gray-500">Received</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ COST ANALYSIS REPORT ============

const CostAnalysisReport: React.FC = () => {
  const { data, isLoading } = useCostAnalysis();

  if (isLoading) return <LoadingState />;
  if (!data) return <EmptyState message="No cost data available" />;

  const maxCategoryValue = Math.max(...data.byCategory.map(c => c.totalValue), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Inventory Value"
          value={formatCurrency(data.totalInventoryValue)}
          icon={TagIcon}
          color="emerald"
        />
        <StatCard
          label="Average Item Cost"
          value={formatCurrency(data.averageItemCost)}
          icon={ChartIcon}
          color="blue"
        />
        <StatCard
          label="Highest Value Category"
          value={ITEM_CATEGORY_LABELS[data.highestValueCategory as keyof typeof ITEM_CATEGORY_LABELS] || data.highestValueCategory}
          icon={ArrowUpIcon}
          color="purple"
        />
        <StatCard
          label="Categories"
          value={data.byCategory.length.toString()}
          icon={GridIcon}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Cost by Category */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cost by Category</h3>
          <div className="space-y-4">
            {data.byCategory.map(cat => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {ITEM_CATEGORY_LABELS[cat.category as keyof typeof ITEM_CATEGORY_LABELS] || cat.category}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(cat.totalValue)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500"
                      style={{ width: `${(cat.totalValue / maxCategoryValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {cat.percentageOfTotal.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {cat.itemCount} items • Avg: {formatCurrency(cat.averageUnitCost)}/unit
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cost by Supplier */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cost by Supplier</h3>
          <div className="space-y-3 max-h-80 overflow-auto">
            {data.bySupplier.map((supplier, idx) => (
              <div key={supplier.supplier_id || idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <HugeiconsIcon icon={Building04Icon} size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {supplier.supplier_name}
                    </p>
                    <p className="text-xs text-gray-500">{supplier.itemCount} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(supplier.totalValue)}
                  </p>
                  <p className="text-xs text-gray-500">{supplier.percentageOfTotal.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ HELPER COMPONENTS ============

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: any;
  color: 'purple' | 'emerald' | 'blue' | 'orange' | 'red';
}> = ({ label, value, icon, color }) => {
  const colorClasses = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <HugeiconsIcon icon={icon} size={16} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <HugeiconsIcon icon={Loading01Icon} size={32} className="animate-spin text-primary-600" />
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-12">
    <HugeiconsIcon icon={TimelineIcon} size={48} className="text-gray-300 mx-auto mb-3" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

export default InventoryReport;