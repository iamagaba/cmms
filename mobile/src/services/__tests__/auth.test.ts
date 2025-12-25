import {authService} from '../auth';
import {supabase} from '../supabase';
import * as Keychain from 'react-native-keychain';

// Mock dependencies
jest.mock('../supabase');
jest.mock('react-native-keychain');
jest.mock('../tokenManager');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockKeychain = Keychain as jest.Mocked<typeof Keychain>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockSession = {
        user: mockUser,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {user: mockUser, session: mockSession},
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                first_name: 'John',
                last_name: 'Doe',
                is_admin: false,
                technicians: [{id: 'tech-123'}],
              },
              error: null,
            }),
          }),
        }),
      } as any);

      mockKeychain.setInternetCredentials.mockResolvedValue();

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockKeychain.setInternetCredentials).toHaveBeenCalledWith(
        'cmms-mobile-app',
        'test@example.com',
        'password123',
        expect.any(Object)
      );

      expect(result.user).toEqual(mockUser);
      expect(result.profile).toBeDefined();
    });

    it('should throw error for invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {user: null, session: null},
        error: {message: 'Invalid credentials'},
      });

      await expect(
        authService.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({error: null});
      mockKeychain.resetInternetCredentials.mockResolvedValue();

      await authService.signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(mockKeychain.resetInternetCredentials).toHaveBeenCalledWith('cmms-mobile-app');
    });
  });

  describe('biometric authentication', () => {
    it('should check biometric availability', async () => {
      mockKeychain.getSupportedBiometryType.mockResolvedValue(Keychain.BIOMETRY_TYPE.FACE_ID);

      const isAvailable = await authService.isBiometricAuthAvailable();

      expect(isAvailable).toBe(true);
      expect(mockKeychain.getSupportedBiometryType).toHaveBeenCalled();
    });

    it('should return false when biometrics not available', async () => {
      mockKeychain.getSupportedBiometryType.mockResolvedValue(null);

      const isAvailable = await authService.isBiometricAuthAvailable();

      expect(isAvailable).toBe(false);
    });

    it('should authenticate with biometrics successfully', async () => {
      mockKeychain.getInternetCredentials.mockResolvedValue({
        username: 'test@example.com',
        password: 'password123',
        service: 'cmms-mobile-app',
      });

      // Mock successful sign in
      const mockUser = {id: 'user-123', email: 'test@example.com'};
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {user: mockUser, session: {user: mockUser}},
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {id: 'user-123', technicians: [{id: 'tech-123'}]},
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await authService.authenticateWithBiometrics();

      expect(result.success).toBe(true);
      expect(mockKeychain.getInternetCredentials).toHaveBeenCalledWith(
        'cmms-mobile-app',
        expect.any(Object)
      );
    });

    it('should fail when no stored credentials', async () => {
      mockKeychain.getInternetCredentials.mockResolvedValue(false as any);

      const result = await authService.authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No stored credentials found');
    });
  });

  describe('user profile', () => {
    it('should get user profile successfully', async () => {
      const mockProfileData = {
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        is_admin: false,
        technicians: [{id: 'tech-123'}],
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfileData,
              error: null,
            }),
          }),
        }),
      } as any);

      mockSupabase.auth.getUser.mockResolvedValue({
        data: {user: {id: 'user-123', email: 'test@example.com'}},
        error: null,
      });

      const profile = await authService.getUserProfile('user-123');

      expect(profile).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: undefined,
        isAdmin: false,
        technicianId: 'tech-123',
      });
    });

    it('should return null when profile not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: {message: 'Profile not found'},
            }),
          }),
        }),
      } as any);

      const profile = await authService.getUserProfile('user-123');

      expect(profile).toBeNull();
    });
  });

  describe('technician role validation', () => {
    it('should validate technician role successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {user: {id: 'user-123', email: 'test@example.com'}},
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                technicians: [{id: 'tech-123'}],
              },
              error: null,
            }),
          }),
        }),
      } as any);

      const isValid = await authService.validateTechnicianRole();

      expect(isValid).toBe(true);
    });

    it('should return false for non-technician user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {user: {id: 'user-123', email: 'test@example.com'}},
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                technicians: [], // No technician record
              },
              error: null,
            }),
          }),
        }),
      } as any);

      const isValid = await authService.validateTechnicianRole();

      expect(isValid).toBe(false);
    });
  });
});