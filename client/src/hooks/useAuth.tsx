import React, { useState, useEffect, createContext, useContext } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, authAPI } from "@/config/api";
import { ensureSafeUser, isValidUser } from "@/utils/safeDataUtils";

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

  // ✅ NEW: Comprehensive debugging function for user data validation
  const debugUserData = (user: any, location: string) => {
    console.log(`🔍 User data at ${location}:`, {
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
  };

  // Environment check on component mount
  console.log('🔍 AUTH ENV CHECK:', {
    isClient: typeof window !== 'undefined',
    hasLocalStorage: typeof localStorage !== 'undefined',
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
  });

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      console.log("Checking auth...");

      // ✅ SUPABASE: First check Supabase session
      try {
        console.log('🔍 checkAuth: Checking Supabase session...');
        const { supabase } = await import('@/lib/supabase');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!error && session?.user) {
          console.log('✅ Supabase session found:', session.user);

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

          console.log("✅ Authenticated with Supabase session");
          setIsLoading(false);
          return;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase session check failed:', supabaseError);
      }

      // Check for auth token in localStorage (fallback for legacy/backend auth)
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        const storedUserData = JSON.parse(storedUser);
        debugUserData(storedUserData, 'checkAuth - STORED user data');

        try {
          // ✅ ENHANCED: Verify token with backend using authAPI.me
          console.log('🔍 checkAuth: Verifying token with backend...');
          const data = await authAPI.me();

          if (data.success && (data.data?.user || data.user)) {
            const backendUserData = data.data?.user || data.user;
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

            console.log("✅ User authenticated with merged data:", mergedUserData);
            debugUserData(mergedUserData, 'checkAuth - AFTER updateUser (merged)');
            return;
          }
        } catch (backendError: any) {
          console.log("⚠️ Backend auth check failed:", backendError);

          // Check if it's an invalid token error
          if (backendError.message && backendError.message.includes('Invalid token')) {
            console.log("🧹 Invalid token detected, clearing auth data...");
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

        console.log("✅ User authenticated from storage:", storedUserData);
        debugUserData(storedUserData, 'checkAuth - AFTER updateUser (stored)');
      } else {
        console.log("No token found");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
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
        console.log("🧹 Inconsistent auth data detected, clearing...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        return;
      }

      // If we have both but the token looks invalid (too short, malformed, etc.)
      if (storedToken && storedToken.length < 20) {
        console.log("🧹 Invalid token format detected, clearing...");
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

  // ✅ HYBRID: Login using Supabase with backend fallback
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting hybrid login:", { email });

      // First try Supabase authentication
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!error && data.user && data.session) {
          console.log('✅ SUPABASE LOGIN SUCCESS:', data);

          const userData = {
            id: data.user.id,
            email: data.user.email!,
            firstName: data.user.user_metadata?.firstName || '',
            lastName: data.user.user_metadata?.lastName || '',
            role: (data.user.user_metadata?.role || 'USER') as 'USER' | 'ADMIN',
            subscriptionTier: data.user.user_metadata?.subscriptionTier || 'free',
            tokenBalance: data.user.user_metadata?.tokenBalance || 0
          };

          const authToken = data.session.access_token;
          localStorage.setItem("token", authToken);
          localStorage.setItem("user", JSON.stringify(userData));

          setToken(authToken);
          setIsAuthenticated(true);
          updateUser(userData);

          toast({
            title: "Welcome back!",
            description: `Signed in as ${userData.firstName || userData.email.split('@')[0]}`,
          });

          setTimeout(() => {
            if (userData.role === 'ADMIN') {
              setLocation("/admin");
            } else {
              setLocation("/dashboard");
            }
          }, 100);
          return;
        }
      } catch (supabaseError: any) {
        console.warn("⚠️ Supabase login failed, falling back to backend:", supabaseError.message);
      }

      // Fallback to backend authentication
      console.log("🔄 Falling back to backend authentication");
      const response = await authAPI.login(email, password);

      console.log("🔍 Backend login response:", response);

      if (response.success) {
        // Handle different response formats
        let token, user;

        if (response.data && typeof response.data === 'object' && response.data.token && response.data.user) {
          // Format: {success: true, data: {token, user}}
          console.log("🔍 Using data.token/data.user format");
          token = response.data.token;
          user = response.data.user;
        } else if (response.token && response.user) {
          // Format: {success: true, token, user}
          console.log("🔍 Using token/user format");
          token = response.token;
          user = response.user;
        } else {
          console.error("❌ Invalid response format:", {
            hasData: !!response.data,
            hasToken: !!response.token,
            hasUser: !!response.user,
            dataHasToken: response.data?.token,
            dataHasUser: response.data?.user,
            fullResponse: response
          });
          throw new Error(`Login failed - invalid response format: ${JSON.stringify(response)}`);
        }

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

  // ✅ HYBRID: Signup using Supabase with backend fallback
  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting hybrid signup:", { email, firstName, lastName });

      // First try Supabase authentication
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstName: firstName || '',
              lastName: lastName || ''
            }
          }
        });

        if (!error && data.user) {
          console.log('✅ SUPABASE SIGNUP SUCCESS:', data);

          if (data.session) {
            // User signed up and was immediately logged in
            const userData = {
              id: data.user.id,
              email: data.user.email!,
              firstName: firstName || '',
              lastName: lastName || '',
              role: (data.user.user_metadata?.role || 'USER') as 'USER' | 'ADMIN',
              subscriptionTier: data.user.user_metadata?.subscriptionTier || 'free',
              tokenBalance: data.user.user_metadata?.tokenBalance || 0
            };

            const authToken = data.session.access_token;
            localStorage.setItem("token", authToken);
            localStorage.setItem("user", JSON.stringify(userData));

            setToken(authToken);
            setIsAuthenticated(true);
            updateUser(userData);

            toast({
              title: "Welcome to SmartPromptIQ!",
              description: `Account created for ${firstName || email.split('@')[0]}! 🎉`,
            });

            setTimeout(() => {
              setLocation("/dashboard");
            }, 100);
            return;
          } else {
            // User needs to verify email first
            toast({
              title: "Check your email",
              description: "Please check your email and click the confirmation link to activate your account.",
            });
            return;
          }
        }
      } catch (supabaseError: any) {
        console.warn("⚠️ Supabase signup failed, falling back to backend:", supabaseError.message);
      }

      // Fallback to backend authentication
      console.log("🔄 Falling back to backend registration");
      const response = await authAPI.register(email, password, firstName, lastName);

      console.log("🔍 Backend register response:", response);

      if (response.success) {
        // Handle different response formats
        let token, user;

        if (response.data && typeof response.data === 'object' && response.data.token && response.data.user) {
          // Format: {success: true, data: {token, user}}
          console.log("🔍 Using data.token/data.user format");
          token = response.data.token;
          user = response.data.user;
        } else if (response.token && response.user) {
          // Format: {success: true, token, user} or {success: true, token, user, data: null}
          console.log("🔍 Using token/user format");
          token = response.token;
          user = response.user;
        } else {
          console.error("❌ Invalid response format:", {
            hasData: !!response.data,
            hasToken: !!response.token,
            hasUser: !!response.user,
            dataHasToken: response.data?.token,
            dataHasUser: response.data?.user,
            fullResponse: response
          });
          throw new Error(`Signup failed - invalid response format`);
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setToken(token);
        setIsAuthenticated(true);
        updateUser(user);

        toast({
          title: "Welcome to SmartPromptIQ!",
          description: `Account created for ${firstName || email.split('@')[0]}! 🎉`,
        });

        setTimeout(() => {
          setLocation("/dashboard");
        }, 100);
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
    debugUserData(userData, 'updateUser - BEFORE processing');

    if (!userData) {
      console.warn('⚠️ updateUser called with null/undefined userData');
      debugUserData(userData, 'updateUser - NULL/UNDEFINED userData');
      return;
    }

    // ✅ USE SAFE UTILITY: Ensure safe data structure with comprehensive validation
    const safeUser = ensureSafeUser(userData);

    if (!safeUser) {
      console.error('❌ updateUser: ensureSafeUser returned null');
      return;
    }

    // ✅ VALIDATE: Ensure the user object is valid
    if (!isValidUser(safeUser)) {
      console.error('❌ updateUser: Invalid user object after safety processing:', safeUser);
      return;
    }

    debugUserData(safeUser, 'updateUser - AFTER processing (safeUser)');

    console.log('🔍 Setting safe user data:', safeUser);
    setUser(safeUser);
    localStorage.setItem("user", JSON.stringify(safeUser));

    // Debug the state immediately after setting
    setTimeout(() => {
      debugUserData(safeUser, 'updateUser - AFTER setState (immediate)');
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
      return user.role === 'admin' || user.role === 'ADMIN' || user.role?.name === 'admin';
    }

    // Safe multiple roles check
    const roles = user.roles || [];
    return roles.some(role => {
      if (typeof role === 'string') return role === 'admin' || role === 'ADMIN';
      if (role && typeof role === 'object') return role.name === 'admin' || role.name === 'ADMIN';
      return false;
    });
  };

  const refreshUserData = async () => {
    try {
      // Check current Supabase session
      const { supabase } = await import('@/lib/supabase');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        console.log("🧹 No valid Supabase session, clearing auth data...");
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
