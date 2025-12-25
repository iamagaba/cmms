/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export const SystemSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data: settingsData, isLoading, error } = useQuery<SystemSetting[]>({
    queryKey: ['system_settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('system_settings').select('key, value');
        if (error) {
          console.warn('System settings table not found or not accessible:', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('Failed to load system settings:', err);
        return [];
      }
    },
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });

  const settings = useMemo(() => {
    if (!settingsData) return {};
    return settingsData.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as SystemSettings);
  }, [settingsData]);

  // Don't block rendering if system settings fail to load
  const contextValue = useMemo(() => ({
    settings,
    isLoading: isLoading && !error // Don't show loading if there's an error
  }), [settings, isLoading, error]);

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