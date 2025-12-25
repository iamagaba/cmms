import {UserProfile} from './auth';

export enum Permission {
  // Work Order permissions
  VIEW_WORK_ORDERS = 'view_work_orders',
  UPDATE_WORK_ORDER_STATUS = 'update_work_order_status',
  COMPLETE_WORK_ORDERS = 'complete_work_orders',
  
  // Asset permissions
  VIEW_ASSETS = 'view_assets',
  SCAN_ASSET_QR = 'scan_asset_qr',
  VIEW_ASSET_HISTORY = 'view_asset_history',
  
  // Parts permissions
  VIEW_INVENTORY = 'view_inventory',
  USE_PARTS = 'use_parts',
  SCAN_PARTS = 'scan_parts',
  
  // Location permissions
  ACCESS_LOCATION = 'access_location',
  TRACK_LOCATION = 'track_location',
  
  // Communication permissions
  RECEIVE_NOTIFICATIONS = 'receive_notifications',
  COMMUNICATE_WITH_DISPATCH = 'communicate_with_dispatch',
  
  // Profile permissions
  VIEW_PROFILE = 'view_profile',
  UPDATE_PROFILE = 'update_profile',
  VIEW_PERFORMANCE = 'view_performance',
}

export enum Role {
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

// Define permissions for each role
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.TECHNICIAN]: [
    Permission.VIEW_WORK_ORDERS,
    Permission.UPDATE_WORK_ORDER_STATUS,
    Permission.COMPLETE_WORK_ORDERS,
    Permission.VIEW_ASSETS,
    Permission.SCAN_ASSET_QR,
    Permission.VIEW_ASSET_HISTORY,
    Permission.VIEW_INVENTORY,
    Permission.USE_PARTS,
    Permission.SCAN_PARTS,
    Permission.ACCESS_LOCATION,
    Permission.TRACK_LOCATION,
    Permission.RECEIVE_NOTIFICATIONS,
    Permission.COMMUNICATE_WITH_DISPATCH,
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE,
    Permission.VIEW_PERFORMANCE,
  ],
  [Role.ADMIN]: [
    // Admins have all permissions
    ...Object.values(Permission),
  ],
};

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
}

class PermissionService {
  /**
   * Get user role based on profile
   */
  getUserRole(profile: UserProfile | null): Role | null {
    if (!profile) return null;
    
    if (profile.isAdmin) {
      return Role.ADMIN;
    }
    
    if (profile.technicianId) {
      return Role.TECHNICIAN;
    }
    
    return null;
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(profile: UserProfile | null, permission: Permission): PermissionCheckResult {
    if (!profile) {
      return {
        hasPermission: false,
        reason: 'User not authenticated',
      };
    }

    const role = this.getUserRole(profile);
    if (!role) {
      return {
        hasPermission: false,
        reason: 'User has no assigned role',
      };
    }

    const rolePermissions = ROLE_PERMISSIONS[role];
    const hasPermission = rolePermissions.includes(permission);

    return {
      hasPermission,
      reason: hasPermission ? undefined : `Role ${role} does not have permission ${permission}`,
    };
  }

  /**
   * Check if user has multiple permissions (all required)
   */
  hasAllPermissions(profile: UserProfile | null, permissions: Permission[]): PermissionCheckResult {
    for (const permission of permissions) {
      const result = this.hasPermission(profile, permission);
      if (!result.hasPermission) {
        return result;
      }
    }

    return {hasPermission: true};
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(profile: UserProfile | null, permissions: Permission[]): PermissionCheckResult {
    if (!profile) {
      return {
        hasPermission: false,
        reason: 'User not authenticated',
      };
    }

    for (const permission of permissions) {
      const result = this.hasPermission(profile, permission);
      if (result.hasPermission) {
        return {hasPermission: true};
      }
    }

    return {
      hasPermission: false,
      reason: `User does not have any of the required permissions: ${permissions.join(', ')}`,
    };
  }

  /**
   * Validate technician role specifically
   */
  isTechnician(profile: UserProfile | null): boolean {
    const role = this.getUserRole(profile);
    return role === Role.TECHNICIAN || role === Role.ADMIN;
  }

  /**
   * Validate admin role specifically
   */
  isAdmin(profile: UserProfile | null): boolean {
    const role = this.getUserRole(profile);
    return role === Role.ADMIN;
  }

  /**
   * Get all permissions for a user
   */
  getUserPermissions(profile: UserProfile | null): Permission[] {
    const role = this.getUserRole(profile);
    if (!role) return [];
    
    return ROLE_PERMISSIONS[role];
  }

  /**
   * Check if user can access the mobile app (must be technician or admin)
   */
  canAccessMobileApp(profile: UserProfile | null): PermissionCheckResult {
    if (!profile) {
      return {
        hasPermission: false,
        reason: 'User not authenticated',
      };
    }

    if (!this.isTechnician(profile)) {
      return {
        hasPermission: false,
        reason: 'User must be a technician to access the mobile app',
      };
    }

    return {hasPermission: true};
  }
}

export const permissionService = new PermissionService();