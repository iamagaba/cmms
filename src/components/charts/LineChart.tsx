import React from 'react';
import { Card, Empty, Spin, theme } from 'antd';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dataVizColors } from '@/theme/palette';

export interface LineChartDataPoint {
  x: number | string;
  [key: string]: number | string;
}

export interface LineChartSeries {
  name: string;
  dataKey: string;
  color?: string;
  strokeWidth?: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  series: LineChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  loading?: boolean;
  height?: number;
  gridEnabled?: boolean;
  tooltipFormatter?: (value: any) => string;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
}

const defaultColors = [...dataVizColors];

const LineChart: React.FC<LineChartProps> = ({
  data,
  series,
  xAxisLabel,
  yAxisLabel,
  title,
  loading = false,
  height = 400,
  gridEnabled = true,
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
          <RechartsLineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            {gridEnabled && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={token.colorSplit}
                vertical={false}
              />
            )}
            <XAxis
              dataKey="x"
              tickFormatter={xAxisFormatter}
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
              tickFormatter={yAxisFormatter}
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
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color || defaultColors[index % defaultColors.length]}
                strokeWidth={s.strokeWidth || 2}
                dot={{ fill: token.colorBgContainer, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default LineChart;