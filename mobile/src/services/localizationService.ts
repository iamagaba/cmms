import {settingsService, Language} from './settingsService';

// Basic localization strings
const translations = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    
    // Navigation
    dashboard: 'Dashboard',
    workOrders: 'Work Orders',
    assets: 'Assets',
    profile: 'Profile',
    
    // Work Orders
    workOrder: 'Work Order',
    priority: 'Priority',
    status: 'Status',
    customer: 'Customer',
    vehicle: 'Vehicle',
    
    // Profile
    editProfile: 'Edit Profile',
    settings: 'Settings',
    signOut: 'Sign Out',
    
    // Settings
    notifications: 'Notifications',
    theme: 'Theme',
    language: 'Language',
    privacy: 'Privacy & Data',
    performance: 'Performance',
  },
  es: {
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    
    // Navigation
    dashboard: 'Panel',
    workOrders: 'Órdenes de Trabajo',
    assets: 'Activos',
    profile: 'Perfil',
    
    // Work Orders
    workOrder: 'Orden de Trabajo',
    priority: 'Prioridad',
    status: 'Estado',
    customer: 'Cliente',
    vehicle: 'Vehículo',
    
    // Profile
    editProfile: 'Editar Perfil',
    settings: 'Configuración',
    signOut: 'Cerrar Sesión',
    
    // Settings
    notifications: 'Notificaciones',
    theme: 'Tema',
    language: 'Idioma',
    privacy: 'Privacidad y Datos',
    performance: 'Rendimiento',
  },
  fr: {
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    
    // Navigation
    dashboard: 'Tableau de Bord',
    workOrders: 'Ordres de Travail',
    assets: 'Actifs',
    profile: 'Profil',
    
    // Work Orders
    workOrder: 'Ordre de Travail',
    priority: 'Priorité',
    status: 'Statut',
    customer: 'Client',
    vehicle: 'Véhicule',
    
    // Profile
    editProfile: 'Modifier le Profil',
    settings: 'Paramètres',
    signOut: 'Se Déconnecter',
    
    // Settings
    notifications: 'Notifications',
    theme: 'Thème',
    language: 'Langue',
    privacy: 'Confidentialité et Données',
    performance: 'Performance',
  },
};

class LocalizationService {
  private currentLanguage: Language = 'en';

  /**
   * Initialize localization service
   */
  async initialize(): Promise<void> {
    try {
      this.currentLanguage = await settingsService.getLanguage();
    } catch (error) {
      console.error('Error initializing localization:', error);
      this.currentLanguage = 'en';
    }
  }

  /**
   * Get translated string
   */
  t(key: keyof typeof translations.en): string {
    const languageTranslations = translations[this.currentLanguage];
    return languageTranslations?.[key] || translations.en[key] || key;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Set current language
   */
  async setLanguage(language: Language): Promise<void> {
    this.currentLanguage = language;
    await settingsService.setLanguage(language);
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Array<{code: Language; name: string; nativeName: string}> {
    return [
      {code: 'en', name: 'English', nativeName: 'English'},
      {code: 'es', name: 'Spanish', nativeName: 'Español'},
      {code: 'fr', name: 'French', nativeName: 'Français'},
    ];
  }

  /**
   * Format date according to current locale
   */
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const locales = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
    };

    return dateObj.toLocaleDateString(locales[this.currentLanguage], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format time according to current locale
   */
  formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const locales = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
    };

    return dateObj.toLocaleTimeString(locales[this.currentLanguage], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format currency according to current locale
   */
  formatCurrency(amount: number): string {
    const currencies = {
      en: {currency: 'USD', locale: 'en-US'},
      es: {currency: 'EUR', locale: 'es-ES'},
      fr: {currency: 'EUR', locale: 'fr-FR'},
    };

    const config = currencies[this.currentLanguage];
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
    }).format(amount);
  }
}

export const localizationService = new LocalizationService();