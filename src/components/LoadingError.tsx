import { Spin, Alert, Result, Button, Skeleton } from "antd";
import { Icon } from '@iconify/react';

export interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  tip = 'Loading...', 
  className = '' 
}) => (
  <div className={`min-h-screen flex items-center justify-center ${className}`}>
    <Spin size={size} tip={tip} />
  </div>
);

export interface PageSkeletonProps {
  rows?: number;
  avatar?: boolean;
  title?: boolean;
  active?: boolean;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ 
  rows = 5, 
  avatar = false, 
  title = true, 
  active = true 
}) => (
  <div style={{ padding: '24px' }}>
    <Skeleton 
      active={active} 
      avatar={avatar} 
      title={title} 
      paragraph={{ rows }} 
    />
  </div>
);

export interface ErrorAlertProps {
  message?: string;
  description?: string;
  type?: 'error' | 'warning';
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message = 'Error',
  description = 'Something went wrong. Please try again.',
  type = 'error',
  showIcon = true,
  closable = false,
  onClose
}) => (
  <Alert
    message={message}
    description={description}
    type={type}
    showIcon={showIcon}
    closable={closable}
    onClose={onClose}
    style={{ margin: '16px 0' }}
  />
);

export interface ErrorPageProps {
  title?: string;
  subTitle?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  title = 'Something went wrong',
  subTitle = 'Sorry, an error occurred while loading the page.',
  onRetry,
  showRetry = true
}) => (
  <Result
    status="error"
    title={title}
    subTitle={subTitle}
    extra={
      showRetry && onRetry && (
        <Button type="primary" onClick={onRetry}>
          <Icon icon="si:refresh" /> Try Again
        </Button>
      )
    }
  />
);

export interface LoadingTableProps {
  columns?: number;
  rows?: number;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({ 
  columns: _columns = 5, 
  rows = 10 
}) => (
  <div>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} style={{ marginBottom: '8px' }}>
        <Skeleton active paragraph={{ rows: 1 }} />
      </div>
    ))}
  </div>
);