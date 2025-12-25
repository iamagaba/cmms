// Legacy breadcrumb component - use ModernBreadcrumbs for new implementations
import React from 'react';
import ModernBreadcrumbs from './navigation/ModernBreadcrumbs';

interface AppBreadcrumbProps {
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
  onSearch?: (value: string) => void;
  searchBar?: React.ReactNode;
}

const AppBreadcrumb: React.FC<AppBreadcrumbProps> = (props) => {
  return <ModernBreadcrumbs {...props} />;
};

export default AppBreadcrumb;