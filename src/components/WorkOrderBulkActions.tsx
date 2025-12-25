import { Button, Dropdown, Menu, Space, Avatar } from "antd";
import { Icon } from '@iconify/react';
import { Technician } from "@/types/supabase";

export interface WorkOrderBulkActionsProps {
  selectedRowKeys: React.Key[];
  technicians: Technician[];
  onBulkAssign: (technicianId: string) => void;
  isLoading?: boolean;
}

const WorkOrderBulkActions: React.FC<WorkOrderBulkActionsProps> = ({
  selectedRowKeys,
  technicians = [],
  onBulkAssign,
  isLoading = false,
}) => {
  const handleBulkAssign = ({ key }: { key: string }) => {
    onBulkAssign(key);
  };

  const bulkAssignMenu = (
    <Menu onClick={handleBulkAssign}>
      {technicians.map(tech => (
        <Menu.Item key={tech.id}>
          <Space>
            <Avatar 
              size="small" 
              src={tech.avatar || undefined}
            >
              {tech.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            {tech.name}
          </Space>
        </Menu.Item>
      ))}
    </Menu>
  );

  if (selectedRowKeys.length === 0) {
    return null;
  }

  return (
    <Dropdown 
      overlay={bulkAssignMenu} 
      disabled={selectedRowKeys.length === 0 || isLoading}
    >
      <Button loading={isLoading}>
        Assign ({selectedRowKeys.length}) <Icon icon="si:arrow-down" />
      </Button>
    </Dropdown>
  );
};

export default WorkOrderBulkActions;