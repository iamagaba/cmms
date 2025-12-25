/**
 * Professional CMMS Chart and Visualization System
 * 
 * A comprehensive chart system optimized for desktop CMMS workflows.
 * Features maintenance-specific charts, KPI visualizations, and
 * professional industrial styling designed for data analysis.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalCard from '@/components/ui/ProfessionalCard';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesDataPoint {
  timestamp: string | Date;
  value: number;
  label?: string;
  color?: string;
}

export interface ChartConfig {
  title?: string;
  description?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  colors?: string[];
  height?: number;
  responsive?: boolean;
  animation?: boolean;
}

export interface LineChartProps extends ChartConfig {
  data: TimeSeriesDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  smooth?: boolean;
  showPoints?: boolean;
  showArea?: boolean;
  className?: string;
}

export interface BarChartProps extends ChartConfig {
  data: ChartDataPoint[];
  orientation?: 'horizontal' | 'vertical';
  showValues?: boolean;
  className?: string;
}

export interface PieChartProps extends ChartConfig {
  data: ChartDataPoint[];
  showPercentages?: boolean;
  innerRadius?: number;
  className?: string;
}

export interface KPIChartProps {
  title: string;
  value: number;
  target?: number;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  color?: string;
  icon?: string;
  sparklineData?: number[];
  className?: string;
}

// ============================================
// CHART UTILITIES
// ============================================

const defaultColors = [
  '#0077ce', // Steel blue
  '#16a34a', // Industrial green
  '#dc2626', // Warning red
  '#eab308', // Maintenance yellow
  '#f97316', // Safety orange
  '#64748b', // Machinery gray
];

const formatNumber = (value: number, decimals: number = 0): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
};

const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? (value / total) * 100 : 0;
};

// ============================================
// SPARKLINE COMPONENT
// ============================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 30,
  color = '#0077ce',
  className,
}) => {
  const pathData = useMemo(() => {
    if (data.length < 2) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [data, width, height]);

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// ============================================
// KPI CHART COMPONENT
// ============================================

const KPIChart: React.FC<KPIChartProps> = ({
  title,
  value,
  target,
  unit = '',
  trend,
  color = '#0077ce',
  icon,
  sparklineData,
  className,
}) => {
  const progressPercentage = target ? Math.min((value / target) * 100, 100) : 0;
  const isOverTarget = target && value > target;

  return (
    <ProfessionalCard className={cn('p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon icon={icon} className="w-5 h-5" style={{ color }} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-machinery-600">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-machinery-900">
                {formatNumber(value, 1)}
              </span>
              {unit && (
                <span className="text-sm text-machinery-500">{unit}</span>
              )}
            </div>
          </div>
        </div>
        
        {sparklineData && (
          <Sparkline
            data={sparklineData}
            color={color}
            className="opacity-60"
          />
        )}
      </div>

      {/* Progress Bar */}
      {target && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-machinery-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}% of target</span>
          </div>
          <div className="w-full bg-machinery-200 rounded-full h-2">
            <motion.div
              className={cn(
                'h-2 rounded-full',
                isOverTarget ? 'bg-industrial-500' : 'bg-steel-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-machinery-500 mt-1">
            <span>0</span>
            <span>{formatNumber(target)}</span>
          </div>
        </div>
      )}

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-2 text-sm">
          <Icon
            icon={
              trend.direction === 'up'
                ? 'tabler:trending-up'
                : trend.direction === 'down'
                ? 'tabler:trending-down'
                : 'tabler:minus'
            }
            className={cn(
              'w-4 h-4',
              trend.direction === 'up' && 'text-industrial-500',
              trend.direction === 'down' && 'text-warning-500',
              trend.direction === 'neutral' && 'text-machinery-500'
            )}
          />
          <span
            className={cn(
              'font-medium',
              trend.direction === 'up' && 'text-industrial-600',
              trend.direction === 'down' && 'text-warning-600',
              trend.direction === 'neutral' && 'text-machinery-600'
            )}
          >
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-machinery-500">vs {trend.period}</span>
        </div>
      )}
    </ProfessionalCard>
  );
};

// ============================================
// SIMPLE BAR CHART COMPONENT
// ============================================

