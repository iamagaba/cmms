/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SystemSetting {
  key: string;
  value: string | null;
}

interface SystemSettings {
  [key: string]: string | null;
}

interface SystemSettingsContextType {
  settings: SystemSettings;
  isLoading: boolean;
  updateSetting: (key: string, value: string | boolean | number | null) => void;
  updateSettings: (updates: Record<string, string | boolean | number | null>) => Promise<void>;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

const defaultSettings: SystemSettings = {
  organization_name: 'Fleet CMMS',
  logo_url: '/logo.png',
  color_scheme: 'light',
  notifications: 'true',
  defaultPriority: 'Medium',
  slaThreshold: '3',
  sla_config: '{}',
};

export const SystemSettingsProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading, error } = useQuery<SystemSetting[]>({
    queryKey: ['system_settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('system_settings').select('key, value');
        if (error) {
          console.warn('System settings table not found or not accessible:', error.message);
          return Object.entries(defaultSettings).map(([key, value]) => ({ key, value }));
        }
        return data || [];
      } catch (err) {
        console.warn('Failed to load system settings:', err);
        return Object.entries(defaultSettings).map(([key, value]) => ({ key, value }));
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string | boolean | number | null }) => {
      const { error } = await supabase.from('system_settings').upsert({ key, value: value?.toString() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_settings'] });
    },
  });

  const settings = useMemo(() => {
    if (!settingsData) return defaultSettings;
    return settingsData.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as SystemSettings);
  }, [settingsData]);

  const isDarkMode = settings['color_scheme'] === 'dark';

  // Set initial dark mode class
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-mode', isDarkMode);
    }
  }, [isDarkMode]);

  const updateSetting = (key: string, value: string | boolean | number | null) => {
    updateMutation.mutate({ key, value });
  };

  const updateSettings = async (updates: Record<string, string | boolean | number | null>) => {
    // Update multiple settings in parallel
    const promises = Object.entries(updates).map(([key, value]) =>
      supabase.from('system_settings').upsert({ key, value: value?.toString() || null })
    );

    await Promise.all(promises);
    queryClient.invalidateQueries({ queryKey: ['system_settings'] });
  };

  const toggleDarkMode = () => {
    updateSetting('color_scheme', isDarkMode ? 'light' : 'dark');
    // Toggle body class for dark mode
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-mode', !isDarkMode);
    }
  };

  // Don't block rendering if system settings fail to load
  const contextValue = useMemo(() => ({
    settings,
    isLoading: isLoading && !error, // Don't show loading if there's an error
    updateSetting,
    updateSettings,
    toggleDarkMode,
    isDarkMode,
  }), [settings, isLoading, error, isDarkMode]);

  return (
    <SystemSettingsContext.Provider value={contextValue}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
};