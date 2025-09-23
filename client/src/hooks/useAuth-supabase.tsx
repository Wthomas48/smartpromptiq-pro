import React, { useState, useEffect, createContext, useContext } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { supabase, auth } from "@/lib/supabase";
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  subscriptionTier?: string;
  tokenBalance?: number;
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  role?: 'USER' | 'ADMIN';
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateTokenBalance: (newBalance: number) => void;
  updateUser: (userData: any) => void;
  isAdmin: () => boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Convert Supabase user to app user format
  const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      firstName: supabaseUser.user_metadata?.firstName || '',
      lastName: supabaseUser.user_metadata?.lastName || '',
      role: 'USER',
      subscriptionTier: 'FREE',
      tokenBalance: 100, // Default token balance
    };
  };

  // Initialize auth state from Supabase session
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing Supabase auth...');

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('✅ Found existing session:', session);
          const appUser = convertSupabaseUser(session.user);

          setUser(appUser);
          setToken(session.access_token);
          setSession(session);
          setIsAuthenticated(true);

          // Store token for compatibility with existing API calls
          localStorage.setItem('token', session.access_token);
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 Auth state changed:', event, session);

      if (event === 'SIGNED_IN' && session?.user) {
        const appUser = convertSupabaseUser(session.user);
        setUser(appUser);
        setToken(session.access_token);
        setSession(session);
        setIsAuthenticated(true);
        localStorage.setItem('token', session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        setSession(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔍 Attempting Supabase login...');

      const { data, error } = await auth.signIn(email, password);

      if (error) {
        console.error('❌ Login error:', error);
        throw new Error(error.message);
      }

      if (data.user && data.session) {
        const appUser = convertSupabaseUser(data.user);
        setUser(appUser);
        setToken(data.session.access_token);
        setSession(data.session);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.session.access_token);

        toast({
          title: "Success",
          description: "Successfully signed in!",
        });

        console.log('✅ Login successful');
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setIsLoading(true);
      console.log('🔍 Attempting Supabase signup...');

      const { data, error } = await auth.signUp(email, password, {
        firstName,
        lastName
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Signup successful:', data);

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "Please check your email to confirm your account",
        });
      } else if (data.user && data.session) {
        const appUser = convertSupabaseUser(data.user);
        setUser(appUser);
        setToken(data.session.access_token);
        setSession(data.session);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.session.access_token);

        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      }
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🔍 Logging out...');
      await auth.signOut();

      // Clear local state
      setUser(null);
      setToken(null);
      setSession(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');

      setLocation('/signin');

      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setUser(null);
        setToken(null);
        setSession(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        return;
      }

      if (session.user) {
        const appUser = convertSupabaseUser(session.user);
        setUser(appUser);
        setToken(session.access_token);
        setSession(session);
        setIsAuthenticated(true);
        localStorage.setItem('token', session.access_token);
      }
    } catch (error) {
      console.error('❌ Check auth error:', error);
    }
  };

  const updateTokenBalance = (newBalance: number) => {
    if (user) {
      setUser({ ...user, tokenBalance: newBalance });
    }
  };

  const updateUser = (userData: any) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const refreshUserData = async () => {
    await checkAuth();
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token,
    session,
    login,
    signup,
    logout,
    checkAuth,
    updateTokenBalance,
    updateUser,
    isAdmin,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};