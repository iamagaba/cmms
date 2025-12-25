import {supabase} from './supabase';
import * as Keychain from 'react-native-keychain';
import {STORAGE_KEYS} from '@/utils/constants';

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

class TokenManager {
  private refreshPromise: Promise<void> | null = null;

  /**
   * Get current session tokens
   */
  async getTokens(): Promise<TokenInfo | null> {
    try {
      const {data: {session}} = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at || 0,
        tokenType: session.token_type || 'bearer',
      };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  }

  /**
   * Check if current token is expired or about to expire
   */
  async isTokenExpired(): Promise<boolean> {
    const tokens = await this.getTokens();
    if (!tokens) {
      return true;
    }

    // Consider token expired if it expires within the next 5 minutes
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();
    const expiresAt = tokens.expiresAt * 1000; // Convert to milliseconds

    return expiresAt - now < bufferTime;
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      await this.refreshPromise;
      return true;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      await this.refreshPromise;
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<void> {
    const {data, error} = await supabase.auth.refreshSession();
    
    if (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }

    if (!data.session) {
      throw new Error('No session returned after refresh');
    }

    // Store refresh timestamp
    await this.storeLastRefreshTime();
  }

  /**
   * Ensure token is valid, refresh if necessary
   */
  async ensureValidToken(): Promise<boolean> {
    const isExpired = await this.isTokenExpired();
    
    if (isExpired) {
      return await this.refreshToken();
    }
    
    return true;
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    try {
      // Clear from Supabase
      await supabase.auth.signOut();
      
      // Clear from secure storage
      await Keychain.resetInternetCredentials('supabase_sb-ohbcjwshjvukitbmyklx-auth-token');
      await Keychain.resetInternetCredentials('supabase_sb-ohbcjwshjvukitbmyklx-auth-token-code-verifier');
      
      // Clear last refresh time
      await this.clearLastRefreshTime();
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Store the last token refresh timestamp
   */
  private async storeLastRefreshTime(): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      await Keychain.setInternetCredentials(
        STORAGE_KEYS.LAST_SYNC,
        'last_token_refresh',
        timestamp
      );
    } catch (error) {
      console.warn('Failed to store last refresh time:', error);
    }
  }

  /**
   * Get the last token refresh timestamp
   */
  async getLastRefreshTime(): Promise<number | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(STORAGE_KEYS.LAST_SYNC);
      if (credentials && credentials.password) {
        return parseInt(credentials.password, 10);
      }
    } catch (error) {
      console.warn('Failed to get last refresh time:', error);
    }
    return null;
  }

  /**
   * Clear the last token refresh timestamp
   */
  private async clearLastRefreshTime(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.warn('Failed to clear last refresh time:', error);
    }
  }

  /**
   * Get token expiration info for debugging
   */
  async getTokenExpirationInfo(): Promise<{
    isExpired: boolean;
    expiresAt: Date | null;
    timeUntilExpiry: number | null;
  }> {
    const tokens = await this.getTokens();
    
    if (!tokens) {
      return {
        isExpired: true,
        expiresAt: null,
        timeUntilExpiry: null,
      };
    }

    const expiresAt = new Date(tokens.expiresAt * 1000);
    const now = Date.now();
    const timeUntilExpiry = tokens.expiresAt * 1000 - now;
    const isExpired = timeUntilExpiry <= 0;

    return {
      isExpired,
      expiresAt,
      timeUntilExpiry,
    };
  }
}

export const tokenManager = new TokenManager();