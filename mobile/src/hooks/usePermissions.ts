import {useMemo} from 'react';
import {useAuth} from './useAuth';
import {permissionService, Permission, PermissionCheckResult} from '@/services/permissions';

/**
 * Hook to check user permissions
 */
export const usePermissions = () => {
  const {profile} = useAuth();

  const permissions = useMemo(() => {
    return {
      /**
       * Check if user has a specific permission
       */
      hasPermission: (permission: Permission): PermissionCheckResult => {
        return permissionService.hasPermission(profile, permission);
      },

      /**
       * Check if user has all specified permissions
       */
      hasAllPermissions: (permissions: Permission[]): PermissionCheckResult => {
        return permissionService.hasAllPermissions(profile, permissions);
      },

      /**
       * Check if user has any of the specified permissions
       */
      hasAnyPermission: (permissions: Permission[]): PermissionCheckResult => {
        return permissionService.hasAnyPermission(profile, permissions);
      },

      /**
       * Check if user is a technician
       */
      isTechnician: (): boolean => {
        return permissionService.isTechnician(profile);
      },

      /**
       * Check if user is an admin
       */
      isAdmin: (): boolean => {
        return permissionService.isAdmin(profile);
      },

      /**
       * Get all user permissions
       */
      getUserPermissions: (): Permission[] => {
        return permissionService.getUserPermissions(profile);
      },

      /**
       * Check if user can access mobile app
       */
      canAccessMobileApp: (): PermissionCheckResult => {
        return permissionService.canAccessMobileApp(profile);
      },

      /**
       * Get user role
       */
      getUserRole: () => {
        return permissionService.getUserRole(profile);
      },
    };
  }, [profile]);

  return permissions;
};