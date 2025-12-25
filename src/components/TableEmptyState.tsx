import { Empty } from 'antd';
import { Icon } from '@iconify/react';
import './TableEmptyState.css';
import './TableEmptyState.css';



interface TableEmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
}

export function TableEmptyState({ 
  title = 'No Data Found', 
  description = 'No records are currently available.', 
  icon = 'ant-design:inbox-outlined'
}: TableEmptyStateProps) {
  return (
    <Empty
      className="table-empty-state"
      image={<Icon icon={icon} style={{ fontSize: '48px' }} />}
      description={
        <div>
          <div className="table-empty-state-title">
            {title}
          </div>
          <div className="table-empty-state-description">
            {description}
          </div>
        </div>
      }
    />
  );
}