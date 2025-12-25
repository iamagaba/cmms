import React, {createContext, useContext, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {User} from '@supabase/supabase-js';

import {authService, UserProfile} from '@/services/auth';
import {sessionManager, SessionEvent} from '@/services/sessionManager';
import {SessionWarningModal} from '@/components/auth/SessionWarningModal';
import {supabase} from '@/services/supabase';

interface AuthContextType {
  // Auth state
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTechnician: boolean;
  
  // Biometric state
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  
  // Session state
  sessionWarningVisible: boolean;
  timeUntilLogout: number;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  authenticateWithBiometrics: () => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  
  // Session actions
  extendSession: () => void;
  updateActivity: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Biometric state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  
  // Session state
  const [sessionWarningVisible, setSessionWarningVisible] = useState(false);
  const [timeUntilLogout, setTimeUntilLogout] = useState(0);

  // Computed state
  const isTechnician = !!profile?.technicianId;

  useEffect(() => {
    initializeAuth();
    setupSessionManager();
    
    return () => {
      sessionManager.destroy();
    };
  }, []);

  useEffect(() => {
    // Listen for auth state changes
    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session?.user);
        
        if (event === 'SIGNED_OUT') {
          handleSignOut();
        } else if (session?.user) {
          await handleSignIn(session.user);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Initialize session manager
      await sessionManager.initialize();
      
      // Get current user and profile
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        await handleSignIn(currentUser);
      } else {
        setIsLoading(false);
      }
      
      // Check biometric availability
      const biometricAvail = await authService.isBiometricAuthAvailable();
      const biometricEnabl = await authService.isBiometricEnabled();
      
      setBiometricAvailable(biometricAvail);
      setBiometricEnabledState(biometricEnabl);
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      setIsLoading(false);
    }
  };

  const setupSessionManager = () => {
    const removeListener = sessionManager.addEventListener(handleSessionEvent);
    return removeListener;
  };

  const handleSessionEvent = (event: SessionEvent) => {
    switch (event.type) {
      case 'session_warning':
        setTimeUntilLogout(event.timeRemaining || 0);
        setSessionWarningVisible(true);
        break;
        
      case 'session_expired':
        setSessionWarningVisible(false);
        Alert.alert(
          'Session Expired',
          'You have been signed out due to inactivity.',
          [{text: 'OK'}]
        );
        break;
        
      case 'session_extended':
        setSessionWarningVisible(false);
        break;
    }
  };

  const handleSignIn = async (user: User) => {
    try {
      const userProfile = await authService.getUserProfile(user.id);
      
      setUser(user);
      setProfile(userProfile);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Start session management for authenticated users
      sessionManager.resume();
      
    } catch (error) {
      console.error('Error handling sign in:', error);
      setUser(user);
      setProfile(null);
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    setSessionWarningVisible(false);
    
    // Pause session management
    sessionManager.pause();
  };

  // Auth actions
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.signIn({email, password});
      // Auth state will be updated by the onAuthStateChange listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      // Auth state will be updated by the onAuthStateChange listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const authenticateWithBiometrics = async () => {
    setIsLoading(true);
    try {
      const result = await authService.authenticateWithBiometrics();
      if (!result.success) {
        setIsLoading(false);
        throw new Error(result.error);
      }
      // Auth state will be updated by the onAuthStateChange listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const setBiometricEnabled = async (enabled: boolean) => {
    try {
      await authService.setBiometricEnabled(enabled);
      setBiometricEnabledState(enabled);
    } catch (error) {
      console.error('Error setting biometric preference:', error);
      throw error;
    }
  };

  // Session actions
  const extendSession = () => {
    sessionManager.extendSession();
    setSessionWarningVisible(false);
  };

  const updateActivity = () => {
    if (isAuthenticated) {
      sessionManager.updateActivity();
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const updatedProfile = await authService.getUserProfile(user.id);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const handleSessionWarningLogout = async () => {
    setSessionWarningVisible(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Error during session warning logout:', error);
    }
  };

  const contextValue: AuthContextType = {
    // Auth state
    user,
    profile,
    isLoading,
    isAuthenticated,
    isTechnician,
    
    // Biometric state
    biometricAvailable,
    biometricEnabled,
    
    // Session state
    sessionWarningVisible,
    timeUntilLogout,
    
    // Auth actions
    signIn,
    signOut,
    authenticateWithBiometrics,
    setBiometricEnabled,
    
    // Session actions
    extendSession,
    updateActivity,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      
      <SessionWarningModal
        visible={sessionWarningVisible}
        timeRemaining={timeUntilLogout}
        onExtendSession={extendSession}
        onLogout={handleSessionWarningLogout}
      />
    </AuthContext.Provider>
  );
};