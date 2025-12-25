import React from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip as RechartsTooltip, AreaChart, Area, BarChart, Bar } from 'recharts';

interface KpiSparklineProps {
  variant: 'line' | 'area' | 'bar';
  validSparklineData: { value: number }[];
  comparisonBarData: { name: string; value: number; fill?: string }[];
  showSparklineTooltip: boolean;
  precision: number;
  title: string;
  effectiveSparklineColor: string;
  // sparklineGradient intentionally unused here; gradient stop opacities are hardcoded
}

const KpiSparkline: React.FC<KpiSparklineProps> = ({
  variant,
  validSparklineData,
  comparisonBarData,
  showSparklineTooltip,
  precision,
  title,
  effectiveSparklineColor,
}) => {
  // Render appropriate recharts visualization depending on variant
  if (variant === 'line' && validSparklineData.length > 0) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={validSparklineData} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          {showSparklineTooltip && (
            <RechartsTooltip
              cursor={false}
              formatter={(val: any) => [typeof val === 'number' ? val.toFixed(precision) : val, title]}
              contentStyle={{ background: '#fff', border: `1px solid #eee`, padding: '4px 8px' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={effectiveSparklineColor}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={true}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (variant === 'area' && validSparklineData.length > 0) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={validSparklineData} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={`areaGradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={effectiveSparklineColor} stopOpacity={0.12} />
              <stop offset="95%" stopColor={effectiveSparklineColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {showSparklineTooltip && (
            <RechartsTooltip
              cursor={false}
              formatter={(val: any) => [typeof val === 'number' ? val.toFixed(precision) : val, title]}
              contentStyle={{ background: '#fff', border: `1px solid #eee`, padding: '4px 8px' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={effectiveSparklineColor}
            strokeWidth={1.5}
            fill={`url(#areaGradient-${title.replace(/\s/g, '')})`}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (variant === 'bar' && comparisonBarData.length > 0) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={comparisonBarData} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          {showSparklineTooltip && (
            <RechartsTooltip
              cursor={false}
              formatter={(val: any) => [typeof val === 'number' ? val.toFixed(precision) : val]}
              contentStyle={{ background: '#fff', border: `1px solid #eee`, padding: '4px 8px' }}
            />
          )}
          <Bar dataKey="value" radius={[2, 2, 0, 0]} isAnimationActive={true} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return <div />;
};

export default KpiSparkline;
