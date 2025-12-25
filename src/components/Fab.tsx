import React from 'react';
import { Button, theme, Tooltip } from 'antd';
import { Icon } from '@iconify/react';

interface FabProps {
  onClick: () => void;
  icon?: string;
  label?: string; // for aria/tooltip
}

export const Fab: React.FC<FabProps> = ({ onClick, icon = 'ant-design:plus-outlined', label = 'Create' }) => {
  const { token } = theme.useToken();
  return (
    <Tooltip title={label} placement="left">
      <Button
        type="primary"
        shape="circle"
        size="large"
        aria-label={label}
        className="app-fab"
        style={{
          width: 56,
          height: 56,
          boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          backgroundColor: token.colorPrimary,
        }}
        onClick={onClick}
        icon={<Icon icon={icon} height={22} width={22} />}
      />
    </Tooltip>
  );
};

export default Fab;
