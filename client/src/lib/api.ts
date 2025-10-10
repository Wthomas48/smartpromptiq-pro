/**
 * API Client with Device Fingerprint Support
 * Handles automatic fingerprint attachment and retry logic
 */

import { getFingerprint } from './fingerprint';

// Get API base URL from environment or fallback to local
function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
}

interface ApiRequestOptions extends RequestInit {
  skipFingerprint?: boolean;
  retries?: number;
}

/**
 * Enhanced fetch wrapper with device fingerprint support
 */
export async function apiRequest(path: string, options: ApiRequestOptions = {}): Promise<any> {
  const url = `${getApiBaseUrl()}${path}`;
  const { skipFingerprint = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});

  // Set default content type if not specified
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Add device fingerprint header (unless explicitly skipped)
  if (!skipFingerprint) {
    try {
      const fp = await getFingerprint();
      headers.set('X-Device-Fingerprint', fp);
    } catch (error) {
      console.warn('⚠️ Failed to get device fingerprint:', error);
      // Continue without fingerprint - server will handle this gracefully
    }
  }

  const res = await fetch(url, { ...fetchOptions, headers, credentials: 'include' });
  const data = await res.json().catch(() => ({}));

  if (!res.ok && data?.message === 'Invalid device fingerprint' && path.includes('/auth/register')) {
    // one-time recovery
    localStorage.removeItem('spiq_fp_v1');
    const fp = await getFingerprint();
    headers.set('X-Device-Fingerprint', fp);
    const retry = await fetch(url, { ...fetchOptions, headers, credentials: 'include' });
    const retryData = await retry.json().catch(() => ({}));
    if (!retry.ok) {
      const err = new Error(retryData?.message || 'Request failed');
      (err as any).status = retry.status;
      (err as any).fullResponse = retryData;
      throw err;
    }
    return retryData;
  }

  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed');
    (err as any).status = res.status;
    (err as any).fullResponse = data;
    throw err;
  }
  return data;
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: (path: string, options?: ApiRequestOptions) =>
    apiRequest(path, { ...options, method: 'GET' }),

  post: (path: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),

  put: (path: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }),

  delete: (path: string, options?: ApiRequestOptions) =>
    apiRequest(path, { ...options, method: 'DELETE' }),

  patch: (path: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
};

/**
 * Authentication-specific API calls
 */
export const authApi = {
  register: async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    return api.post('/api/auth/register', userData);
  },

  login: async (credentials: {
    email: string;
    password: string;
    isAdminLogin?: boolean;
  }) => {
    return api.post('/api/auth/login', credentials);
  },

  logout: async () => {
    return api.post('/api/auth/logout');
  },

  refreshToken: async () => {
    return api.post('/api/auth/refresh');
  }
};

/**
 * Health check and utility endpoints
 */
export const systemApi = {
  health: () => api.get('/api/health'),
  info: () => api.get('/api/info')
};

// Export the base URL function for other modules
export { getApiBaseUrl };