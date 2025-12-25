import {useAuthContext} from '@/context/AuthContext';

/**
 * Hook to access authentication state and actions
 * This is a wrapper around the AuthContext for backward compatibility
 */
export const useAuth = () => {
  return useAuthContext();
};