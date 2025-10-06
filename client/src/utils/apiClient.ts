// utils/apiClient.ts
import { requestQueue } from './requestQueue';

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number;
}

class APIClient {
  private cache = new Map<string, CacheEntry>();
  private baseURL = 'http://localhost:5000';

  async post<T>(
    endpoint: string,
    data: any,
    options: {
      priority?: 'high' | 'normal' | 'low';
      cache?: boolean;
      cacheTime?: number; // milliseconds
      skipQueue?: boolean;
    } = {}
  ): Promise<T> {
    const {
      priority = 'normal',
      cache = false,
      cacheTime = 5 * 60 * 1000, // 5 minutes default
      skipQueue = false
    } = options;

    // Check cache first
    if (cache) {
      const cacheKey = `${endpoint}:${JSON.stringify(data)}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < cached.expiresIn) {
        console.log('Returning cached result');
        return cached.data;
      }
    }

    const requestFn = async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      const result = await response.json();

      // Cache the result
      if (cache) {
        const cacheKey = `${endpoint}:${JSON.stringify(data)}`;
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          expiresIn: cacheTime
        });
      }

      return result;
    };

    const requestId = `${endpoint}-${Date.now()}-${Math.random()}`;

    if (skipQueue) {
      return requestFn();
    }

    return requestQueue.add(requestFn, requestId, priority);
  }

  async get<T>(
    endpoint: string,
    options: {
      priority?: 'high' | 'normal' | 'low';
      cache?: boolean;
      cacheTime?: number;
      skipQueue?: boolean;
      params?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const {
      priority = 'normal',
      cache = true, // GET requests are cached by default
      cacheTime = 5 * 60 * 1000,
      skipQueue = false,
      params = {}
    } = options;

    // Build URL with query params
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    // Check cache first
    if (cache) {
      const cacheKey = `GET:${url.toString()}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < cached.expiresIn) {
        console.log('Returning cached GET result');
        return cached.data;
      }
    }

    const requestFn = async () => {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      const result = await response.json();

      // Cache the result
      if (cache) {
        const cacheKey = `GET:${url.toString()}`;
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          expiresIn: cacheTime
        });
      }

      return result;
    };

    const requestId = `GET:${endpoint}-${Date.now()}-${Math.random()}`;

    if (skipQueue) {
      return requestFn();
    }

    return requestQueue.add(requestFn, requestId, priority);
  }

  async put<T>(
    endpoint: string,
    data: any,
    options: {
      priority?: 'high' | 'normal' | 'low';
      skipQueue?: boolean;
    } = {}
  ): Promise<T> {
    const { priority = 'normal', skipQueue = false } = options;

    const requestFn = async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      return response.json();
    };

    const requestId = `PUT:${endpoint}-${Date.now()}-${Math.random()}`;

    if (skipQueue) {
      return requestFn();
    }

    return requestQueue.add(requestFn, requestId, priority);
  }

  async delete<T>(
    endpoint: string,
    options: {
      priority?: 'high' | 'normal' | 'low';
      skipQueue?: boolean;
    } = {}
  ): Promise<T> {
    const { priority = 'normal', skipQueue = false } = options;

    const requestFn = async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      // DELETE might return empty response
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    };

    const requestId = `DELETE:${endpoint}-${Date.now()}-${Math.random()}`;

    if (skipQueue) {
      return requestFn();
    }

    return requestQueue.add(requestFn, requestId, priority);
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        expiresIn: value.expiresIn,
        age: Date.now() - value.timestamp,
        expired: Date.now() - value.timestamp > value.expiresIn
      }))
    };
  }

  clearExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.expiresIn) {
        this.cache.delete(key);
      }
    }
  }

  setBaseURL(url: string) {
    this.baseURL = url;
  }

  getBaseURL() {
    return this.baseURL;
  }

  // Batch request utility
  async batch<T>(
    requests: Array<{
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
      options?: any;
    }>,
    options: {
      priority?: 'high' | 'normal' | 'low';
      skipQueue?: boolean;
    } = {}
  ): Promise<T[]> {
    const { priority = 'normal', skipQueue = false } = options;

    const batchRequests = requests.map((req, index) => {
      const requestId = `BATCH:${index}-${Date.now()}-${Math.random()}`;

      const requestFn = async () => {
        switch (req.method) {
          case 'GET':
            return this.get(req.endpoint, { ...req.options, skipQueue: true });
          case 'POST':
            return this.post(req.endpoint, req.data, { ...req.options, skipQueue: true });
          case 'PUT':
            return this.put(req.endpoint, req.data, { ...req.options, skipQueue: true });
          case 'DELETE':
            return this.delete(req.endpoint, { ...req.options, skipQueue: true });
          default:
            throw new Error(`Unsupported method: ${req.method}`);
        }
      };

      if (skipQueue) {
        return requestFn();
      }

      return requestQueue.add(requestFn, requestId, priority);
    });

    return Promise.all(batchRequests);
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Export class for custom instances
export { APIClient };

// Type definitions
export interface APIClientOptions {
  priority?: 'high' | 'normal' | 'low';
  cache?: boolean;
  cacheTime?: number;
  skipQueue?: boolean;
}

export interface BatchRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  options?: APIClientOptions;
}

// Helper functions for common use cases
export const quickPost = <T>(endpoint: string, data: any) =>
  apiClient.post<T>(endpoint, data);

export const quickGet = <T>(endpoint: string, params?: Record<string, string>) =>
  apiClient.get<T>(endpoint, { params });

export const priorityPost = <T>(endpoint: string, data: any) =>
  apiClient.post<T>(endpoint, data, { priority: 'high' });

export const cachedGet = <T>(endpoint: string, cacheTime?: number) =>
  apiClient.get<T>(endpoint, { cache: true, cacheTime });