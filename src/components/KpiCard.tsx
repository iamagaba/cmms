import { Card, Statistic, Avatar, Space, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { ReactNode } from "react";

const { Text } = Typography;

interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  isUpGood?: boolean;
}

const KpiCard = ({ title, value, icon, trend, trendDirection, isUpGood = true }: KpiCardProps) => {
  const isPositive = (trendDirection === 'up' && isUpGood) || (trendDirection === 'down' && !isUpGood);
  const trendColor = isPositive ? '#52c41a' : '#ff4d4f';

  return (
    <Card className="lift-on-hover" style={{ height: '100%' }}>
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
        <Avatar size="large" icon={icon} style={{ backgroundColor: '#E8D9F7', color: '#6A0DAD' }} />
      </div>
    </Card>
  );
};

export default KpiCard;