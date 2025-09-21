import React, { useState, useEffect, createContext, useContext } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/config/api";

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
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateTokenBalance: (newBalance: number) => void;
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
        try {
          // Verify token with backend
          const response = await apiRequest('GET', '/api/auth/me');
          response.headers = {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          };

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.user) {
              // Merge stored user data with backend data, prioritizing stored data for names
              const storedUserData = JSON.parse(storedUser);
              const backendUserData = data.data.user;

              const userData = {
                ...backendUserData,
                // Prioritize stored firstName/lastName if they exist and backend doesn't have them
                firstName: storedUserData.firstName || backendUserData.firstName,
                lastName: storedUserData.lastName || backendUserData.lastName,
              };

              setUser(userData);
              setToken(storedToken);
              setIsAuthenticated(true);
              localStorage.setItem("user", JSON.stringify(userData));
              console.log("User authenticated with merged data:", userData);
              return;
            }
          }
        } catch (backendError) {
          console.log("Backend auth check failed, using stored data:", backendError);
        }

        // Fallback to stored data if backend is unavailable
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
        console.log("User authenticated from storage:", userData);
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

  // Check for auth token on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting login:", { email });

      // Call backend API
      const response = await apiRequest('POST', '/api/auth/login', {
        email, password
      });

      console.log('🔍 LOGIN RESPONSE STATUS:', response.status);
      console.log('🔍 LOGIN RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.log('🔍 LOGIN ERROR DATA:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('🔍 LOGIN RESPONSE:', data);
      console.log('🔍 LOGIN RESPONSE STRUCTURE:', Object.keys(data));

      // Check for arrays that might cause map errors
      if (data.permissions) {
        console.log('🔍 PERMISSIONS:', data.permissions, 'Is Array:', Array.isArray(data.permissions));
      }
      if (data.roles) {
        console.log('🔍 ROLES:', data.roles, 'Is Array:', Array.isArray(data.roles));
      }
      if (data.data && data.data.user) {
        console.log('🔍 USER DATA:', data.data.user, 'Type:', typeof data.data.user);
      }

      if (data.success && data.data) {
        const { user: userData, token: authToken } = data.data || {};

        console.log('Login debug - raw backend response:', {
          email,
          userData,
          userDataRole: userData?.role
        });

        // ✅ Fixed: Handle potentially undefined user data structure
        const enhancedUser = {
          id: userData?.id || 'demo-user',
          email: userData?.email || email,
          firstName: userData?.firstName || 'User',
          lastName: userData?.lastName || '',
          role: userData?.role || 'USER',
          // Safely handle any array properties that might be undefined
          permissions: userData?.permissions || [],
          roles: userData?.roles || [],
          ...userData
        };

        console.log('Enhanced user:', enhancedUser);

        // Store token and user data
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(enhancedUser));

        setToken(authToken);
        setUser(enhancedUser);
        setIsAuthenticated(true);

        toast({
          title: "Welcome back!",
          description: `Signed in as ${enhancedUser.firstName || enhancedUser.email.split('@')[0]} ${enhancedUser.role === 'ADMIN' ? '(Admin)' : ''}`,
        });

        // Redirect to dashboard
        setLocation("/dashboard");
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error("Login failed:", error);
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

  const updateTokenBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, tokenBalance: newBalance };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const isAdmin = () => {
    const result = user?.role === 'ADMIN';

    console.log('isAdmin check:', {
      user,
      role: user?.role,
      email: user?.email,
      result
    });

    return result;
  };

  const refreshUserData = async () => {
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) return;

      const response = await apiRequest('GET', '/api/auth/me');
      response.headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      };

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          const updatedUser = data.data.user;
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
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
      logout,
      checkAuth,
      updateTokenBalance,
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
