/**
 * API Configuration for different environments
 */

// ✅ FIX: All imports MUST be at the top to prevent TDZ errors in production
import { ensureSafeUser } from '../utils/safeDataUtils';
import { auth } from '../lib/supabase';

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
  // ✅ CHECK: Only use DEV mode, not VITE_API_URL (which can be empty string)
  const isDev = import.meta.env.DEV;

  // In development mode, check for explicit API URL or default to localhost
  if (isDev) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const localApi = apiUrl && apiUrl.trim() !== '' ? apiUrl : 'http://localhost:5000';
    console.log('🔧 DEV MODE: Using API:', localApi);
    return localApi;
  }

  // ✅ PRODUCTION MODE: Use same-origin or explicit production URL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Force localhost in browser (for testing production builds locally)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const localApi = 'http://localhost:5000';
      console.log('🔧 LOCAL TESTING: Using local server:', localApi);
      return localApi;
    }

    // Production domains - use same origin (empty string)
    if (hostname.includes('smartpromptiq.com') ||
        hostname.includes('railway.app') ||
        hostname.includes('vercel.app') ||
        hostname.includes('netlify.app')) {
      console.log('🚀 PRODUCTION: Using same-origin API');
      return ''; // Empty string = same origin
    }
  }

  // ✅ FINAL FALLBACK: Same origin for production
  console.log('🚀 FALLBACK: Using same-origin API');
  return '';

  // In production, determine backend URL with enhanced validation
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const origin = window.location.origin;


    // Check if hostname is in allowed hosts
    if (config.allowedHosts.includes(hostname)) {
    }

    // If running on localhost in production, connect to backend on correct port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return apiUrl;
    }

    // For production deployments, check patterns
    const isProductionDomain = config.productionPatterns.some(pattern =>
      hostname.includes(pattern)
    );

    if (isProductionDomain) {
      // For Railway/Vercel/Netlify deployment, use same origin (backend serves frontend)
      return import.meta.env.VITE_API_URL || '';
    }

    // ✅ SMARTPROMPTIQ.COM: Handle your production domain specifically
    if (hostname.includes('smartpromptiq.com')) {
      return ''; // Use same origin for production (backend serves frontend)
    }

    // For other deployed environments, use environment variable or same origin
    const apiUrl = import.meta.env.VITE_API_URL || '';
    return apiUrl;
  }

  return '';
};

// ✅ ENHANCED: Robust API request wrapper with comprehensive data validation
export const apiRequest = async (method: string, url: string, body?: any) => {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${url}`;


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

    // Add simplified browser headers for Railway compatibility
    if (typeof window !== 'undefined') {
      // Use simple, reliable browser identification instead of complex fingerprinting
      const browserInfo = {
        'User-Agent': navigator.userAgent,
        'Accept-Language': navigator.language,
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Type': 'browser',
        'X-Timestamp': Date.now().toString()
      };

      options.headers = {
        ...options.headers,
        ...browserInfo
      };

      console.log('🔐 Using simplified browser headers for Railway compatibility');
    }

    if (body) {
      options.body = JSON.stringify(body);
      if (import.meta.env.DEV) {
      }
    }

    // 📤 PRODUCTION DEBUG: Log final request details
    console.log('📤 Final API Request Details:', {
      url: fullUrl,
      method: options.method,
      hasAuthToken: options.headers?.['Authorization'] ? 'YES' : 'NO',
      hasDeviceFingerprint: options.headers?.['X-Device-Fingerprint'] ? 'YES' : 'NO',
      contentType: options.headers?.['Content-Type'],
      origin: options.headers?.['Origin'],
      allHeaders: Object.keys(options.headers || {})
    });

    const response = await fetch(fullUrl, options);
    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });
    if (import.meta.env.DEV) {
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Request failed with status ${response.status}`,
        status: response.status,
        statusText: response.statusText
      }));

      if (import.meta.env.DEV) {
        console.error(`❌ API Error Response:`, errorData);
      }

      // Create enhanced error object for 429 responses
      if (response.status === 429) {
        const enhancedError = new Error(JSON.stringify(errorData));
        enhancedError.status = response.status;
        enhancedError.retryAfter = errorData.retryAfter;
        enhancedError.remaining = errorData.remaining;
        throw enhancedError;
      }

      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    return response;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`❌ API Error for ${fullUrl}:`, error);
    }

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

