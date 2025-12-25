import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'fr';
export type ImageQuality = 'low' | 'medium' | 'high';

export interface NotificationSettings {
  workOrderUpdates: boolean;
  emergencyAlerts: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PrivacySettings {
  locationTracking: boolean;
  analyticsEnabled: boolean;
  crashReporting: boolean;
}

export interface PerformanceSettings {
  offlineMode: boolean;
  autoSync: boolean;
  imageQuality: ImageQuality;
}

export interface AppSettings {
  notifications: NotificationSettings;
  theme: ThemeMode;
  language: Language;
  privacy: PrivacySettings;
  performance: PerformanceSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    workOrderUpdates: true,
    emergencyAlerts: true,
    systemNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  theme: 'system',
  language: 'en',
  privacy: {
    locationTracking: true,
    analyticsEnabled: true,
    crashReporting: true,
  },
  performance: {
    offlineMode: true,
    autoSync: true,
    imageQuality: 'medium',
  },
};

class SettingsService {
  private readonly SETTINGS_KEY = STORAGE_KEYS.APP_SETTINGS;

  /**
   * Get current app settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        // Merge with defaults to ensure all properties exist
        return this.mergeWithDefaults(settings);
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update app settings
   */
  async updateSettings(settings: AppSettings): Promise<void> {
    try {
      const settingsJson = JSON.stringify(settings);
      await AsyncStorage.setItem(this.SETTINGS_KEY, settingsJson);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Get specific setting value
   */
  async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const settings = await this.getSettings();
    return settings[key];
  }

  /**
   * Update specific setting
   */
  async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    const settings = await this.getSettings();
    settings[key] = value;
    await this.updateSettings(settings);
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SETTINGS_KEY);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw new Error('Failed to reset settings');
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    const settings = await this.getSettings();
    return settings.notifications;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(notifications: Partial<NotificationSettings>): Promise<void> {
    const settings = await this.getSettings();
    settings.notifications = {...settings.notifications, ...notifications};
    await this.updateSettings(settings);
  }

  /**
   * Get theme setting
   */
  async getTheme(): Promise<ThemeMode> {
    const settings = await this.getSettings();
    return settings.theme;
  }

  /**
   * Update theme setting
   */
  async setTheme(theme: ThemeMode): Promise<void> {
    await this.updateSetting('theme', theme);
  }

  /**
   * Get language setting
   */
  async getLanguage(): Promise<Language> {
    const settings = await this.getSettings();
    return settings.language;
  }

  /**
   * Update language setting
   */
  async setLanguage(language: Language): Promise<void> {
    await this.updateSetting('language', language);
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    const settings = await this.getSettings();
    return settings.privacy;
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(privacy: Partial<PrivacySettings>): Promise<void> {
    const settings = await this.getSettings();
    settings.privacy = {...settings.privacy, ...privacy};
    await this.updateSettings(settings);
  }

  /**
   * Get performance settings
   */
  async getPerformanceSettings(): Promise<PerformanceSettings> {
    const settings = await this.getSettings();
    return settings.performance;
  }

  /**
   * Update performance settings
   */
  async updatePerformanceSettings(performance: Partial<PerformanceSettings>): Promise<void> {
    const settings = await this.getSettings();
    settings.performance = {...settings.performance, ...performance};
    await this.updateSettings(settings);
  }

  /**
   * Clear app cache
   */
  async clearCache(): Promise<void> {
    try {
      // Get all keys from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      
      // Filter out keys that should be preserved (settings, auth tokens, etc.)
      const cacheKeys = keys.filter(key => 
        key.startsWith('cache_') || 
        key.startsWith('offline_') ||
        key.includes('image_cache') ||
        key.includes('work_order_cache')
      );
      
      // Remove cache keys
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw new Error('Failed to clear cache');
    }
  }

  /**
   * Get app data size (approximate)
   */
  async getDataSize(): Promise<{
    totalSize: number;
    cacheSize: number;
    settingsSize: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      let cacheSize = 0;
      let settingsSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        const size = value ? value.length : 0;
        
        totalSize += size;
        
        if (key.startsWith('cache_') || key.startsWith('offline_')) {
          cacheSize += size;
        } else if (key === this.SETTINGS_KEY) {
          settingsSize += size;
        }
      }

      return {
        totalSize,
        cacheSize,
        settingsSize,
      };
    } catch (error) {
      console.error('Error calculating data size:', error);
      return {
        totalSize: 0,
        cacheSize: 0,
        settingsSize: 0,
      };
    }
  }

  /**
   * Export settings for backup
   */
  async exportSettings(): Promise<string> {
    try {
      const settings = await this.getSettings();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw new Error('Failed to export settings');
    }
  }

  /**
   * Import settings from backup
   */
  async importSettings(settingsJson: string): Promise<void> {
    try {
      const settings = JSON.parse(settingsJson);
      const validatedSettings = this.mergeWithDefaults(settings);
      await this.updateSettings(validatedSettings);
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error('Failed to import settings');
    }
  }

  /**
   * Merge settings with defaults to ensure all properties exist
   */
  private mergeWithDefaults(settings: Partial<AppSettings>): AppSettings {
    return {
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...settings.notifications,
      },
      theme: settings.theme || DEFAULT_SETTINGS.theme,
      language: settings.language || DEFAULT_SETTINGS.language,
      privacy: {
        ...DEFAULT_SETTINGS.privacy,
        ...settings.privacy,
      },
      performance: {
        ...DEFAULT_SETTINGS.performance,
        ...settings.performance,
      },
    };
  }
}

export const settingsService = new SettingsService();