// lib/supabase-auth.ts
import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface SignupResult {
  user: any
  profile: UserProfile | null
  needsEmailConfirmation: boolean
}

export interface UseSupabaseAuthState {
  loading: boolean
  error: string | null
  user: any | null
  profile: UserProfile | null
  session: any | null
}

export interface UseSupabaseAuthActions {
  signupWithEmailPassword: (email: string, password: string, fullName?: string) => Promise<SignupResult>
  signupWithOAuth: (provider: 'github' | 'google', redirectTo?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>) => Promise<void>
  reset: () => void
}

export type UseSupabaseAuth = UseSupabaseAuthState & UseSupabaseAuthActions

// ============================================================================
// SUPABASE CLIENT SETUP
// ============================================================================

function createSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

export const supabase = createSupabaseClient()

// ============================================================================
// UTILITIES
// ============================================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function getReadableAuthError(error: any): string {
  const message = error?.message || error?.error_description || 'Unknown error'

  switch (message) {
    case 'Invalid login credentials':
      return 'Invalid email or password'
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link'
    case 'User already registered':
      return 'An account with this email already exists'
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long'
    case 'Signup disabled':
      return 'Account registration is currently disabled'
    case 'Email link is invalid or has expired':
      return 'The confirmation link has expired. Please request a new one.'
    default:
      if (message.includes('rate limit')) {
        return 'Too many requests. Please wait a moment and try again.'
      }
      if (message.includes('SMTP')) {
        return 'Email service is temporarily unavailable. Please try again later.'
      }
      if (message.toLowerCase().includes('weak password')) {
        return 'Password is too weak. Please choose a stronger password.'
      }
      return message
  }
}

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

export async function fetchOwnProfileWithRetry(userId?: string, retries = 5): Promise<UserProfile | null> {
  let id = userId;
  if (!id) {
    try {
      const result = await supabase.auth.getUser();
      id = result.data.user?.id;
    } catch (e: any) {
      // Silently handle 403 errors (expected for unauthenticated users)
      if (e?.code !== 403 && e?.status !== 403) {
        console.error('Error getting user:', e);
      }
    }
  }
  if (!id) throw new Error('No user ID available')

  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (data) return data
      if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found

      // If not found and we have retries left, wait and try again
      if (i < retries - 1) await delay(500)
    } catch (error) {
      console.error(`Profile fetch attempt ${i + 1} failed:`, error)
      if (i === retries - 1) throw error
    }
  }
  return null
}

export async function updateOwnProfile(
  updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>
): Promise<UserProfile> {
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data?.user;
  } catch (e: any) {
    // Silently handle 403 errors
    if (e?.code !== 403 && e?.status !== 403) {
      throw e;
    }
  }
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

export async function signupWithEmailPassword(
  email: string,
  password: string,
  fullName?: string
): Promise<SignupResult> {
  try {
    console.log('🚀 Starting Supabase signup:', { email, hasFullName: !!fullName })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: fullName ? { full_name: fullName } : undefined
      }
    })

    if (error) {
      console.error('❌ Supabase signup error:', error)
      throw new Error(getReadableAuthError(error))
    }
    if (!data.user) throw new Error('Signup failed - no user returned')

    console.log('✅ Supabase signup success:', {
      userId: data.user.id,
      hasSession: !!data.session,
      emailConfirmed: !!data.user.email_confirmed_at
    })

    // Check if email confirmation is required
    const needsEmailConfirmation = !data.session && data.user && !data.user.email_confirmed_at

    let profile: UserProfile | null = null

    // Only fetch profile if we have a session (user is immediately signed in)
    if (data.session && data.user) {
      try {
        console.log('📋 Fetching user profile with retry...')
        profile = await fetchOwnProfileWithRetry(data.user.id)

        if (profile) {
          console.log('✅ Profile fetched:', { id: profile.id, fullName: profile.full_name })

          // Update full name if provided and profile name is empty
          if (fullName && !profile.full_name) {
            console.log('📝 Updating profile full name...')
            profile = await updateOwnProfile({ full_name: fullName })
            console.log('✅ Profile updated with full name')
          }
        } else {
          console.warn('⚠️ Profile not found after retries')
        }
      } catch (profileError) {
        console.warn('❌ Profile fetch/update failed:', profileError)
        // Don't throw - signup was successful, profile issue is secondary
      }
    }

    return {
      user: data.user,
      profile,
      needsEmailConfirmation: !!needsEmailConfirmation
    }
  } catch (error) {
    console.error('❌ Signup failed:', error)
    throw error instanceof Error ? error : new Error('Signup failed')
  }
}

