import React from 'react';
import { Card, Typography, Space, Tag, Button, Tooltip, Badge, theme } from 'antd';
import { Icon } from '@iconify/react';
import { brand } from '@/theme/palette';

const { Text, Title } = Typography;

interface DataCardAction {
  key: string;
  label: string;
  icon?: string;
  onClick: () => void;
  type?: 'link' | 'text' | 'default' | 'primary' | 'dashed';
  danger?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

interface DataCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  status?: {
    type: 'success' | 'warning' | 'error' | 'processing' | 'default';
    text: string;
  };
  tags?: {
    text: string;
    color?: string;
  }[];
  actions?: DataCardAction[];
  children?: React.ReactNode;
  loading?: boolean;
  hoverable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  bordered?: boolean;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor = brand.primary,
  status,
  tags,
  actions,
  children,
  loading = false,
  hoverable = false,
  className = '',
  style = {},
  bordered = true,
}) => {
  const { token } = theme.useToken();
  return (
  <Card size="small"
      loading={loading}
      hoverable={hoverable}
      className={className}
      style={style}
      bordered={bordered}
      bodyStyle={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space size="middle" align="start">
          {icon && (
            <div
              style={{
                backgroundColor: token.colorPrimaryBg,
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon icon={icon} style={{ fontSize: '20px', color: iconColor }} />
            </div>
          )}
          <div>
            <Space size={4} align="center">
              <Title level={5} style={{ margin: 0 }}>
                {title}
              </Title>
              {status && (
                <Badge
                  status={status.type}
                  text={status.text}
                />
              )}
            </Space>
            {subtitle && (
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {subtitle}
              </Text>
            )}
          </div>
        </Space>

        {actions && actions.length > 0 && (
          <Space size="small">
            {actions.map(action => (
              <Tooltip key={action.key} title={action.tooltip}>
                <Button
                  type={action.type || 'text'}
                  icon={action.icon && <Icon icon={action.icon} />}
                  onClick={action.onClick}
                  danger={action.danger}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              </Tooltip>
            ))}
          </Space>
        )}
      </div>

      {tags && tags.length > 0 && (
        <Space size={4} wrap>
          {tags.map((tag, index) => (
            <Tag key={index} color={tag.color}>
              {tag.text}
            </Tag>
          ))}
        </Space>
      )}

      {children && (
        <div style={{ marginTop: tags ? '8px' : '16px' }}>
          {children}
        </div>
      )}
    </Card>
  );
};

export default DataCard;