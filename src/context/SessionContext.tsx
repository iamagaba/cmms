/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { Loader, Stack, Text } from '@/components/tailwind-components';

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  profile: Profile | null;
  isLoadingProfile: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading && isMounted) {
        console.warn('Session loading timeout - continuing without session');
        setIsLoading(false);
      }
    }, 10000); // Increased to 10 seconds

    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
        } else {
          setSession(session);
        }

        setIsLoading(false);
        clearTimeout(timeout);

        // Fetch profile asynchronously without blocking
        if (session?.user?.id && isMounted) {
          setIsLoadingProfile(true);
          try {
            const { data, error: pErr } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (!isMounted) return;

            if (pErr) {
              console.warn('Failed to load profile:', pErr);
            }
            setProfile((data as Profile) || null);
          } catch (e: unknown) {
            console.warn('Profile fetch error:', e);
            if (isMounted) setProfile(null);
          } finally {
            if (isMounted) setIsLoadingProfile(false);
          }
        } else if (isMounted) {
          setProfile(null);
          setIsLoadingProfile(false);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
        if (isMounted) {
          setIsLoading(false);
          setSession(null);
        }
        clearTimeout(timeout);
      }
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setSession(session);
      setIsLoading(false);

      if (session?.user?.id) {
        setIsLoadingProfile(true);
        const fetchProfile = async () => {
          try {
            const { data, error: pErr } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (!isMounted) return;

            if (pErr) {
              console.warn('Failed to load profile on auth change:', pErr);
            }
            setProfile((data as Profile) || null);
          } catch (e: unknown) {
            console.warn('Profile fetch error:', e);
            if (isMounted) setProfile(null);
          } finally {
            if (isMounted) setIsLoadingProfile(false);
          }
        };
        fetchProfile();
      } else if (isMounted) {
        setProfile(null);
        setIsLoadingProfile(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, isLoading, profile, isLoadingProfile }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};