export async function signupWithOAuth(
  provider: 'github' | 'google',
  redirectTo?: string
): Promise<void> {
  try {
    console.log('🔗 Starting OAuth signup:', { provider, redirectTo })

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('❌ OAuth signup error:', error)
      throw new Error(getReadableAuthError(error))
    }

    console.log('🔗 OAuth redirect initiated')
  } catch (error) {
    console.error('❌ OAuth signup failed:', error)
    throw error instanceof Error ? error : new Error('OAuth signup failed')
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  try {
    console.log('🔐 Starting email sign in:', { email })

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ Sign in error:', error)
      throw new Error(getReadableAuthError(error))
    }

    console.log('✅ Sign in successful')
  } catch (error) {
    console.error('❌ Sign in failed:', error)
    throw error instanceof Error ? error : new Error('Sign in failed')
  }
}

export async function signOut(): Promise<void> {
  try {
    console.log('👋 Signing out...')

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ Sign out error:', error)
      throw new Error(getReadableAuthError(error))
    }

    console.log('✅ Sign out successful')
  } catch (error) {
    console.error('❌ Sign out failed:', error)
    throw error instanceof Error ? error : new Error('Sign out failed')
  }
}

// ============================================================================
// REACT HOOK
// ============================================================================

export function useSupabaseAuth(): UseSupabaseAuth {
  const [state, setState] = useState<UseSupabaseAuthState>({
    loading: true,
    error: null,
    user: null,
    profile: null,
    session: null
  })

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing Supabase auth...')
        let session = null;
        let error = null;
        try {
          const result = await supabase.auth.getSession();
          session = result.data?.session;
          error = result.error;
        } catch (e: any) {
          // Silently handle 403 errors (expected for unauthenticated users)
          if (e?.code === 403 || e?.status === 403) {
            console.log('ℹ️ No active session (user not authenticated)');
          } else {
            error = e;
          }
        }

        if (error) throw error

        if (mounted) {
          if (session?.user) {
            console.log('✅ User session found:', { userId: session.user.id })

            // Fetch profile for authenticated user
            try {
              const profile = await fetchOwnProfileWithRetry(session.user.id)
              setState({
                loading: false,
                error: null,
                user: session.user,
                profile,
                session
              })
              console.log('✅ Auth initialized with profile')
            } catch (profileError) {
              console.warn('⚠️ Profile fetch failed during init:', profileError)
              setState({
                loading: false,
                error: null,
                user: session.user,
                profile: null,
                session
              })
            }
          } else {
            console.log('ℹ️ No user session found')
            setState({
              loading: false,
              error: null,
              user: null,
              profile: null,
              session: null
            })
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error)
        if (mounted) {
          setState({
            loading: false,
            error: getReadableAuthError(error),
            user: null,
            profile: null,
            session: null
          })
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', { event, hasSession: !!session })

        if (!mounted) return

        if (session?.user) {
          // User signed in - fetch profile
          try {
            const profile = await fetchOwnProfileWithRetry(session.user.id)
            setState(prev => ({
              ...prev,
              loading: false,
              error: null,
              user: session.user,
              profile,
              session
            }))
            console.log('✅ Auth state updated with profile')
          } catch (profileError) {
            console.warn('⚠️ Profile fetch failed during auth change:', profileError)
            setState(prev => ({
              ...prev,
              loading: false,
              error: null,
              user: session.user,
              profile: null,
              session
            }))
          }
        } else {
          // User signed out
          console.log('👋 User signed out')
          setState({
            loading: false,
            error: null,
            user: null,
            profile: null,
            session: null
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Actions
  const handleEmailSignup = async (email: string, password: string, fullName?: string): Promise<SignupResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await signupWithEmailPassword(email, password, fullName)

      // Update state if user is immediately signed in
      if (result.user && !result.needsEmailConfirmation) {
        setState(prev => ({
          ...prev,
          loading: false,
          user: result.user,
          profile: result.profile
        }))
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }

      return result
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Signup failed'
      }))
      throw error
    }
  }

  const handleOAuthSignup = async (provider: 'github' | 'google', redirectTo?: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await signupWithOAuth(provider, redirectTo)
      // OAuth will redirect, so we don't update state here
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'OAuth signup failed'
      }))
      throw error
    }
  }

  const handleSignIn = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await signInWithEmail(email, password)
      // Auth state change listener will update state
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }))
      throw error
    }
  }

  const handleSignOut = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await signOut()
      // Auth state change listener will update state
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }))
      throw error
    }
  }

  const refreshProfile = async (): Promise<void> => {
    if (!state.user) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const profile = await fetchOwnProfileWithRetry(state.user.id)
      setState(prev => ({ ...prev, loading: false, profile }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Profile refresh failed'
      }))
    }
  }

  const handleUpdateProfile = async (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>): Promise<void> => {
    if (!state.user) throw new Error('No authenticated user')

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const updatedProfile = await updateOwnProfile(updates)
      setState(prev => ({ ...prev, loading: false, profile: updatedProfile }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Profile update failed'
      }))
      throw error
    }
  }

  const reset = (): void => {
    setState(prev => ({ ...prev, error: null }))
  }

  return {
    ...state,
    signupWithEmailPassword: handleEmailSignup,
    signupWithOAuth: handleOAuthSignup,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshProfile,
    updateProfile: handleUpdateProfile,
    reset
  }
}