// ✅ HYBRID: Authentication functions with Supabase + Backend fallback
// NOTE: imports moved to top of file to prevent TDZ errors
export const authAPI = {
  // Supabase signin (existing)
  signin: async (credentials: { email: string; password: string }) => {
    try {
      if (import.meta.env.DEV) {
      }

      const { data, error } = await auth.signIn(credentials.email, credentials.password);

      if (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Supabase signin error:', error);
        }
        throw new Error(error.message);
      }

      if (import.meta.env.DEV) {
      }

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
      if (import.meta.env.DEV) {
        console.error('❌ Signin API error:', error);
      }
      throw error;
    }
  },

  // Backend login fallback
  login: async (email: string, password: string, options?: { isAdminLogin?: boolean }) => {
    try {
      if (import.meta.env.DEV) {
        console.log('🔐 Backend login request:', { email, isAdminLogin: options?.isAdminLogin });
      }

      const response = await apiRequest('POST', '/api/auth/login', {
        email,
        password,
        isAdminLogin: options?.isAdminLogin || false
      });

      const result = await response.json();
      if (import.meta.env.DEV) {
        console.log('🔐 Backend login response:', result);
      }

      return result;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Backend login error:', error);
      }
      throw error;
    }
  },

  // Supabase signup (existing)
  signup: async (userData: { email: string; password: string; firstName?: string; lastName?: string; deviceFingerprint?: string }) => {
    try {
      console.log('🚀 STARTING SIGNUP PROCESS:', { email: userData.email, firstName: userData.firstName });

      if (import.meta.env.DEV) {
      }

      const { data, error } = await auth.signUp(userData.email, userData.password, {
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Supabase signup error, falling back to backend:', error);
        }
        // Fallback to backend registration
        return authAPI.register(userData.email, userData.password, userData.firstName, userData.lastName, userData.deviceFingerprint);
      }

      if (import.meta.env.DEV) {
      }

      // Check if we have a valid session token
      if (!data.session?.access_token) {
        if (import.meta.env.DEV) {
        }
        // Fallback to backend registration for immediate access
        return authAPI.register(userData.email, userData.password, userData.firstName, userData.lastName, userData.deviceFingerprint);
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
      if (import.meta.env.DEV) {
        console.error('❌ Signup API error, falling back to backend:', error);
      }
      // Final fallback to backend registration
      return authAPI.register(userData.email, userData.password, userData.firstName, userData.lastName, userData.deviceFingerprint);
    }
  },

  // Backend register fallback - Use new fingerprint system
  register: async (email: string, password: string, firstName?: string, lastName?: string, deviceFingerprint?: string) => {
    console.log('📤 RAW REGISTER PARAMS:', { email, password: '***', firstName, lastName, deviceFingerprint });

    // Import the new fingerprint system
    const { getFingerprint } = await import('../lib/fingerprint');

    // Generate device fingerprint using new system
    let fingerprint = deviceFingerprint;
    try {
      fingerprint = await getFingerprint();
      console.log('🔐 Generated new v1 fingerprint:', fingerprint);
    } catch (error) {
      console.warn('⚠️ Failed to generate fingerprint:', error);
      fingerprint = null;
    }

    const cleanUserData = {
      email: email.trim().toLowerCase(),
      password: password,
      firstName: firstName?.trim() || 'User',
      lastName: lastName?.trim() || ''
    };

    try {
      console.log('📤 CLEAN SIGNUP REQUEST:', JSON.stringify(cleanUserData, null, 2));

      // Use new API client with fingerprint support
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Type': 'browser'
      };

      // Add fingerprint header if available
      if (fingerprint) {
        headers['X-Device-Fingerprint'] = fingerprint;
      }

      const response = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(cleanUserData),
      });

      console.log('📥 Direct Response Status:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Check if response has error details
      const data = await response.json();

      // One-time retry on fingerprint error
      if (!response.ok && response.status === 400 &&
          (data.message || '').includes('Invalid device fingerprint')) {
        console.warn('🔄 Retrying registration with new fingerprint...');

        // Clear cached fingerprint and generate new one
        localStorage.removeItem('spiq_fp_v1');
        const newFingerprint = await getFingerprint();

        const retryHeaders = { ...headers };
        retryHeaders['X-Device-Fingerprint'] = newFingerprint;

        const retryResponse = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
          method: 'POST',
          headers: retryHeaders,
          credentials: 'include',
          body: JSON.stringify(cleanUserData),
        });

        const retryData = await retryResponse.json();

        if (!retryResponse.ok) {
          console.error('📥 Retry also failed:', retryData);
          throw new Error(retryData.message || 'Registration failed after retry');
        }

        console.log('📥 Retry Registration Success:', retryData);
        return authAPI.transformRegistrationResponse(retryData);
      }

      if (!response.ok) {
        console.error('📥 Registration failed:', {
          status: response.status,
          message: data.message || data.error || 'Unknown error',
          errors: data.errors || data.validation || null,
          fullResponse: data,
          isEmptyResponse: !data || Object.keys(data).length === 0
        });

        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      console.log('📥 Registration Success:', data);
      return authAPI.transformRegistrationResponse(data);

    } catch (error) {
      console.error('❌ Register request failed:', error);
      throw error;
    }
  },

  // Transform registration response to consistent format
  transformRegistrationResponse: (data: any) => {
    // ✅ TRANSFORM: Ensure response structure matches frontend expectations
    if (data && data.data && data.data.user) {
      // Transform the user object to ensure consistency
      const transformedUser = {
        id: String(data.data.user.id), // Ensure ID is string
        email: data.data.user.email,
        firstName: data.data.user.firstName || '',
        lastName: data.data.user.lastName || '',
        name: data.data.user.name || `${data.data.user.firstName || ''} ${data.data.user.lastName || ''}`.trim(),
        role: data.data.user.role || 'USER',
        roles: Array.isArray(data.data.user.roles) ? data.data.user.roles : [],
        permissions: Array.isArray(data.data.user.permissions) ? data.data.user.permissions : [],
        subscriptionTier: data.data.user.subscriptionTier || 'free',
        tokenBalance: data.data.user.tokenBalance || 0
      };

      console.log('📥 Transformed User:', transformedUser);

      return {
        success: data.success,
        message: data.message,
        data: {
          user: transformedUser,
          token: data.data.token
        }
      };
    }

    return data;
  },

  me: async () => {
    try {
      if (import.meta.env.DEV) {
      }

      const { user, error } = await auth.getCurrentUser();

      if (error) {
        if (import.meta.env.DEV) {
          console.log('ℹ️ Supabase getCurrentUser error (normal for unauthenticated users):', error);
        }
        throw new Error('Auth session missing!');
      }

      if (!user) {
        if (import.meta.env.DEV) {
          console.log('ℹ️ No authenticated user (normal for landing page)');
        }
        throw new Error('Auth session missing!');
      }

      if (import.meta.env.DEV) {
      }

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
      if (import.meta.env.DEV) {
        console.log('ℹ️ Me API completed without authentication (normal for landing page):', error);
      }
      throw error;
    }
  }
};

