import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTopUsedParts, usePartsUsageAnalytics } from '@/hooks/useWorkOrderParts';
import dayjs from 'dayjs';

interface PartsUsageAnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewType = 'overview' | 'by-item' | 'by-vehicle' | 'by-category';
type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

export const PartsUsageAnalyticsPanel: React.FC<PartsUsageAnalyticsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Fetch top used parts
  const { data: topParts, isLoading: isLoadingTop } = useTopUsedParts(10);

  // Fetch analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = usePartsUsageAnalytics();

  // Fetch summary stats
  const { data: summaryStats, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['parts_usage_summary', timeRange],
    queryFn: async () => {
      const startDate = getStartDate(timeRange);
      
      let query = supabase
        .from('work_order_parts')
        .select('quantity_used, total_cost, created_at');
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const totalParts = (data || []).reduce((sum, p) => sum + p.quantity_used, 0);
      const totalCost = (data || []).reduce((sum, p) => sum + (p.total_cost || 0), 0);
      const uniqueWorkOrders = new Set((data || []).map(p => p.created_at)).size;

      return {
        totalParts,
        totalCost,
        transactionCount: data?.length || 0,
        avgPartsPerTransaction: data?.length ? totalParts / data.length : 0,
      };
    },
    enabled: isOpen,
  });

  // Fetch usage by vehicle
  const { data: usageByVehicle, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ['parts_usage_by_vehicle', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select(`
          quantity_used,
          total_cost,
          work_orders!inner(vehicle_id, vehicles(id, make, model, license_plate))
        `)
        .limit(500);

      if (error) throw new Error(error.message);

      // Aggregate by vehicle
      const byVehicle: Record<string, { 
        vehicle_id: string; 
        vehicle_name: string; 
        license_plate: string;
        total_parts: number; 
        total_cost: number;
        usage_count: number;
      }> = {};

      (data || []).forEach((item: any) => {
        const vehicle = item.work_orders?.vehicles;
        if (!vehicle) return;
        
        const key = vehicle.id;
        if (!byVehicle[key]) {
          byVehicle[key] = {
            vehicle_id: vehicle.id,
            vehicle_name: `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Unknown',
            license_plate: vehicle.license_plate || '',
            total_parts: 0,
            total_cost: 0,
            usage_count: 0,
          };
        }
        byVehicle[key].total_parts += item.quantity_used;
        byVehicle[key].total_cost += item.total_cost || 0;
        byVehicle[key].usage_count++;
      });

      return Object.values(byVehicle)
        .sort((a, b) => b.total_cost - a.total_cost)
        .slice(0, 15);
    },
    enabled: isOpen && activeView === 'by-vehicle',
  });

  // Fetch usage by service category
  const { data: usageByCategory, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['parts_usage_by_category', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select(`
          quantity_used,
          total_cost,
          work_orders!inner(service_category_id, service_categories(id, name))
        `)
        .limit(500);

      if (error) throw new Error(error.message);

      // Aggregate by category
      const byCategory: Record<string, { 
        category_id: string; 
        category_name: string; 
        total_parts: number; 
        total_cost: number;
        usage_count: number;
      }> = {};

      (data || []).forEach((item: any) => {
        const category = item.work_orders?.service_categories;
        const key = category?.id || 'uncategorized';
        
        if (!byCategory[key]) {
          byCategory[key] = {
            category_id: key,
            category_name: category?.name || 'Uncategorized',
            total_parts: 0,
            total_cost: 0,
            usage_count: 0,
          };
        }
        byCategory[key].total_parts += item.quantity_used;
        byCategory[key].total_cost += item.total_cost || 0;
        byCategory[key].usage_count++;
      });

      return Object.values(byCategory)
        .sort((a, b) => b.total_cost - a.total_cost);
    },
    enabled: isOpen && activeView === 'by-category',
  });

  if (!isOpen) return null;

  const isLoading = isLoadingTop || isLoadingAnalytics || isLoadingSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Parts Usage Analytics
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track parts consumption across work orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="h-9 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Icon icon="tabler:x" className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: 'tabler:chart-bar' },
            { id: 'by-item', label: 'By Item', icon: 'tabler:package' },
            { id: 'by-vehicle', label: 'By Vehicle', icon: 'tabler:car' },
            { id: 'by-category', label: 'By Category', icon: 'tabler:category' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as ViewType)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeView === tab.id
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon icon="tabler:loader-2" className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <>
              {activeView === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <StatCard
                      label="Total Parts Used"
                      value={summaryStats?.totalParts || 0}
                      icon="tabler:package"
                      color="purple"
                    />
                    <StatCard
                      label="Total Cost"
                      value={`UGX ${(summaryStats?.totalCost || 0).toLocaleString()}`}
                      icon="tabler:currency-dollar"
                      color="emerald"
                    />
                    <StatCard
                      label="Transactions"
                      value={summaryStats?.transactionCount || 0}
                      icon="tabler:receipt"
                      color="blue"
                    />
                    <StatCard
                      label="Avg Parts/Transaction"
                      value={(summaryStats?.avgPartsPerTransaction || 0).toFixed(1)}
                      icon="tabler:chart-line"
                      color="orange"
                    />
                  </div>

                  {/* Top Used Parts */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Top Used Parts
                    </h3>
                    <div className="space-y-2">
                      {(topParts || []).map((item: any, index: number) => (
                        <div
                          key={item.inventory_item_id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.inventory_item?.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.inventory_item?.sku || 'No SKU'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.usage_count} uses
                            </p>
                          </div>
                        </div>
                      ))}
                      {(!topParts || topParts.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          No parts usage data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'by-item' && (
                <div className="space-y-2">
                  {(analyticsData || []).map((item: any) => (
                    <div
                      key={`${item.inventory_item_id}-${item.vehicle_id}-${item.service_category_id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.item_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          SKU: {item.sku || 'N/A'} • {item.work_orders_count} work orders
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {item.total_quantity_used} used
                        </p>
                        <p className="text-xs text-emerald-600">
                          UGX {(item.total_cost || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!analyticsData || analyticsData.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No analytics data available
                    </div>
                  )}
                </div>
              )}

              {activeView === 'by-vehicle' && (
                <div className="space-y-2">
                  {isLoadingVehicle ? (
                    <div className="text-center py-8">
                      <Icon icon="tabler:loader-2" className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                    </div>
                  ) : (
                    <>
                      {(usageByVehicle || []).map((item: any) => (
                        <div
                          key={item.vehicle_id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Icon icon="tabler:car" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.vehicle_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.license_plate || 'No plate'} • {item.usage_count} transactions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.total_parts} parts
                            </p>
                            <p className="text-xs text-emerald-600">
                              UGX {item.total_cost.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(!usageByVehicle || usageByVehicle.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          No vehicle usage data available
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeView === 'by-category' && (
                <div className="space-y-2">
                  {isLoadingCategory ? (
                    <div className="text-center py-8">
                      <Icon icon="tabler:loader-2" className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                    </div>
                  ) : (
                    <>
                      {(usageByCategory || []).map((item: any) => (
                        <div
                          key={item.category_id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                              <Icon icon="tabler:category" className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.category_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.usage_count} transactions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.total_parts} parts
                            </p>
                            <p className="text-xs text-emerald-600">
                              UGX {item.total_cost.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(!usageByCategory || usageByCategory.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          No category usage data available
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for stat cards
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: string;
  color: 'purple' | 'emerald' | 'blue' | 'orange';
}> = ({ label, value, icon, color }) => {
  const colorClasses = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon icon={icon} className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
};

// Helper function to get start date based on time range
function getStartDate(range: TimeRange): string | null {
  const now = dayjs();
  switch (range) {
    case '7d': return now.subtract(7, 'day').toISOString();
    case '30d': return now.subtract(30, 'day').toISOString();
    case '90d': return now.subtract(90, 'day').toISOString();
    case '1y': return now.subtract(1, 'year').toISOString();
    case 'all': return null;
    default: return null;
  }
}

export default PartsUsageAnalyticsPanel;
