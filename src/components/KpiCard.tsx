import { Card, Statistic, Avatar, Space, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { ReactNode } from "react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const { Text } = Typography;

interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  isUpGood?: boolean;
  chartData?: { value: number }[];
}

const KpiCard = ({ title, value, icon, trend, trendDirection, isUpGood = true, chartData }: KpiCardProps) => {
  const isPositive = (trendDirection === 'up' && isUpGood) || (trendDirection === 'down' && !isUpGood);
  const trendColor = isPositive ? '#52c41a' : '#ff4d4f';

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Statistic title={title} value={value} />
          {trend && trendDirection && (
            <Space size={4} style={{ marginTop: 8 }}>
              {trendDirection === 'up' ? <ArrowUpOutlined style={{ color: trendColor }} /> : <ArrowDownOutlined style={{ color: trendColor }} />}
              <Text style={{ color: trendColor, fontSize: 12 }}>{trend}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>vs last week</Text>
            </Space>
          )}
        </div>
        <Avatar size="large" icon={icon} style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }} />
      </div>
      {chartData && (
        <div style={{ height: 40, marginTop: 16, marginLeft: -24, marginRight: -24, marginBottom: -16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="value" stroke={trendColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default KpiCard;