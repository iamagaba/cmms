import {create} from 'zustand';
import {User} from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  biometricEnabled: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
  setLoading: (isLoading) => set({isLoading}),
  setBiometricEnabled: (biometricEnabled) => set({biometricEnabled}),
  reset: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      biometricEnabled: false,
    }),
}));