import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {usePermissions} from '@/hooks/usePermissions';
import {Permission, Role} from '@/services/permissions';
import {theme} from '@/theme/theme';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
  fallback?: React.ReactNode;
  showError?: boolean;
}

/**
 * Component that conditionally renders content based on user roles and permissions
 * This is different from ProtectedRoute as it's meant for inline content protection
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  requireAllPermissions = true,
  fallback,
  showError = false,
}) => {
  const permissions = usePermissions();
  const userRole = permissions.getUserRole();

  // Check role-based access
  if (allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      if (fallback) {
        return <>{fallback}</>;
      }
      
      if (showError) {
        return (
          <View style={styles.errorContainer}>
            <Text variant="bodySmall" style={styles.errorText}>
              Insufficient role permissions
            </Text>
          </View>
        );
      }
      
      return null;
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const permissionResult = requireAllPermissions
      ? permissions.hasAllPermissions(requiredPermissions)
      : permissions.hasAnyPermission(requiredPermissions);

    if (!permissionResult.hasPermission) {
      if (fallback) {
        return <>{fallback}</>;
      }
      
      if (showError) {
        return (
          <View style={styles.errorContainer}>
            <Text variant="bodySmall" style={styles.errorText}>
              {permissionResult.reason}
            </Text>
          </View>
        );
      }
      
      return null;
    }
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  errorContainer: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.spacing.xs,
    marginVertical: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.onErrorContainer,
    textAlign: 'center',
  },
});