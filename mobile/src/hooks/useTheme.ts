import {useState, useEffect} from 'react';
import {Appearance, ColorSchemeName} from 'react-native';
import {settingsService, ThemeMode} from '@/services/settingsService';

export interface ThemeHook {
  currentTheme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => Promise<void>;
  isLoading: boolean;
}

export const useTheme = (): ThemeHook => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
    
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await settingsService.getTheme();
      setCurrentTheme(savedTheme);
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (theme: ThemeMode) => {
    try {
      await settingsService.setTheme(theme);
      setCurrentTheme(theme);
    } catch (error) {
      console.error('Error setting theme:', error);
      throw error;
    }
  };

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light';
    }
    return currentTheme;
  };

  return {
    currentTheme,
    effectiveTheme: getEffectiveTheme(),
    setTheme,
    isLoading,
  };
};