// src/lib/authUtils.ts
import { User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-render-backend.onrender.com/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

class AuthUtils {
  private static TOKEN_KEY = 'smartpromptiq_token';
  private static REFRESH_TOKEN_KEY = 'smartpromptiq_refresh_token';
  private static USER_KEY = 'smartpromptiq_user';

  // Token management
  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  static setRefreshToken(refreshToken: string): void {
    try {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  static removeTokens(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error removing tokens:', error);
    }
  }

  // User data management
  static getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  static setStoredUser(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  // API request helper with auth headers
  static async makeAuthenticatedRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const token = this.getToken();
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
      
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          const newToken = this.getToken();
          if (newToken) {
            requestOptions.headers = {
              ...requestOptions.headers,
              Authorization: `Bearer ${newToken}`,
            };
            return fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
          }
        } else {
          // Refresh failed, user needs to log in again
          this.logout();
          throw new Error('Session expired. Please log in again.');
        }
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const authData: AuthResponse = await response.json();
      
      // Store auth data
      this.setToken(authData.token);
      if (authData.refreshToken) {
        this.setRefreshToken(authData.refreshToken);
      }
      this.setStoredUser(authData.user);

      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || 'Registration failed');
      }

      const authData: AuthResponse = await response.json();
      
      // Store auth data
      this.setToken(authData.token);
      if (authData.refreshToken) {
        this.setRefreshToken(authData.refreshToken);
      }
      this.setStoredUser(authData.user);

      return authData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const response = await this.makeAuthenticatedRequest('/auth/me');
      
      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      const user: User = await response.json();
      this.setStoredUser(user);
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  static async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.setToken(data.token);
      
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken);
      }

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        // Notify backend about logout (optional)
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(console.error); // Don't throw if logout endpoint fails
      }
    } finally {
      // Always clear local storage
      this.removeTokens();
    }
  }

  // Utility methods
  static isTokenValid(token: string): boolean {
    try {
      // Basic JWT validation - check if token has 3 parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && this.isTokenValid(token);
  }

  // Password validation
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Mock data for development (remove when backend is ready)
  static createMockUser(email: string): User {
    return {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      subscription: {
        plan: 'free',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Development mock login (remove when backend is ready)
  static async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.email === 'demo@smartpromptiq.com' && credentials.password === 'demo123') {
      const user = this.createMockUser(credentials.email);
      const token = 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9);
      
      this.setToken(token);
      this.setStoredUser(user);
      
      return { user, token };
    } else {
      throw new Error('Invalid credentials. Use demo@smartpromptiq.com / demo123');
    }
  }
}

export default AuthUtils;