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
  const { data: settingsData, isLoading } = useQuery<SystemSetting[]>({
    queryKey: ['system_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('system_settings').select('key, value');
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const settings = useMemo(() => {
    if (!settingsData) return {};
    return settingsData.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as SystemSettings);
  }, [settingsData]);

  return (
    <SystemSettingsContext.Provider value={{ settings, isLoading }}>
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