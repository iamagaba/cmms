import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import Constants from 'expo-constants';

// Supabase configuration - loaded from environment variables
const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Custom storage implementation with secure token handling
class SecureStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      // For sensitive tokens, use Keychain
      if (key.includes('token') || key.includes('refresh')) {
        const credentials = await Keychain.getInternetCredentials(`supabase_${key}`);
        return credentials ? credentials.password : null;
      }
      // For other data, use AsyncStorage
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('SecureStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      // For sensitive tokens, use Keychain
      if (key.includes('token') || key.includes('refresh')) {
        await Keychain.setInternetCredentials(`supabase_${key}`, key, value);
      } else {
        // For other data, use AsyncStorage
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('SecureStorage setItem error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      // For sensitive tokens, use Keychain
      if (key.includes('token') || key.includes('refresh')) {
        await Keychain.resetInternetCredentials(`supabase_${key}`);
      } else {
        // For other data, use AsyncStorage
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('SecureStorage removeItem error:', error);
    }
  }
}

const secureStorage = new SecureStorage();

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Mobile-specific configuration
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'cmms-mobile-app',
    },
  },
});

// Export configuration for debugging (DO NOT log in production)
export const supabaseConfig = {
  url: SUPABASE_URL,
  // Never export the actual key, just confirm it exists
  hasKey: !!SUPABASE_PUBLISHABLE_KEY,
};

// Export types for use throughout the app
export type {Database} from '@/types';
