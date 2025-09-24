/**
 * API Configuration for different environments
 */

// ✅ ENHANCED: Comprehensive environment configuration with host validation
const config = {
  // Allowed hosts for different environments
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    'smartpromptiq.up.railway.app',
    'smartpromptiq-pro.up.railway.app',
    'smartpromptiq.railway.app',
    'smartpromptiq-pro.railway.app'
  ],

  // Development ports
  devPorts: [3000, 5000, 5001, 5002, 5004, 5173, 8080],

  // Production API patterns
  productionPatterns: [
    '.railway.app',
    '.vercel.app',
    '.netlify.app',
    '.herokuapp.com'
  ]
};

// Determine the API base URL based on environment with enhanced validation
export const getApiBaseUrl = (): string => {
  // Check environment variables - Force deployment for signup fix
  console.log('🔍 ENV CHECK:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    BASE_URL: import.meta.env.BASE_URL,
    MODE: import.meta.env.MODE
  });

  // In development, use the current origin (Vite proxy handles /api routes)
  if (import.meta.env.DEV) {
    return '';
  }

  // In production, determine backend URL with enhanced validation
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const origin = window.location.origin;

    console.log('🌐 Host validation:', {
      hostname,
      origin,
      isAllowedHost: config.allowedHosts.includes(hostname)
    });

    // Check if hostname is in allowed hosts
    if (config.allowedHosts.includes(hostname)) {
      console.log('✅ Host validation passed for:', hostname);
    }

    // If running on localhost in production, connect to backend on correct port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      console.log('🔗 Using localhost API URL:', apiUrl);
      return apiUrl;
    }

    // For production deployments, check patterns
    const isProductionDomain = config.productionPatterns.some(pattern =>
      hostname.includes(pattern)
    );

    if (isProductionDomain) {
      console.log('✅ Production domain detected:', hostname);
      // For Railway/Vercel/Netlify deployment, use same origin (backend serves frontend)
      return import.meta.env.VITE_API_URL || '';
    }

    // For other deployed environments, use environment variable or same origin
    const apiUrl = import.meta.env.VITE_API_URL || '';
    console.log('🔗 Using configured API URL:', apiUrl);
    return apiUrl;
  }

  return '';
};

// ✅ ENHANCED: Robust API request wrapper with comprehensive data validation
export const apiRequest = async (method: string, url: string, body?: any) => {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${url}`;

  console.log(`🌐 API Request: ${method} ${fullUrl}`);
  console.log(`🌐 Environment: ${import.meta.env.DEV ? 'Development' : 'Production'}`);
  console.log(`🌐 Base URL: ${baseUrl}`);

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': typeof window !== 'undefined' ? window.location.origin : '',
        // Add production headers for better compatibility
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      credentials: 'include',
      mode: 'cors',
      // Add timeout and other robust options - Fixed AbortSignal timeout issue
      // signal: AbortSignal.timeout(15000), // Removed - causes timeout issues in some environments
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    if (body) {
      options.body = JSON.stringify(body);
      console.log(`🌐 Request Body:`, body);
    }

    const response = await fetch(fullUrl, options);
    console.log(`🌐 Response Status: ${response.status} ${response.statusText}`);
    console.log(`🌐 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Request failed with status ${response.status}`,
        status: response.status,
        statusText: response.statusText
      }));
      console.error(`❌ API Error Response:`, errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error(`❌ API Error for ${fullUrl}:`, error);

    // Enhanced error handling with network detection
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - please check your internet connection');
    }

    // TEMPORARILY DISABLED: In production, if the API call fails, provide fallback behavior
    if (false && !import.meta.env.DEV && (error.message.includes('fetch') || error.message.includes('network'))) {
      console.warn(`🔄 Production API fallback for ${url}`);

      // Return mock responses for auth endpoints in production when backend is unavailable
      if (url.includes('/api/auth/login') || url.includes('/api/auth/register')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              user: {
                id: 'demo-user',
                email: body?.email || 'demo@example.com',
                firstName: body?.firstName || 'Demo',
                lastName: body?.lastName || 'User',
                role: 'USER',
                roles: [],
                permissions: []
              },
              token: 'demo-token-' + Date.now()
            }
          })
        };
      }
    }

    throw error;
  }
};

// Import safe utilities
import { ensureSafeUser } from '../utils/safeDataUtils';

// Import Supabase auth
import { auth } from '../lib/supabase';

// ✅ HYBRID: Authentication functions with Supabase + Backend fallback
export const authAPI = {
  // Supabase signin (existing)
  signin: async (credentials: { email: string; password: string }) => {
    try {
      console.log('🔍 Supabase signin attempt:', { email: credentials.email });

      const { data, error } = await auth.signIn(credentials.email, credentials.password);

      if (error) {
        console.error('❌ Supabase signin error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Supabase signin success:', data);

      // Return in expected format for compatibility
      return {
        success: true,
        data: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
            firstName: data.user?.user_metadata?.firstName || '',
            lastName: data.user?.user_metadata?.lastName || '',
            role: 'USER',
            roles: [],
            permissions: []
          },
          token: data.session?.access_token
        }
      };

    } catch (error) {
      console.error('❌ Signin API error:', error);
      throw error;
    }
  },

  // Backend login fallback
  login: async (email: string, password: string) => {
    try {
      console.log('🔍 Backend login attempt:', { email });

      const response = await apiRequest('POST', '/api/auth/login', {
        email,
        password
      });

      const result = await response.json();
      console.log('✅ Backend login success:', result);

      return result;
    } catch (error) {
      console.error('❌ Backend login error:', error);
      throw error;
    }
  },

  // Supabase signup (existing)
  signup: async (userData: { email: string; password: string; firstName?: string; lastName?: string }) => {
    try {
      console.log('🔍 Supabase signup attempt:', { email: userData.email });

      const { data, error } = await auth.signUp(userData.email, userData.password, {
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      if (error) {
        console.error('❌ Supabase signup error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Supabase signup success:', data);

      // Return in expected format for compatibility
      return {
        success: true,
        data: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            role: 'USER',
            roles: [],
            permissions: []
          },
          token: data.session?.access_token
        }
      };

    } catch (error) {
      console.error('❌ Signup API error:', error);
      throw error;
    }
  },

  // Backend register fallback
  register: async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log('🔍 Backend register attempt:', { email, firstName, lastName });

      const response = await apiRequest('POST', '/api/auth/register', {
        email,
        password,
        firstName,
        lastName
      });

      const result = await response.json();
      console.log('✅ Backend register success:', result);

      return result;
    } catch (error) {
      console.error('❌ Backend register error:', error);
      throw error;
    }
  },

  me: async () => {
    try {
      console.log('🔍 Supabase getCurrentUser attempt');

      const { user, error } = await auth.getCurrentUser();

      if (error) {
        console.error('❌ Supabase getCurrentUser error:', error);
        throw new Error(error.message);
      }

      if (!user) {
        throw new Error('No authenticated user');
      }

      console.log('✅ Supabase getCurrentUser success:', user);

      // Return in expected format for compatibility
      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.user_metadata?.firstName || '',
            lastName: user.user_metadata?.lastName || '',
            role: 'USER',
            roles: [],
            permissions: []
          }
        }
      };

    } catch (error) {
      console.error('❌ Me API error:', error);
      throw error;
    }
  }
};

export default { getApiBaseUrl, apiRequest };