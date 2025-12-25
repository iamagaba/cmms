import {supabase} from './supabase';
import {tokenManager} from './tokenManager';
import * as Keychain from 'react-native-keychain';
import {STORAGE_KEYS} from '@/utils/constants';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  technicianId?: string;
}

class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: AuthCredentials) {
    const {data, error} = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user data returned');
    }

    // Store credentials securely for biometric auth
    await this.storeCredentials(credentials);

    // Get user profile
    const profile = await this.getUserProfile(data.user.id);

    return {
      ...data,
      profile,
    };
  }

  /**
   * Sign out and clear all stored data
   */
  async signOut() {
    try {
      // Clear tokens
      await tokenManager.clearTokens();
      
      // Clear stored credentials
      await Keychain.resetInternetCredentials('cmms-mobile-app');
      
      // Clear biometric settings
      await Keychain.resetInternetCredentials(STORAGE_KEYS.BIOMETRIC_ENABLED);
      
      // Sign out from Supabase
      const {error} = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase signOut error:', error.message);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      throw new Error('Failed to sign out completely');
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const {data: {user}, error} = await supabase.auth.getUser();
    if (error) {
      throw new Error(error.message);
    }
    return user;
  }

  /**
   * Get user profile from the profiles table
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          is_admin,
          technicians!inner(id)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching user profile:', error.message);
        return null;
      }

      const user = await this.getCurrentUser();
      if (!user) return null;

      return {
        id: data.id,
        email: user.email || '',
        firstName: data.first_name,
        lastName: data.last_name,
        avatarUrl: data.avatar_url,
        isAdmin: data.is_admin,
        technicianId: data.technicians?.[0]?.id,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession() {
    const success = await tokenManager.refreshToken();
    if (!success) {
      throw new Error('Failed to refresh session');
    }
    
    const {data, error} = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Store credentials securely for biometric authentication
   */
  private async storeCredentials(credentials: AuthCredentials) {
    try {
      await Keychain.setInternetCredentials(
        'cmms-mobile-app',
        credentials.email,
        credentials.password,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
        }
      );
    } catch (error) {
      console.warn('Failed to store credentials:', error);
    }
  }

  /**
   * Get stored biometric credentials
   */
  async getBiometricCredentials(): Promise<AuthCredentials | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('cmms-mobile-app', {
        authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
        showModal: true,
        kLocalizedFallbackTitle: 'Use Passcode',
      });
      
      if (credentials && credentials.username && credentials.password) {
        return {
          email: credentials.username,
          password: credentials.password,
        };
      }
    } catch (error) {
      console.warn('Failed to retrieve biometric credentials:', error);
    }
    return null;
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async isBiometricAuthAvailable(): Promise<boolean> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType !== null && biometryType !== Keychain.BIOMETRY_TYPE.NONE;
    } catch (error) {
      console.warn('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Authenticate using biometric credentials
   */
  async authenticateWithBiometrics(): Promise<BiometricAuthResult> {
    try {
      const credentials = await this.getBiometricCredentials();
      if (!credentials) {
        return {
          success: false, 
          error: 'No stored credentials found. Please sign in with email and password first.'
        };
      }

      await this.signIn(credentials);
      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Biometric authentication failed',
      };
    }
  }

  /**
   * Enable or disable biometric authentication
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        await Keychain.setInternetCredentials(
          STORAGE_KEYS.BIOMETRIC_ENABLED,
          'biometric',
          'enabled'
        );
      } else {
        await Keychain.resetInternetCredentials(STORAGE_KEYS.BIOMETRIC_ENABLED);
        // Also clear stored credentials
        await Keychain.resetInternetCredentials('cmms-mobile-app');
      }
    } catch (error) {
      console.warn('Failed to set biometric preference:', error);
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const credentials = await Keychain.getInternetCredentials(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return !!credentials;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate technician role
   */
  async validateTechnicianRole(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;

      const profile = await this.getUserProfile(user.id);
      return !!profile?.technicianId;
    } catch (error) {
      console.error('Error validating technician role:', error);
      return false;
    }
  }

  /**
   * Get session expiration info
   */
  async getSessionInfo() {
    return await tokenManager.getTokenExpirationInfo();
  }
}

export const authService = new AuthService();