import React from 'react';
import {renderHook} from '@testing-library/react-native';
import {usePermissions} from '../usePermissions';
import {useAuth} from '../useAuth';
import {Permission, Role} from '@/services/permissions';
import {UserProfile} from '@/services/auth';

// Mock the useAuth hook
jest.mock('../useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('usePermissions', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return permission functions', () => {
    mockUseAuth.mockReturnValue({
      profile: mockTechnicianProfile,
    } as any);

    const {result} = renderHook(() => usePermissions());

    expect(result.current).toHaveProperty('hasPermission');
    expect(result.current).toHaveProperty('hasAllPermissions');
    expect(result.current).toHaveProperty('hasAnyPermission');
    expect(result.current).toHaveProperty('isTechnician');
    expect(result.current).toHaveProperty('isAdmin');
    expect(result.current).toHaveProperty('getUserPermissions');
    expect(result.current).toHaveProperty('canAccessMobileApp');
    expect(result.current).toHaveProperty('getUserRole');
  });

  it('should correctly check technician permissions', () => {
    mockUseAuth.mockReturnValue({
      profile: mockTechnicianProfile,
    } as any);

    const {result} = renderHook(() => usePermissions());

    const hasPermission = result.current.hasPermission(Permission.VIEW_WORK_ORDERS);
    expect(hasPermission.hasPermission).toBe(true);

    const isTechnician = result.current.isTechnician();
    expect(isTechnician).toBe(true);

    const isAdmin = result.current.isAdmin();
    expect(isAdmin).toBe(false);

    const canAccess = result.current.canAccessMobileApp();
    expect(canAccess.hasPermission).toBe(true);

    const role = result.current.getUserRole();
    expect(role).toBe(Role.TECHNICIAN);
  });

  it('should correctly check admin permissions', () => {
    mockUseAuth.mockReturnValue({
      profile: mockAdminProfile,
    } as any);

    const {result} = renderHook(() => usePermissions());

    const hasPermission = result.current.hasPermission(Permission.VIEW_WORK_ORDERS);
    expect(hasPermission.hasPermission).toBe(true);

    const isTechnician = result.current.isTechnician();
    expect(isTechnician).toBe(true); // Admins can act as technicians

    const isAdmin = result.current.isAdmin();
    expect(isAdmin).toBe(true);

    const canAccess = result.current.canAccessMobileApp();
    expect(canAccess.hasPermission).toBe(true);

    const role = result.current.getUserRole();
    expect(role).toBe(Role.ADMIN);
  });

  it('should handle null profile', () => {
    mockUseAuth.mockReturnValue({
      profile: null,
    } as any);

    const {result} = renderHook(() => usePermissions());

    const hasPermission = result.current.hasPermission(Permission.VIEW_WORK_ORDERS);
    expect(hasPermission.hasPermission).toBe(false);

    const isTechnician = result.current.isTechnician();
    expect(isTechnician).toBe(false);

    const isAdmin = result.current.isAdmin();
    expect(isAdmin).toBe(false);

    const canAccess = result.current.canAccessMobileApp();
    expect(canAccess.hasPermission).toBe(false);

    const role = result.current.getUserRole();
    expect(role).toBeNull();
  });

  it('should check multiple permissions correctly', () => {
    mockUseAuth.mockReturnValue({
      profile: mockTechnicianProfile,
    } as any);

    const {result} = renderHook(() => usePermissions());

    const hasAllPermissions = result.current.hasAllPermissions([
      Permission.VIEW_WORK_ORDERS,
      Permission.VIEW_ASSETS,
    ]);
    expect(hasAllPermissions.hasPermission).toBe(true);

    const hasAnyPermission = result.current.hasAnyPermission([
      Permission.VIEW_WORK_ORDERS,
      Permission.VIEW_ASSETS,
    ]);
    expect(hasAnyPermission.hasPermission).toBe(true);
  });

  it('should return user permissions list', () => {
    mockUseAuth.mockReturnValue({
      profile: mockTechnicianProfile,
    } as any);

    const {result} = renderHook(() => usePermissions());

    const permissions = result.current.getUserPermissions();
    expect(Array.isArray(permissions)).toBe(true);
    expect(permissions).toContain(Permission.VIEW_WORK_ORDERS);
    expect(permissions).toContain(Permission.VIEW_ASSETS);
  });

  it('should memoize results based on profile changes', () => {
    const {result, rerender} = renderHook(() => usePermissions());

    // First render with technician profile
    mockUseAuth.mockReturnValue({
      profile: mockTechnicianProfile,
    } as any);
    rerender();

    const firstResult = result.current;

    // Second render with same profile
    rerender();
    expect(result.current).toBe(firstResult); // Should be memoized

    // Third render with different profile
    mockUseAuth.mockReturnValue({
      profile: mockAdminProfile,
    } as any);
    rerender();

    expect(result.current).not.toBe(firstResult); // Should be new object
  });
});