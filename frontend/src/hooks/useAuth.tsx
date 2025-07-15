// hooks/useAuth.ts
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  level?: number;
  xp?: number;
  streak?: number;
  subscription?: 'free' | 'premium' | 'enterprise';
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: SignupData) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user data for development
const DEMO_USER: User = {
  id: 'demo-user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'demo@smartpromptiq.com',
  level: 8,
  xp: 2340,
  streak: 7,
  subscription: 'premium',
  preferences: {
    theme: 'light',
    notifications: true,
    language: 'en'
  }
};

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Check for stored auth token/session
      const storedUser = localStorage.getItem('smartpromptiq_user');
      const authToken = localStorage.getItem('smartpromptiq_token');
      
      if (storedUser && authToken) {
        // In production, validate token with backend
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // For demo purposes, automatically log in demo user
        // Remove this in production
        setUser(DEMO_USER);
        setIsAuthenticated(true);
        localStorage.setItem('smartpromptiq_user', JSON.stringify(DEMO_USER));
        localStorage.setItem('smartpromptiq_token', 'demo-token-123');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear invalid data
      localStorage.removeItem('smartpromptiq_user');
      localStorage.removeItem('smartpromptiq_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo login logic - accept any email/password
      // Replace with real API call in production
      if (email && password) {
        const userData = {
          ...DEMO_USER,
          email: email,
          firstName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store in localStorage (use secure httpOnly cookies in production)
        localStorage.setItem('smartpromptiq_user', JSON.stringify(userData));
        localStorage.setItem('smartpromptiq_token', `token-${Date.now()}`);
        
        // Track login analytics
        trackEvent('user_login', { email });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo signup logic
      // Replace with real API call in production
      const newUser: User = {
        id: `user-${Date.now()}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        level: 1,
        xp: 0,
        streak: 0,
        subscription: 'free',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('smartpromptiq_user', JSON.stringify(newUser));
      localStorage.setItem('smartpromptiq_token', `token-${Date.now()}`);
      
      // Track signup analytics
      trackEvent('user_signup', { email: userData.email });
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // Clear user state
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear storage
      localStorage.removeItem('smartpromptiq_user');
      localStorage.removeItem('smartpromptiq_token');
      
      // Clear other user-specific data
      localStorage.removeItem('favoriteCategories');
      localStorage.removeItem('categoryProgress');
      localStorage.removeItem('categoryAnalytics');
      
      // Track logout analytics
      trackEvent('user_logout');
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('smartpromptiq_user', JSON.stringify(updatedUser));
      
      // Track user update analytics
      trackEvent('user_profile_updated', { fields: Object.keys(userData) });
    }
  };

  const refreshAuth = async () => {
    try {
      setLoading(true);
      
      // In production, validate current token and refresh if needed
      const authToken = localStorage.getItem('smartpromptiq_token');
      
      if (authToken && user) {
        // Simulate token validation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Token is valid, update user data if needed
        // const updatedUser = await fetchUserData();
        // setUser(updatedUser);
      } else {
        // Invalid token, logout
        logout();
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Analytics helper function
  const trackEvent = (eventName: string, properties?: any) => {
    try {
      // Integrate with your analytics service (Google Analytics, Mixpanel, etc.)
      if (window.gtag) {
        window.gtag('event', eventName, properties);
      }
      
      // Store local analytics for demo
      const analytics = JSON.parse(localStorage.getItem('user_analytics') || '[]');
      analytics.push({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
        userId: user?.id
      });
      localStorage.setItem('user_analytics', JSON.stringify(analytics.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    signup,
    updateUser,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
}

// Type declaration for gtag (Google Analytics)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}