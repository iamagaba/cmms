import React from 'react';
import { Card, Empty, Spin, theme } from 'antd';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dataVizColors } from '@/theme/palette';

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataPoint[];
  title?: string;
  loading?: boolean;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  tooltipFormatter?: (value: number) => string;
}

const defaultColors = [...dataVizColors];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  fillColor,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill={fillColor}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: '12px', fontWeight: 500 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  loading = false,
  height = 400,
  innerRadius = 60,
  outerRadius = 140,
  tooltipFormatter,
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
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => renderCustomizedLabel({ ...props, fillColor: token.colorTextLightSolid })}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill={defaultColors[0]}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || defaultColors[index % defaultColors.length]}
                />
              ))}
            </Pie>
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
              verticalAlign="middle"
              align="right"
              layout="vertical"
              iconType="circle"
              formatter={(value: string) => (
                <span style={{ color: token.colorText }}>{value}</span>
              )}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PieChart;