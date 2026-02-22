import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Check if we're in a build environment without env vars
const isBuildTime = typeof window === 'undefined' && (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY);

if (!isBuildTime && (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY)) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create a dummy client for build time if env vars are missing
const createSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    // Return a proxy that will throw at runtime if actually used
    return new Proxy({} as any, {
      get() {
        throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.');
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
