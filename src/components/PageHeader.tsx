import React from "react";
import { Row, Col, Typography, Space, Input } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify

const { Title } = Typography;

interface PageHeaderProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
  onSearch?: (value: string) => void;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hideSearch?: boolean;
}

const PageHeader = ({ title, actions, onSearch, onSearchChange, hideSearch = false }: PageHeaderProps) => {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
      <Col>
        {typeof title === 'string' ? <Title level={4} style={{ margin: 0 }}>{title}</Title> : title}
      </Col>
      <Col>
        <Space size="middle" align="center">
          {!hideSearch && (
            <Input
              placeholder="Search..."
              prefix={<Icon icon="si:search" />}
              style={{ width: 250 }}
              onPressEnter={(e) => onSearch && onSearch(e.currentTarget.value)}
              onChange={onSearchChange}
              allowClear
            />
          )}
          {actions && <>{actions}</>}
        </Space>
      </Col>
    </Row>
  );
};

export default PageHeader;