const SimpleBarChart: React.FC<BarChartProps> = ({
  data,
  title,
  description,
  orientation = 'vertical',
  showValues = true,
  showLegend = false,
  colors = defaultColors,
  height = 300,
  className,
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const chartColors = data.map((_, index) => colors[index % colors.length]);

  return (
    <ProfessionalCard className={cn('p-6', className)}>
      {/* Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-machinery-900 mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-machinery-600">{description}</p>
          )}
        </div>
      )}

      {/* Chart */}
      <div style={{ height }} className="relative">
        {orientation === 'vertical' ? (
          <div className="flex items-end justify-between h-full gap-2">
            {data.map((item, index) => {
              const barHeight = (item.value / maxValue) * (height - 60);
              const color = item.color || chartColors[index];
              
              return (
                <div key={item.label} className="flex flex-col items-center flex-1">
                  <div className="flex flex-col items-center mb-2">
                    {showValues && (
                      <span className="text-xs font-medium text-machinery-700 mb-1">
                        {formatNumber(item.value)}
                      </span>
                    )}
                    <motion.div
                      className="w-full rounded-t-md min-w-[20px]"
                      style={{ backgroundColor: color }}
                      initial={{ height: 0 }}
                      animate={{ height: barHeight }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                  <span className="text-xs text-machinery-600 text-center leading-tight">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full gap-2">
            {data.map((item, index) => {
              const barWidth = (item.value / maxValue) * 100;
              const color = item.color || chartColors[index];
              
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm text-machinery-700 w-20 text-right">
                    {item.label}
                  </span>
                  <div className="flex-1 bg-machinery-200 rounded-full h-6 relative">
                    <motion.div
                      className="h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    >
                      {showValues && (
                        <span className="text-xs font-medium text-white">
                          {formatNumber(item.value)}
                        </span>
                      )}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-machinery-200">
          {data.map((item, index) => {
            const color = item.color || chartColors[index];
            return (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-machinery-600">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </ProfessionalCard>
  );
};

// ============================================
// SIMPLE PIE CHART COMPONENT
// ============================================

const SimplePieChart: React.FC<PieChartProps> = ({
  data,
  title,
  description,
  showPercentages = true,
  showLegend = true,
  colors = defaultColors,
  innerRadius = 0,
  className,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  let currentAngle = -90; // Start from top

  const segments = data.map((item, index) => {
    const percentage = calculatePercentage(item.value, total);
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    currentAngle += angle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    const color = item.color || colors[index % colors.length];

    return {
      ...item,
      pathData,
      color,
      percentage,
      startAngle,
      endAngle,
    };
  });

  return (
    <ProfessionalCard className={cn('p-6', className)}>
      {/* Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-machinery-900 mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-machinery-600">{description}</p>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Chart */}
        <div className="flex-shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {segments.map((segment, index) => (
              <motion.path
                key={segment.label}
                d={segment.pathData}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
            
            {/* Inner circle for donut chart */}
            {innerRadius > 0 && (
              <circle
                cx={centerX}
                cy={centerY}
                r={innerRadius}
                fill="white"
              />
            )}
          </svg>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 space-y-3">
            {segments.map((segment, index) => (
              <motion.div
                key={segment.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm text-machinery-700">
                    {segment.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-machinery-900">
                    {formatNumber(segment.value)}
                  </div>
                  {showPercentages && (
                    <div className="text-xs text-machinery-500">
                      {segment.percentage.toFixed(1)}%
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ProfessionalCard>
  );
};

// ============================================
// MAINTENANCE METRICS DASHBOARD
// ============================================

interface MaintenanceMetricsProps {
  metrics: {
    totalWorkOrders: number;
    completedWorkOrders: number;
    pendingWorkOrders: number;
    overdue: number;
    avgCompletionTime: number;
    costSavings: number;
  };
  trends: {
    workOrderTrend: number[];
    costTrend: number[];
    efficiencyTrend: number[];
  };
  className?: string;
}

const MaintenanceMetrics: React.FC<MaintenanceMetricsProps> = ({
  metrics,
  trends,
  className,
}) => {
  const completionRate = (metrics.completedWorkOrders / metrics.totalWorkOrders) * 100;
  
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      <KPIChart
        title="Work Orders Completed"
        value={metrics.completedWorkOrders}
        target={metrics.totalWorkOrders}
        icon="tabler:clipboard-check"
        color="#16a34a"
        trend={{
          value: 12,
          direction: 'up',
          period: 'last month',
        }}
        sparklineData={trends.workOrderTrend}
      />
      
      <KPIChart
        title="Average Completion Time"
        value={metrics.avgCompletionTime}
        unit="hours"
        icon="tabler:clock"
        color="#0077ce"
        trend={{
          value: -8,
          direction: 'down',
          period: 'last month',
        }}
        sparklineData={trends.efficiencyTrend}
      />
      
      <KPIChart
        title="Cost Savings"
        value={metrics.costSavings}
        unit="$"
        icon="tabler:trending-up"
        color="#eab308"
        trend={{
          value: 15,
          direction: 'up',
          period: 'last quarter',
        }}
        sparklineData={trends.costTrend}
      />
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default KPIChart;
export {
  SimpleBarChart,
  SimplePieChart,
  Sparkline,
  MaintenanceMetrics,
};

export type {
  KPIChartProps,
  BarChartProps,
  PieChartProps,
  LineChartProps,
  ChartDataPoint,
  TimeSeriesDataPoint,
  ChartConfig,
  MaintenanceMetricsProps,
};