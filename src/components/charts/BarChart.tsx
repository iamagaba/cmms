import React from 'react';
import { Card, Empty, Spin, theme } from 'antd';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dataVizColors } from '@/theme/palette';

export interface BarChartDataPoint {
  name: string;
  [key: string]: number | string;
}

export interface BarChartSeries {
  name: string;
  dataKey: string;
  color?: string;
  stackId?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  series: BarChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  loading?: boolean;
  height?: number;
  gridEnabled?: boolean;
  stacked?: boolean;
  horizontal?: boolean;
  tooltipFormatter?: (value: any) => string;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
}

const defaultColors = [...dataVizColors];

const BarChart: React.FC<BarChartProps> = ({
  data,
  series,
  xAxisLabel,
  yAxisLabel,
  title,
  loading = false,
  height = 400,
  gridEnabled = true,
  stacked = false,
  horizontal = false,
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
}) => {
  const { token } = theme.useToken();
  if (loading) {
    return (
  <Card size="small">
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
  <Card size="small">
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Empty description="No data available" />
        </div>
      </Card>
    );
  }

  return (
  <Card size="small" title={title}>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsBarChart
            data={data}
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            {gridEnabled && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={token.colorSplit}
                {...(horizontal ? { horizontal: false } : { vertical: false })}
              />
            )}
            <XAxis
              type={horizontal ? 'number' : 'category'}
              dataKey={horizontal ? undefined : 'name'}
              tickFormatter={horizontal ? xAxisFormatter : undefined}
              label={
                xAxisLabel
                  ? {
                      value: xAxisLabel,
                      position: 'insideBottom',
                      offset: -10,
                    }
                  : undefined
              }
              tick={{ fill: token.colorTextSecondary }}
            />
            <YAxis
              type={horizontal ? 'category' : 'number'}
              dataKey={horizontal ? 'name' : undefined}
              tickFormatter={!horizontal ? yAxisFormatter : undefined}
              label={
                yAxisLabel
                  ? {
                      value: yAxisLabel,
                      angle: -90,
                      position: 'insideLeft',
                    }
                  : undefined
              }
              tick={{ fill: token.colorTextSecondary }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: token.colorBgContainer,
                border: `1px solid ${token.colorSplit}`,
                borderRadius: '6px',
                boxShadow: token.boxShadowTertiary,
              }}
              formatter={tooltipFormatter}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              formatter={(value: string) => (
                <span style={{ color: token.colorText }}>{value}</span>
              )}
            />
            {series.map((s, index) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={s.color || defaultColors[index % defaultColors.length]}
                stackId={stacked ? 'stack' : s.stackId}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default BarChart;