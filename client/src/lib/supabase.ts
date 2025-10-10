import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only log in development to avoid multiple instance warnings
if (import.meta.env.DEV) {
  console.log('🔍 Supabase Configuration:', {
    supabaseUrl,
    supabaseAnonKeyLength: supabaseAnonKey?.length,
    environment: import.meta.env.MODE
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.error('❌ Missing Supabase environment variables:', {
      VITE_SUPABASE_URL: supabaseUrl,
      VITE_SUPABASE_ANON_KEY: supabaseAnonKey?.slice(0, 10) + '...'
    });
  }
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create a singleton instance to prevent multiple GoTrueClient instances
let supabaseInstance: any = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // More secure for SPAs
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, userData?: { firstName?: string; lastName?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}