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
  // ✅ Fixed: Proper state initialization with safe defaults
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
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

  // ✅ NEW: Comprehensive debugging function for user data validation (dev only)
  const debugUserData = (user: any, location: string) => {
    if (import.meta.env.DEV) {
      // Debug user data in development mode
      if (import.meta.env.DEV) {
        console.log(`User data at ${location}:`, {
          user,
          hasUser: !!user,
          userType: typeof user,
          hasRole: !!user?.role,
          roleValue: user?.role,
          roleType: typeof user?.role,
          hasRoles: !!user?.roles,
          rolesValue: user?.roles,
          rolesType: typeof user?.roles,
          rolesIsArray: Array.isArray(user?.roles),
          rolesLength: Array.isArray(user?.roles) ? user.roles.length : 'N/A',
          hasPermissions: !!user?.permissions,
          permissionsValue: user?.permissions,
          permissionsType: typeof user?.permissions,
          permissionsIsArray: Array.isArray(user?.permissions),
          permissionsLength: Array.isArray(user?.permissions) ? user.permissions.length : 'N/A',
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName
        });
      }
    }
  };

  // Environment check on component mount (dev only)
  if (import.meta.env.DEV) {
    console.log('AUTH ENV CHECK:', {
      isClient: typeof window !== 'undefined',
      hasLocalStorage: typeof localStorage !== 'undefined',
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
    });
  }

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      if (import.meta.env.DEV) {
        console.log("Checking auth...");
      }

      // ✅ SUPABASE: First check Supabase session
      try {
        if (import.meta.env.DEV) {
          console.log('checkAuth: Checking Supabase session...');
        }
        const { supabase } = await import('@/lib/supabase');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!error && session?.user) {
          if (import.meta.env.DEV) {
            console.log('Supabase session found:', session.user);
          }

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

          // Store in localStorage for consistency
          localStorage.setItem("token", session.access_token);
          localStorage.setItem("user", JSON.stringify(supabaseUser));

          if (import.meta.env.DEV) {
            console.log("Authenticated with Supabase session");
          }
          setIsLoading(false);
          return;
        }
      } catch (supabaseError) {
        // Only log in development - this is normal for unauthenticated users
        if (import.meta.env.DEV) {
          console.log('Supabase session check failed (this is normal for unauthenticated users):', supabaseError);
        }
      }

      // Check for auth token in localStorage (fallback for legacy/backend auth)
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        const storedUserData = JSON.parse(storedUser);
        debugUserData(storedUserData, 'checkAuth - STORED user data');

        try {
          // ✅ ENHANCED: Verify token with backend using authAPI.me
          if (import.meta.env.DEV) {
            console.log('checkAuth: Verifying token with backend...');
          }
          const data = await authAPI.me();

          if (data.success && data.data?.user) {
            const backendUserData = data.data.user;
            debugUserData(backendUserData, 'checkAuth - BACKEND user data');

            // Merge stored user data with backend data, prioritizing stored data for names
            const mergedUserData = {
              ...backendUserData,
              // Prioritize stored firstName/lastName if they exist and backend doesn't have them
              firstName: storedUserData.firstName || backendUserData.firstName,
              lastName: storedUserData.lastName || backendUserData.lastName,
            };

            debugUserData(mergedUserData, 'checkAuth - MERGED user data');

            setToken(storedToken);
            setIsAuthenticated(true);

            // Use centralized updateUser for consistent data processing
            updateUser(mergedUserData);

            if (import.meta.env.DEV) {
              console.log("User authenticated with merged data:", mergedUserData);
              debugUserData(mergedUserData, 'checkAuth - AFTER updateUser (merged)');
            }
            return;
          }
        } catch (backendError: any) {
          // Only log in development - this is normal for unauthenticated users
          if (import.meta.env.DEV) {
            console.log("Backend auth check failed (this is normal for unauthenticated users):", backendError);
          }

          // Check if it's an invalid token error
          if (backendError.message && backendError.message.includes('Invalid token')) {
            if (import.meta.env.DEV) {
              console.log("Invalid token detected, clearing auth data...");
            }
            // Clear invalid token and user data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            setIsLoading(false);
            return;
          }

          debugUserData(storedUserData, 'checkAuth - BACKEND ERROR, using stored');
        }

        // ✅ ENHANCED: Fallback to stored data if backend is unavailable
        debugUserData(storedUserData, 'checkAuth - FALLBACK to stored data');
        setToken(storedToken);
        setIsAuthenticated(true);

        // Use centralized updateUser for consistent data processing
        updateUser(storedUserData);

        if (import.meta.env.DEV) {
          console.log("User authenticated from storage:", storedUserData);
          debugUserData(storedUserData, 'checkAuth - AFTER updateUser (stored)');
        }
      } else {
        // Only log in development - this is normal for unauthenticated users on landing page
        if (import.meta.env.DEV) {
          console.log("No token found - user is not authenticated (this is normal for landing page)");
        }
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      // Only log in development - this is normal for unauthenticated users on landing page
      if (import.meta.env.DEV) {
        console.log("Auth check completed with no authentication (this is normal for landing page):", error);
      }
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
        if (import.meta.env.DEV) {
          console.log("Inconsistent auth data detected, clearing...");
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        return;
      }

      // If we have both but the token looks invalid (too short, malformed, etc.)
      if (storedToken && storedToken.length < 20) {
        if (import.meta.env.DEV) {
          console.log("Invalid token format detected, clearing...");
        }
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

  // ✅ BACKEND ONLY: Login using backend authentication only
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting backend login:", { email });

      // Use backend authentication only (Supabase disabled for now)
      console.log("Using backend authentication");
      const response = await authAPI.login(email, password);

      console.log("Backend login response:", response);

      if (response.success) {
        // ✅ ULTRA-ROBUST: Use normalization function
        try {
          const { token, user } = normalizeAuthResponse(response);
          console.log('Login response normalized successfully');

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
      console.log("Attempting backend signup:", { email, firstName, lastName });

      // Use backend authentication only (Supabase disabled for now)
      console.log("Using backend registration");
      const response = await authAPI.register(email, password, firstName, lastName);

      console.log("Backend register response:", response);

      if (response.success) {
        // ✅ ULTRA-ROBUST: Use normalization function
        try {
          const { token, user } = normalizeAuthResponse(response);
          console.log('Signup response normalized successfully');

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

  // ✅ ENHANCED: Centralized user data update using safe utilities
  const updateUser = (userData: any) => {
    console.log('🔍 === UPDATE USER DEBUG START ===');
    console.log('🔍 Received user data:', userData);
    console.log('🔍 User data type:', typeof userData);
    console.log('🔍 User data keys:', userData ? Object.keys(userData) : 'N/A');
    console.log('🔍 User data JSON:', JSON.stringify(userData, null, 2));

    debugUserData(userData, 'updateUser - BEFORE processing');

    if (!userData) {
      console.warn('⚠️ updateUser called with null/undefined userData');
      debugUserData(userData, 'updateUser - NULL/UNDEFINED userData');
      return;
    }

    // ✅ USE SAFE UTILITY: Ensure safe data structure with comprehensive validation
    const safeUser = ensureSafeUser(userData);

    console.log('🔍 SafeUser result:', safeUser);
    console.log('🔍 SafeUser type:', typeof safeUser);
    console.log('🔍 SafeUser keys:', safeUser ? Object.keys(safeUser) : 'N/A');

    if (!safeUser) {
      console.error('❌ updateUser: ensureSafeUser returned null');
      console.log('🔍 ensureSafeUser returned null - stopping here');
      return;
    }

    // ✅ VALIDATE: Ensure the user object is valid
    console.log('🔍 Checking isValidUser...');
    console.log('🔍 safeUser.id:', safeUser.id, '(type:', typeof safeUser.id, ')');
    console.log('🔍 safeUser.email:', safeUser.email, '(type:', typeof safeUser.email, ')');
    console.log('🔍 safeUser.role:', safeUser.role, '(type:', typeof safeUser.role, ')');
    console.log('🔍 safeUser.roles:', safeUser.roles, '(isArray:', Array.isArray(safeUser.roles), ')');
    console.log('🔍 safeUser.permissions:', safeUser.permissions, '(isArray:', Array.isArray(safeUser.permissions), ')');

    const validationResult = isValidUser(safeUser);
    console.log('🔍 isValidUser result:', validationResult);

    if (!validationResult) {
      console.error('❌ updateUser: Invalid user object after safety processing:', safeUser);
      console.log('🔍 Validation failed - stopping here');
      return;
    }

    debugUserData(safeUser, 'updateUser - AFTER processing (safeUser)');

    console.log('🔍 Setting safe user data:', safeUser);
    setUser(safeUser);
    localStorage.setItem("user", JSON.stringify(safeUser));

    console.log('🔍 === UPDATE USER SUCCESS ===');
    console.log('🔍 User state updated successfully');

    // Debug the state immediately after setting
    setTimeout(() => {
      debugUserData(safeUser, 'updateUser - AFTER setState (immediate)');
      console.log('🔍 === UPDATE USER DEBUG END ===');
    }, 0);
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
      const { supabase } = await import('@/lib/supabase');
      const { data: { session }, error } = await supabase.auth.getSession();

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
