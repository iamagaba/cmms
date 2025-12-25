import {useState, useEffect} from 'react';
import {localizationService} from '@/services/localizationService';
import {Language} from '@/services/settingsService';

export interface LocalizationHook {
  t: (key: string) => string;
  currentLanguage: Language;
  setLanguage: (language: Language) => Promise<void>;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

export const useLocalization = (): LocalizationHook => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeLocalization();
  }, []);

  const initializeLocalization = async () => {
    try {
      await localizationService.initialize();
      setCurrentLanguage(localizationService.getCurrentLanguage());
    } catch (error) {
      console.error('Error initializing localization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (language: Language) => {
    try {
      await localizationService.setLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error setting language:', error);
      throw error;
    }
  };

  return {
    t: localizationService.t.bind(localizationService),
    currentLanguage,
    setLanguage,
    formatDate: localizationService.formatDate.bind(localizationService),
    formatTime: localizationService.formatTime.bind(localizationService),
    formatCurrency: localizationService.formatCurrency.bind(localizationService),
    isLoading,
  };
};