import React, { useState, useEffect, createContext, useContext } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, authAPI } from "@/config/api";
import { ensureSafeUser, isValidUser } from "@/utils/safeDataUtils";

interface User {
  id: string | number;  // Backend can return number, frontend converts to string
  email: string;
  firstName: string;    // Required field from backend
  lastName: string;     // Required field from backend
  role: string;         // Required field from backend (USER/ADMIN)
  roles: any[];         // Required array for validation
  permissions: any[];   // Required array for validation
  name?: string;        // Computed from firstName + lastName
  profileImageUrl?: string;
  subscriptionTier?: string;
  tokenBalance?: number;
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  plan?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
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
  // Synchronously initialize auth state from localStorage to avoid loading delay
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    return !!(storedToken && storedUser && storedToken.length >= 20);
  });
  const [isLoading, setIsLoading] = useState(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    // Only show loading if there's no cached auth data to display
    return !(storedToken && storedUser && storedToken.length >= 20);
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken && storedToken.length >= 20) {
        return JSON.parse(storedUser);
      }
    } catch {}
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    return (storedToken && storedUser && storedToken.length >= 20) ? storedToken : null;
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // ✅ ULTRA-ROBUST: Response normalization function
  const normalizeAuthResponse = (response: any): { token: string; user: any } => {

    let token: string | null = null;
    let user: any = null;

    // Try to extract token from various locations
    token = response.token ||
            response.data?.token ||
            response.access_token ||
            response.data?.access_token ||
            response.session?.access_token;

    // Try to extract user from various locations
    user = response.user ||
           response.data?.user ||
           response.userData ||
           response.data?.userData ||
           response.session?.user;


    if (!token || !user) {
      console.error('❌ Normalization failed:', {
        hasToken: !!token,
        hasUser: !!user,
        response
      });
      throw new Error('Authentication response missing token or user data');
    }

    return { token, user };
  };


  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Check Supabase session first
      try {
        const { auth } = await import('@/lib/supabase');
        const { session, error } = await auth.getSession();

        if (!error && session?.user) {
          const supabaseUser = {
            id: session.user.id,
            email: session.user.email!,
            firstName: session.user.user_metadata?.firstName || '',
            lastName: session.user.user_metadata?.lastName || '',
            role: (session.user.user_metadata?.role || 'USER') as 'USER' | 'ADMIN',
            subscriptionTier: session.user.user_metadata?.subscriptionTier || 'free',
            tokenBalance: session.user.user_metadata?.tokenBalance || 0
          };

          setToken(session.access_token);
          setIsAuthenticated(true);
          updateUser(supabaseUser);

          localStorage.setItem("token", session.access_token);
          localStorage.setItem("user", JSON.stringify(supabaseUser));

          setIsLoading(false);
          return;
        }
      } catch (supabaseError) {
        // Normal for unauthenticated users
      }

      // Check for auth token in localStorage (fallback for legacy/backend auth)
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        const storedUserData = JSON.parse(storedUser);

        try {
          const data = await authAPI.me();

          if (data.success && data.data?.user) {
            const backendUserData = data.data.user;

            const mergedUserData = {
              ...backendUserData,
              firstName: storedUserData.firstName || backendUserData.firstName,
              lastName: storedUserData.lastName || backendUserData.lastName,
            };

            setToken(storedToken);
            setIsAuthenticated(true);
            updateUser(mergedUserData);
            return;
          }
        } catch (backendError: any) {
          if (backendError.message && backendError.message.includes('Invalid token')) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to stored data if backend is unavailable
        setToken(storedToken);
        setIsAuthenticated(true);
        updateUser(storedUserData);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear any invalid tokens on app startup
  useEffect(() => {
    const clearInvalidTokens = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      // If we have a token but no user data, or vice versa, clear both
      if ((storedToken && !storedUser) || (!storedToken && storedUser)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        return;
      }

      // If we have both but the token looks invalid (too short, malformed, etc.)
      if (storedToken && storedToken.length < 20) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        return;
      }
    };

    clearInvalidTokens();
    checkAuth();
  }, []);

  // Listen for global unauthorized events (from API layer)
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // ✅ BACKEND ONLY: Login using backend authentication only
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await authAPI.login(email, password);

      if (response.success) {
        try {
          const { token, user } = normalizeAuthResponse(response);

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          setToken(token);
          setIsAuthenticated(true);
          updateUser(user);

          toast({
            title: "Welcome back!",
            description: `Signed in as ${user.firstName || user.email.split('@')[0]}`,
          });

          setTimeout(() => {
            if (user.role === 'ADMIN') {
              setLocation("/admin");
            } else {
              setLocation("/dashboard");
            }
          }, 100);
        } catch (normalizationError: any) {
          console.error('❌ Login response normalization failed:', normalizationError);
          throw new Error(`Login failed - invalid response format: ${normalizationError.message}`);
        }
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ BACKEND ONLY: Signup using backend authentication only
  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setIsLoading(true);

      const response = await authAPI.register(email, password, firstName, lastName);

      if (response.success) {
        try {
          const { token, user } = normalizeAuthResponse(response);

          // Create user with fallback values if needed
          const normalizedUser = {
            id: user.id || 'fallback-id',
            email: user.email || email || 'unknown@example.com',
            firstName: user.firstName || firstName || '',
            lastName: user.lastName || lastName || '',
            role: user.role || 'USER',
            subscriptionTier: user.subscriptionTier || user.plan || 'free',
            tokenBalance: user.tokenBalance || 0
          };

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(normalizedUser));

          setToken(token);
          setIsAuthenticated(true);
          updateUser(normalizedUser);

          toast({
            title: "Welcome to SmartPromptIQ!",
            description: `Account created for ${firstName || email.split('@')[0]}! 🎉`,
          });

          setTimeout(() => {
            setLocation("/dashboard");
          }, 100);
        } catch (normalizationError: any) {
          console.error('❌ Response normalization failed:', normalizationError);
          throw new Error(`Signup failed - invalid response format: ${normalizationError.message}`);
        }
      } else {
        throw new Error(response.message || "Signup failed");
      }
    } catch (error: any) {
      console.error("❌ Signup failed:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Please check your information",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut();

      // Clear local state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });

      // Redirect to home
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateUser = (userData: any) => {
    if (!userData) return;

    const safeUser = ensureSafeUser(userData);
    if (!safeUser) {
      console.error('updateUser: ensureSafeUser returned null');
      return;
    }

    if (!isValidUser(safeUser)) {
      console.error('updateUser: Invalid user object after safety processing');
      return;
    }

    setUser(safeUser);
    localStorage.setItem("user", JSON.stringify(safeUser));
  };

  const updateTokenBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, tokenBalance: newBalance };
      updateUser(updatedUser);
    }
  };

  // ✅ STREAMLINED: Safe isAdmin function as requested by user
  const isAdmin = () => {
    if (!user) return false;

    // Safe single role check
    if (user.role) {
      return user.role === 'admin' || user.role === 'ADMIN';
    }

    // Safe multiple roles check
    const roles = user.roles || [];
    return roles.some(role => {
      if (typeof role === 'string') return role === 'admin' || role === 'ADMIN';
      if (role && typeof role === 'object' && 'name' in role) return role.name === 'admin' || role.name === 'ADMIN';
      return false;
    });
  };

  const refreshUserData = async () => {
    try {
      // Check current Supabase session
      const { auth } = await import('@/lib/supabase');
      const { session, error } = await auth.getSession();

      if (error || !session?.user) {
        console.log("No valid Supabase session, clearing auth data...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        return;
      }

      // Update user data from Supabase session
      const updatedUser = {
        id: session.user.id,
        email: session.user.email!,
        firstName: session.user.user_metadata?.firstName || '',
        lastName: session.user.user_metadata?.lastName || '',
        role: (session.user.user_metadata?.role || 'USER') as 'USER' | 'ADMIN',
        subscriptionTier: session.user.user_metadata?.subscriptionTier || 'free',
        tokenBalance: session.user.user_metadata?.tokenBalance || 0
      };

      updateUser(updatedUser);
    } catch (error: any) {
      console.error("Failed to refresh user data:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      token,
      login,
      signup,
      logout,
      checkAuth,
      updateTokenBalance,
      updateUser,
      isAdmin,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
