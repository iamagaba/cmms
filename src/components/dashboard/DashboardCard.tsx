import React from 'react';
import { Card, Typography, Space, theme } from 'antd';
import { Icon } from '@iconify/react';
import { brand } from '@/theme/palette';

const { Title, Text } = Typography;

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: string;
  trend?: {
    value: number;
    type: 'increase' | 'decrease';
    label?: string;
  };
  color?: string;
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  color = brand.primary,
  loading = false,
}) => {
  const { token } = theme.useToken();
  const getTrendColor = () => {
    if (!trend) return '';
    return trend.type === 'increase' ? token.colorSuccess : token.colorError;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.type === 'increase' ? 'si:arrow-up' : 'si:arrow-down';
  };

  return (
  <Card size="small"
      loading={loading}
      bodyStyle={{ 
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <Space size="middle" align="start">
        {icon && (
          <div
            style={{
              // Use themed primary background for the icon chip for better themability
              backgroundColor: token.colorPrimaryBg,
              padding: '12px',
              borderRadius: '12px',
            }}
          >
            <Icon 
              icon={icon} 
              style={{ 
                fontSize: '24px',
                color: color,
              }}
            />
          </div>
        )}
        <div>
          <Text type="secondary">{title}</Text>
          <Title level={3} style={{ margin: '4px 0' }}>
            {value}
          </Title>
          {description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {description}
            </Text>
          )}
        </div>
      </Space>

      {trend && (
        <div style={{ marginTop: 'auto' }}>
          <Space size="small">
            <Text
              style={{
                color: getTrendColor(),
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Icon icon={getTrendIcon() || ''} />
              {Math.abs(trend.value)}%
            </Text>
            {trend.label && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {trend.label}
              </Text>
            )}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default DashboardCard;