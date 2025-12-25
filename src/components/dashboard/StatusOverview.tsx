import React from 'react';
import { Card, Progress, Typography, Space, Row, Col, Badge } from 'antd';

const { Title, Text } = Typography;

interface StatusItem {
  label: string;
  value: number;
  color: string;
}

interface StatusOverviewProps {
  title: string;
  total: number;
  items: StatusItem[];
  loading?: boolean;
}

const StatusOverview: React.FC<StatusOverviewProps> = ({
  title,
  total,
  items,
  loading = false,
}) => {
  const getPercentage = (value: number) => ((value / total) * 100).toFixed(1);

  return (
  <Card size="small" loading={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space direction="vertical" size="small">
          <Title level={5} style={{ margin: 0 }}>{title}</Title>
          <Text type="secondary">Total: {total}</Text>
        </Space>

        <div>
          <Row gutter={[16, 16]}>
            {items.map((item, index) => (
              <Col key={index} xs={24} sm={12}>
                <Space size="small">
                  <Badge color={item.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Text>{item.label}</Text>
                      <Space size="small">
                        <Text strong>{item.value}</Text>
                        <Text type="secondary">({getPercentage(item.value)}%)</Text>
                      </Space>
                    </div>
                    <Progress 
                      percent={Number(getPercentage(item.value))} 
                      strokeColor={item.color}
                      size="small"
                      showInfo={false}
                    />
                  </div>
                </Space>
              </Col>
            ))}
          </Row>
        </div>
      </Space>
    </Card>
  );
};

export default StatusOverview;