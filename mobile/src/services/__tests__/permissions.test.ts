import {permissionService, Permission, Role} from '../permissions';
import {UserProfile} from '../auth';

describe('PermissionService', () => {
  const mockTechnicianProfile: UserProfile = {
    id: 'user-123',
    email: 'technician@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isAdmin: false,
    technicianId: 'tech-123',
  };

  const mockAdminProfile: UserProfile = {
    id: 'admin-123',
    email: 'admin@example.com',
    firstName: 'Jane',
    lastName: 'Admin',
    isAdmin: true,
    technicianId: 'tech-456',
  };

  const mockNonTechnicianProfile: UserProfile = {
    id: 'user-456',
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    isAdmin: false,
  };

  describe('getUserRole', () => {
    it('should return ADMIN role for admin users', () => {
      const role = permissionService.getUserRole(mockAdminProfile);
      expect(role).toBe(Role.ADMIN);
    });

    it('should return TECHNICIAN role for technician users', () => {
      const role = permissionService.getUserRole(mockTechnicianProfile);
      expect(role).toBe(Role.TECHNICIAN);
    });

    it('should return null for users without roles', () => {
      const role = permissionService.getUserRole(mockNonTechnicianProfile);
      expect(role).toBeNull();
    });

    it('should return null for null profile', () => {
      const role = permissionService.getUserRole(null);
      expect(role).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('should grant permission to technician for technician permissions', () => {
      const result = permissionService.hasPermission(
        mockTechnicianProfile,
        Permission.VIEW_WORK_ORDERS
      );
      expect(result.hasPermission).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should grant permission to admin for all permissions', () => {
      const result = permissionService.hasPermission(
        mockAdminProfile,
        Permission.VIEW_WORK_ORDERS
      );
      expect(result.hasPermission).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should deny permission for users without roles', () => {
      const result = permissionService.hasPermission(
        mockNonTechnicianProfile,
        Permission.VIEW_WORK_ORDERS
      );
      expect(result.hasPermission).toBe(false);
      expect(result.reason).toBe('User has no assigned role');
    });

    it('should deny permission for null profile', () => {
      const result = permissionService.hasPermission(
        null,
        Permission.VIEW_WORK_ORDERS
      );
      expect(result.hasPermission).toBe(false);
      expect(result.reason).toBe('User not authenticated');
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all required permissions', () => {
      const result = permissionService.hasAllPermissions(
        mockTechnicianProfile,
        [Permission.VIEW_WORK_ORDERS, Permission.VIEW_ASSETS]
      );
      expect(result.hasPermission).toBe(true);
    });

    it('should return false when user lacks any required permission', () => {
      const result = permissionService.hasAllPermissions(
        mockNonTechnicianProfile,
        [Permission.VIEW_WORK_ORDERS, Permission.VIEW_ASSETS]
      );
      expect(result.hasPermission).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one permission', () => {
      const result = permissionService.hasAnyPermission(
        mockTechnicianProfile,
        [Permission.VIEW_WORK_ORDERS, Permission.VIEW_ASSETS]
      );
      expect(result.hasPermission).toBe(true);
    });

    it('should return false when user has none of the permissions', () => {
      const result = permissionService.hasAnyPermission(
        mockNonTechnicianProfile,
        [Permission.VIEW_WORK_ORDERS, Permission.VIEW_ASSETS]
      );
      expect(result.hasPermission).toBe(false);
    });
  });

  describe('isTechnician', () => {
    it('should return true for technician users', () => {
      expect(permissionService.isTechnician(mockTechnicianProfile)).toBe(true);
    });

    it('should return true for admin users (admins can act as technicians)', () => {
      expect(permissionService.isTechnician(mockAdminProfile)).toBe(true);
    });

    it('should return false for non-technician users', () => {
      expect(permissionService.isTechnician(mockNonTechnicianProfile)).toBe(false);
    });

    it('should return false for null profile', () => {
      expect(permissionService.isTechnician(null)).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin users', () => {
      expect(permissionService.isAdmin(mockAdminProfile)).toBe(true);
    });

    it('should return false for technician users', () => {
      expect(permissionService.isAdmin(mockTechnicianProfile)).toBe(false);
    });

    it('should return false for null profile', () => {
      expect(permissionService.isAdmin(null)).toBe(false);
    });
  });

  describe('canAccessMobileApp', () => {
    it('should allow access for technician users', () => {
      const result = permissionService.canAccessMobileApp(mockTechnicianProfile);
      expect(result.hasPermission).toBe(true);
    });

    it('should allow access for admin users', () => {
      const result = permissionService.canAccessMobileApp(mockAdminProfile);
      expect(result.hasPermission).toBe(true);
    });

    it('should deny access for non-technician users', () => {
      const result = permissionService.canAccessMobileApp(mockNonTechnicianProfile);
      expect(result.hasPermission).toBe(false);
      expect(result.reason).toBe('User must be a technician to access the mobile app');
    });

    it('should deny access for null profile', () => {
      const result = permissionService.canAccessMobileApp(null);
      expect(result.hasPermission).toBe(false);
      expect(result.reason).toBe('User not authenticated');
    });
  });

  describe('getUserPermissions', () => {
    it('should return technician permissions for technician users', () => {
      const permissions = permissionService.getUserPermissions(mockTechnicianProfile);
      expect(permissions).toContain(Permission.VIEW_WORK_ORDERS);
      expect(permissions).toContain(Permission.VIEW_ASSETS);
      expect(permissions.length).toBeGreaterThan(0);
    });

    it('should return all permissions for admin users', () => {
      const permissions = permissionService.getUserPermissions(mockAdminProfile);
      expect(permissions).toContain(Permission.VIEW_WORK_ORDERS);
      expect(permissions).toContain(Permission.VIEW_ASSETS);
      expect(permissions.length).toBe(Object.values(Permission).length);
    });

    it('should return empty array for users without roles', () => {
      const permissions = permissionService.getUserPermissions(mockNonTechnicianProfile);
      expect(permissions).toEqual([]);
    });

    it('should return empty array for null profile', () => {
      const permissions = permissionService.getUserPermissions(null);
      expect(permissions).toEqual([]);
    });
  });
});