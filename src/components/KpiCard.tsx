import { Card, Space, Typography, theme } from "antd";
import { useState } from "react";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { ReactNode } from "react";

const { Text } = Typography;

interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  isUpGood?: boolean;
  comparisonLabel?: string;
}

const KpiCard = ({ title, value, icon, trend, trendDirection, isUpGood = true, comparisonLabel = 'vs last period' }: KpiCardProps) => {
  const { token } = theme.useToken();
  const isPositive = (trendDirection === 'up' && isUpGood) || (trendDirection === 'down' && !isUpGood);
  const trendColor = isPositive ? token.colorSuccess : token.colorError;

  const [hover, setHover] = useState(false);
  const cardStyle = {
    height: '100%',
    padding: '1.5rem 1.25rem',
    borderRadius: token.borderRadiusLG,
    background: token.colorBgContainer,
    border: hover ? `1.5px solid ${token.colorBorder}` : `1px solid ${token.colorSplit}`,
    boxShadow: hover ? token.boxShadowSecondary : token.boxShadowTertiary,
    transition: 'box-shadow 0.18s, border 0.18s',
  } as React.CSSProperties;

  return (
  <Card size="small"
      className="lift-on-hover"
      style={cardStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: token.colorPrimary, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: token.colorText, lineHeight: 1.1, marginBottom: 8 }}>{value}</div>
          {trend && trendDirection && (
            <Space size={4} style={{ marginTop: 4 }}>
              {trendDirection === 'up' ? <Icon icon="ph:arrow-fat-up-fill" style={{ color: trendColor }} /> : <Icon icon="ph:arrow-fat-down-fill" style={{ color: trendColor }} />}
              <Text style={{ color: trendColor, fontSize: 13 }}>{trend}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{comparisonLabel}</Text>
            </Space>
          )}
        </div>
        <div style={{ background: token.colorPrimaryBg, borderRadius: '50%', padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 32, color: token.colorPrimary, display: 'flex', alignItems: 'center' }}>{icon}</span>
        </div>
      </div>
    </Card>
  );
};

export default KpiCard;