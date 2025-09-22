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

      // Check for auth token in localStorage
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        const storedUserData = JSON.parse(storedUser);
        debugUserData(storedUserData, 'checkAuth - STORED user data');

        try {
          // ✅ ENHANCED: Verify token with backend using authAPI.me
          console.log('🔍 checkAuth: Verifying token with backend...');
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

  // ✅ ENHANCED: Login using the new authAPI with comprehensive data validation
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting login:", { email });

      // Use enhanced authAPI.signin with built-in data validation
      const data = await authAPI.signin({ email, password });

      console.log('🔍 LOGIN RESPONSE (validated):', data);

      if (data.success && data.data) {
        const { user: userData, token: authToken } = data.data;

        debugUserData(userData, 'login - RAW userData from API');

        if (!authToken) {
          console.error('❌ Login failed: No authentication token received');
          throw new Error('No authentication token received');
        }

        if (!userData) {
          console.error('❌ Login failed: No user data received');
          throw new Error('No user data received');
        }

        console.log('🔍 Login debug - validated backend response:', {
          email,
          userData,
          userDataRole: userData.role,
          userDataRoles: userData.roles,
          userDataPermissions: userData.permissions,
          timestamp: new Date().toISOString()
        });

        debugUserData(userData, 'login - BEFORE updateUser call');

        // Store token and use updateUser for consistent data processing
        localStorage.setItem("token", authToken);
        setToken(authToken);
        setIsAuthenticated(true);

        // Use the centralized updateUser function for consistent validation
        updateUser(userData);

        debugUserData(userData, 'login - AFTER updateUser call');

        toast({
          title: "Welcome back!",
          description: `Signed in as ${userData.firstName || userData.email.split('@')[0]} ${userData.role === 'ADMIN' ? '(Admin)' : ''}`,
        });

        // Add a small delay to see final state before redirect
        setTimeout(() => {
          debugUserData(user, 'login - FINAL STATE before redirect');
          // Don't redirect if user is admin (let admin login handle redirect)
          if (userData.role !== 'ADMIN') {
            setLocation("/dashboard");
          }
        }, 100);
      } else {
        console.error('❌ Login failed: Invalid response format', data);
        throw new Error(data.message || 'Login failed - invalid response format');
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

  // ✅ ENHANCED: Signup function using authAPI with comprehensive data validation
  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting signup:", { email, firstName, lastName });

      // Use enhanced authAPI.signup with built-in data validation
      const data = await authAPI.signup({ email, password, firstName, lastName });

      console.log('🔍 SIGNUP RESPONSE (validated):', data);

      if (data.success && data.data) {
        const { user: userData, token: authToken } = data.data;

        debugUserData(userData, 'signup - RAW userData from API');

        if (!authToken) {
          console.error('❌ Signup failed: No authentication token received');
          throw new Error('No authentication token received');
        }

        if (!userData) {
          console.error('❌ Signup failed: No user data received');
          throw new Error('No user data received');
        }

        console.log('🔍 Signup debug - validated backend response:', {
          email,
          userData,
          userDataRole: userData.role,
          userDataRoles: userData.roles,
          userDataPermissions: userData.permissions,
          timestamp: new Date().toISOString()
        });

        debugUserData(userData, 'signup - BEFORE updateUser call');

        // Store token and use updateUser for consistent data processing
        localStorage.setItem("token", authToken);
        setToken(authToken);
        setIsAuthenticated(true);

        // Use the centralized updateUser function for consistent validation
        updateUser(userData);

        debugUserData(userData, 'signup - AFTER updateUser call');

        toast({
          title: "Welcome to SmartPromptIQ!",
          description: `Account created for ${userData.firstName || userData.email.split('@')[0]}! 🎉`,
        });

        // Add a small delay to see final state before redirect
        setTimeout(() => {
          debugUserData(user, 'signup - FINAL STATE before redirect');
          // Redirect to dashboard
          setLocation("/dashboard");
        }, 100);
      } else {
        console.error('❌ Signup failed: Invalid response format', data);
        throw new Error(data.message || 'Signup failed - invalid response format');
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
      const authToken = localStorage.getItem("token");
      if (!authToken) return;

      const data = await authAPI.me();

      if (data.success && data.data?.user) {
        const updatedUser = data.data.user;
        updateUser(updatedUser);
      }
    } catch (error: any) {
      console.error("Failed to refresh user data:", error);

      // If it's an invalid token error, clear auth data
      if (error.message && error.message.includes('Invalid token')) {
        console.log("🧹 Invalid token in refreshUserData, clearing auth data...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
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
