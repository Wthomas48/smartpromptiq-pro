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
  // ✅ SIMPLE AND RELIABLE ROUTING
  const currentUrl = typeof window !== 'undefined' ? window.location : null;

  console.log('🔍 API ROUTING DEBUG:', {
    hostname: currentUrl?.hostname,
    port: currentUrl?.port,
    protocol: currentUrl?.protocol,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  });

  // ✅ LOCALHOST DEVELOPMENT: Only when specifically on localhost dev ports
  if (currentUrl &&
      currentUrl.hostname === 'localhost' &&
      (currentUrl.port === '5173' || currentUrl.port === '5178' || currentUrl.port === '5179')) {
    const localApi = 'http://localhost:5000';
    console.log('🔧 LOCALHOST DEV: Using local backend:', localApi);
    return localApi;
  }

  // ✅ EVERYTHING ELSE: Use same origin (production, staging, any other domain)
  if (currentUrl && currentUrl.hostname !== 'localhost') {
    console.log('🌐 PRODUCTION/EXTERNAL: Using same origin for domain:', currentUrl.hostname);
    return ''; // Empty string = same origin
  }

  // ✅ SERVER-SIDE OR DEV FALLBACK
  if (import.meta.env.DEV) {
    const localApi = 'http://localhost:5000';
    console.log('🔧 DEV FALLBACK: Using local backend:', localApi);
    return localApi;
  }

  // ✅ FINAL FALLBACK: Always return empty string for production
  console.log('🌐 FINAL FALLBACK: Using same origin (empty string)');
  return '';

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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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

    // ✅ SMARTPROMPTIQ.COM: Handle your production domain specifically
    if (hostname.includes('smartpromptiq.com')) {
      console.log('✅ SmartPromptIQ production domain detected:', hostname);
      return ''; // Use same origin for production (backend serves frontend)
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

    // DISABLED: Remove mock fallback behavior to use real backend only
    if (false) {
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
        console.error('❌ Supabase signup error, falling back to backend:', error);
        // Fallback to backend registration
        return authAPI.register(userData.email, userData.password, userData.firstName, userData.lastName);
      }

      console.log('✅ Supabase signup success:', data);

      // Check if we have a valid session token
      if (!data.session?.access_token) {
        console.log('⚠️ No session token from Supabase (email verification required), falling back to backend');
        // Fallback to backend registration for immediate access
        return authAPI.register(userData.email, userData.password, userData.firstName, userData.lastName);
      }

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
          token: data.session.access_token
        }
      };

    } catch (error) {
      console.error('❌ Signup API error, falling back to backend:', error);
      // Final fallback to backend registration
      return authAPI.register(userData.email, userData.password, userData.firstName, userData.lastName);
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
        console.log('ℹ️ Supabase getCurrentUser error (normal for unauthenticated users):', error);
        throw new Error('Auth session missing!');
      }

      if (!user) {
        console.log('ℹ️ No authenticated user (normal for landing page)');
        throw new Error('Auth session missing!');
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
      console.log('ℹ️ Me API completed without authentication (normal for landing page):', error);
      throw error;
    }
  }
};

export default { getApiBaseUrl, apiRequest };