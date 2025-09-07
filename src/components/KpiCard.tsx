import { Card, Statistic, Avatar, Space, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { ReactNode } from "react";
// Removed LineChart, Line, ResponsiveContainer from recharts

const { Text } = Typography;

interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  isUpGood?: boolean;
  // Removed chartData prop
}

const KpiCard = ({ title, value, icon, trend, trendDirection, isUpGood = true }: KpiCardProps) => {
  const isPositive = (trendDirection === 'up' && isUpGood) || (trendDirection === 'down' && !isUpGood);
  const trendColor = isPositive ? '#52c41a' : '#ff4d4f'; // Keep semantic green/red for trends

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
        <Avatar size="large" icon={icon} style={{ backgroundColor: '#E8D9F7', color: '#6A0DAD' }} /> {/* Light purple background, GOGO Brand Purple icon */}
      </div>
      {/* Removed chartData rendering block */}
    </Card>
  );
};

export default KpiCard;