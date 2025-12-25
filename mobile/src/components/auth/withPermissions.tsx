import React from 'react';
import {ProtectedRoute} from './ProtectedRoute';
import {Permission} from '@/services/permissions';

interface WithPermissionsOptions {
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
  fallbackComponent?: React.ComponentType;
  showError?: boolean;
}

/**
 * Higher-order component that wraps a component with permission protection
 */
export const withPermissions = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPermissionsOptions = {}
) => {
  const {
    requiredPermissions = [],
    requireAllPermissions = true,
    fallbackComponent,
    showError = true,
  } = options;

  const WithPermissionsComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute
        requiredPermissions={requiredPermissions}
        requireAllPermissions={requireAllPermissions}
        fallbackComponent={fallbackComponent}
        showError={showError}
      >
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };

  WithPermissionsComponent.displayName = `withPermissions(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithPermissionsComponent;
};