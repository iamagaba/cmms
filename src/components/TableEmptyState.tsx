import { TableEmptyState as ModernTableEmptyState } from './states/EmptyState';

// Legacy interface for backward compatibility
interface TableEmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
}

/**
 * @deprecated Use the new TableEmptyState from './states/EmptyState' instead.
 * This component is maintained for backward compatibility.
 */
export function TableEmptyState({ 
  title = 'No Data Found', 
  description = 'No records are currently available.', 
  icon = 'ant-design:inbox-outlined'
}: TableEmptyStateProps) {
  // Use the new modern implementation with backward-compatible props
  return (
    <ModernTableEmptyState
      title={title}
      description={description}
      icon={icon}
    />
  );
}