// ✅ DEMO API: Special API request function that doesn't include authentication
export const demoApiRequest = async (method: string, url: string, body?: any) => {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${url}`;

  if (import.meta.env.DEV) {
  }

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': typeof window !== 'undefined' ? window.location.origin : '',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      credentials: 'include',
      mode: 'cors',
    };

    // DON'T add auth token for demo requests - they should work without authentication

    // Add device fingerprint for production security (demo requests also need this)
    if (typeof window !== 'undefined') {
      const generateDeviceFingerprint = (): string => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('Device fingerprint', 2, 2);
        }

        const fingerprint = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screen: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          canvas: canvas.toDataURL(),
          timestamp: Date.now()
        };

        const fingerprintString = JSON.stringify(fingerprint);
        const hash = btoa(fingerprintString).slice(0, 32);
        return hash;
      };

      const deviceFingerprint = generateDeviceFingerprint();
      console.log('🔐 Generated device fingerprint:', deviceFingerprint);
      console.log('🔐 Device fingerprint length:', deviceFingerprint.length);
      options.headers = {
        ...options.headers,
        'X-Device-Fingerprint': deviceFingerprint,
      };
    }

    if (body) {
      options.body = JSON.stringify(body);
      if (import.meta.env.DEV) {
      }
    }

    if (import.meta.env.DEV) {
      console.log('⏳ Waiting for response...');
    }
    const response = await fetch(fullUrl, options);
    if (import.meta.env.DEV) {
    }
    if (import.meta.env.DEV) {
    }

    // Log response data BEFORE checking if ok
    let responseData: any = null;
    try {
      const responseText = await response.text();
      if (import.meta.env.DEV) {
      }
      responseData = responseText ? JSON.parse(responseText) : null;
      if (import.meta.env.DEV) {
      }
    } catch (parseError) {
      if (import.meta.env.DEV) {
        console.error(`❌ Demo Response Parse Error:`, parseError);
      }
    }

    if (!response.ok) {
      const errorData = responseData || {
        message: `Request failed with status ${response.status}`,
        status: response.status,
        statusText: response.statusText
      };

      if (import.meta.env.DEV) {
        console.error(`❌ Demo API Error Response:`, errorData);
      }

      // Create enhanced error object for 429 responses
      if (response.status === 429) {
        const enhancedError = new Error(JSON.stringify(errorData));
        enhancedError.status = response.status;
        enhancedError.retryAfter = errorData.retryAfter;
        enhancedError.remaining = errorData.remaining;
        throw enhancedError;
      }

      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    // Return a Response-like object with the parsed data
    return {
      ...response,
      json: async () => responseData
    };
  } catch (error) {
    console.error(`❌ Demo API Error for ${fullUrl}:`, error);

    // Enhanced error handling with network detection
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - please check your internet connection');
    }

    throw error;
  }
};

export default { getApiBaseUrl, apiRequest, demoApiRequest };