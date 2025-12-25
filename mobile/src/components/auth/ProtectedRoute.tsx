import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button} from 'react-native-paper';
import {useAuth} from '@/hooks/useAuth';
import {usePermissions} from '@/hooks/usePermissions';
import {Permission} from '@/services/permissions';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import {theme} from '@/theme/theme';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
  fallbackComponent?: React.ComponentType;
  showError?: boolean;
}

/**
 * Component that protects routes based on user permissions
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requireAllPermissions = true,
  fallbackComponent: FallbackComponent,
  showError = true,
}) => {
  const {isAuthenticated, isLoading, signOut} = useAuth();
  const permissions = usePermissions();

  // Show loading while auth is initializing
  if (isLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    if (showError) {
      return (
        <View style={styles.container}>
          <Text variant="headlineSmall" style={styles.title}>
            Authentication Required
          </Text>
          <Text variant="bodyLarge" style={styles.message}>
            You must be signed in to access this feature.
          </Text>
        </View>
      );
    }
    
    return null;
  }

  // Check if user can access mobile app (must be technician)
  const appAccessResult = permissions.canAccessMobileApp();
  if (!appAccessResult.hasPermission) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    if (showError) {
      return (
        <View style={styles.container}>
          <Text variant="headlineSmall" style={styles.title}>
            Access Denied
          </Text>
          <Text variant="bodyLarge" style={styles.message}>
            {appAccessResult.reason || 'You do not have permission to access this mobile application.'}
          </Text>
          <Text variant="bodyMedium" style={styles.subMessage}>
            This app is only available for technicians. Please contact your administrator if you believe this is an error.
          </Text>
          <Button
            mode="contained"
            onPress={signOut}
            style={styles.button}
          >
            Sign Out
          </Button>
        </View>
      );
    }
    
    return null;
  }

  // Check specific permissions if required
  if (requiredPermissions.length > 0) {
    const permissionResult = requireAllPermissions
      ? permissions.hasAllPermissions(requiredPermissions)
      : permissions.hasAnyPermission(requiredPermissions);

    if (!permissionResult.hasPermission) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      
      if (showError) {
        return (
          <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.title}>
              Insufficient Permissions
            </Text>
            <Text variant="bodyLarge" style={styles.message}>
              {permissionResult.reason || 'You do not have the required permissions to access this feature.'}
            </Text>
            <Text variant="bodyMedium" style={styles.subMessage}>
              Contact your administrator if you need access to this feature.
            </Text>
          </View>
        );
      }
      
      return null;
    }
  }

  // User has all required permissions, render children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.colors.error,
  },
  message: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.onBackground,
  },
  subMessage: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.onSurfaceVariant,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});