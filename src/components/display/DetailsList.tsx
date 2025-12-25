import React from 'react';
import { Typography, Space, Descriptions, Card, Badge, Tag, theme } from 'antd';
import type { DescriptionsProps } from 'antd';
import { Icon } from '@iconify/react';

const { Text, Link } = Typography;

interface DetailsListItem extends Omit<NonNullable<DescriptionsProps['items']>[0], 'children'> {
  value: React.ReactNode;
  icon?: string;
  type?: 'text' | 'status' | 'tag' | 'link' | 'email' | 'phone' | 'date' | 'currency';
  status?: 'success' | 'warning' | 'error' | 'processing' | 'default';
  tagColor?: string;
  href?: string;
  onClick?: () => void;
}

interface DetailsListProps {
  title?: string;
  items: DetailsListItem[];
  column?: number;
  loading?: boolean;
  size?: 'small' | 'middle' | 'default';
  bordered?: boolean;
  colon?: boolean;
  layout?: 'horizontal' | 'vertical';
}

const formatValue = (item: DetailsListItem) => {
  if (!item.value && item.value !== 0) {
    return <Text type="secondary">-</Text>;
  }

  switch (item.type) {
    case 'status':
      return (
        <Badge
          status={item.status || 'default'}
          text={item.value}
        />
      );
    
    case 'tag':
      return (
        <Tag color={item.tagColor}>
          {item.value}
        </Tag>
      );
    
    case 'link':
      return (
        <Link href={item.href} onClick={item.onClick}>
          {item.value}
        </Link>
      );
    
    case 'email':
      return (
        <Link href={`mailto:${item.value}`}>
          {item.value}
        </Link>
      );
    
    case 'phone':
      return (
        <Link href={`tel:${item.value}`}>
          {item.value}
        </Link>
      );
    
    case 'date':
      return (
        <Text>
          {typeof item.value === 'string' 
            ? new Date(item.value).toLocaleDateString() 
            : item.value}
        </Text>
      );
    
    case 'currency':
      return (
        <Text>
          {typeof item.value === 'number'
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(item.value)
            : item.value}
        </Text>
      );
    
    default:
      return <Text>{item.value}</Text>;
  }
};

const DetailsList: React.FC<DetailsListProps> = ({
  title,
  items,
  column = 3,
  loading = false,
  size = 'small',
  bordered = false,
  colon = true,
  layout = 'horizontal',
}) => {
  const { token } = theme.useToken();
  const descriptionsItems = items.map(item => ({
    ...item,
    label: (
      <Space>
        {item.icon && (
          <Icon 
            icon={item.icon} 
            style={{ 
              color: token.colorTextTertiary,
              fontSize: size === 'small' ? '14px' : '16px',
            }} 
          />
        )}
        <Text strong>{item.label}</Text>
      </Space>
    ),
    children: formatValue(item),
  }));

  return (
    <Card size="small" loading={loading} bordered={bordered}>
      {title && (
        <Text strong style={{ display: 'block', marginBottom: '16px' }}>
          {title}
        </Text>
      )}
      <Descriptions
        items={descriptionsItems}
        column={column}
        size={size}
        bordered={bordered}
        colon={colon}
        layout={layout}
      />
    </Card>
  );
};

export default DetailsList;