import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create a dummy client for build time if env vars are missing
const createSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.warn('Supabase environment variables not found. Using placeholder client.');
    // Return a proxy that will throw at runtime if actually used
    return new Proxy({} as any, {
      get() {
        if (typeof window !== 'undefined') {
          throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.');
        }
        // During SSR/build, return another proxy to avoid errors
        return new Proxy({} as any, {
          get() {
            return () => Promise.resolve({ data: null, error: null });
          }
        });
      }
    });
  }

  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'fleet-auth-token',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-application-name': 'fleet-cmms-mobile'
      }
    }
  });
};

export const supabase = createSupabaseClient();
