// SmartPromptIQ Chrome Extension - API Service
// Handles all API communication with retry logic and error handling

class APIService {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.requestCount = 0;
    this.lastResetTime = Date.now();
  }

  // Get current API base URL
  getBaseUrl() {
    // Import CONFIG dynamically or use inline
    const CONFIG = self.CONFIG || window.CONFIG;
    if (CONFIG) {
      return CONFIG.getApiUrl();
    }
    // Fallback
    return 'https://smartpromptiq.com';
  }

  // Get auth token from storage
  async getToken() {
    try {
      const result = await chrome.storage.local.get(['smartpromptiq_token']);
      return result.smartpromptiq_token || null;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  // Set auth token in storage
  async setToken(token) {
    try {
      await chrome.storage.local.set({ smartpromptiq_token: token });
      return true;
    } catch (error) {
      console.error('Failed to set token:', error);
      return false;
    }
  }

  // Clear auth token
  async clearToken() {
    try {
      await chrome.storage.local.remove(['smartpromptiq_token', 'smartpromptiq_user']);
      return true;
    } catch (error) {
      console.error('Failed to clear token:', error);
      return false;
    }
  }

  // Rate limiting check
  checkRateLimit() {
    const now = Date.now();
    const MAX_REQUESTS = 30;
    const WINDOW_MS = 60000;

    if (now - this.lastResetTime > WINDOW_MS) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= MAX_REQUESTS) {
      return false;
    }

    this.requestCount++;
    return true;
  }

  // Main request method with retry logic
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      requiresAuth = true,
      retries = 3,
      retryDelay = 1000
    } = options;

    // Rate limit check
    if (!this.checkRateLimit()) {
      throw new APIError('Rate limit exceeded. Please wait a moment.', 429);
    }

    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = await this.getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      } else {
        throw new APIError('Authentication required', 401);
      }
    }

    const fetchOptions = {
      method,
      headers: requestHeaders
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    // Retry logic
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);

        // Handle different response codes
        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            data,
            status: response.status
          };
        }

        // Handle auth errors
        if (response.status === 401) {
          await this.clearToken();
          throw new APIError('Session expired. Please sign in again.', 401);
        }

        // Handle rate limiting from server
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 60;
          throw new APIError(`Too many requests. Try again in ${retryAfter} seconds.`, 429);
        }

        // Handle other errors
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Response wasn't JSON
        }

        throw new APIError(errorMessage, response.status);

      } catch (error) {
        lastError = error;

        // Don't retry on auth or rate limit errors
        if (error instanceof APIError && [401, 403, 429].includes(error.status)) {
          throw error;
        }

        // Retry on network errors or 5xx errors
        if (attempt < retries) {
          console.log(`Request failed, retrying (${attempt + 1}/${retries})...`);
          await this.sleep(retryDelay * (attempt + 1));
          continue;
        }
      }
    }

    throw lastError || new APIError('Request failed after retries', 0);
  }

  // Helper for sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============ AUTH ENDPOINTS ============

  async getCurrentUser() {
    return this.request('/api/auth/me', { method: 'GET' });
  }

  async login(email, password) {
    const result = await this.request('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false
    });

    if (result.success && result.data.token) {
      await this.setToken(result.data.token);
      if (result.data.user) {
        await chrome.storage.local.set({ smartpromptiq_user: result.data.user });
      }
    }

    return result;
  }

  async logout() {
    await this.clearToken();
    return { success: true };
  }

  // ============ PROMPTS ENDPOINTS ============

  async getPrompts(options = {}) {
    const { page = 1, limit = 20, category = null } = options;
    let endpoint = `/api/prompts?page=${page}&limit=${limit}`;
    if (category) {
      endpoint += `&category=${category}`;
    }
    return this.request(endpoint, { method: 'GET' });
  }

  async createPrompt(promptData) {
    return this.request('/api/prompts', {
      method: 'POST',
      body: promptData
    });
  }

  async deletePrompt(promptId) {
    return this.request(`/api/prompts/${promptId}`, {
      method: 'DELETE'
    });
  }

  // ============ GENERATE ENDPOINTS ============

  async generatePrompt(data) {
    const { category, context, type = 'prompt' } = data;
    return this.request('/api/generate', {
      method: 'POST',
      body: { category, context, type }
    });
  }

  async quickGenerate(action, text) {
    return this.request('/api/generate/quick', {
      method: 'POST',
      body: { action, text }
    });
  }

  // ============ TEMPLATES ENDPOINTS ============

  async getTemplates(category = null) {
    let endpoint = '/api/templates';
    if (category) {
      endpoint += `?category=${category}`;
    }
    return this.request(endpoint, { method: 'GET' });
  }

  async getCategories() {
    return this.request('/api/categories', { method: 'GET' });
  }

  // ============ USER ENDPOINTS ============

  async getUserProfile() {
    return this.request('/api/users/profile', { method: 'GET' });
  }

  async getUserUsage() {
    return this.request('/api/usage', { method: 'GET' });
  }

  async getUserTokens() {
    return this.request('/api/users/tokens', { method: 'GET' });
  }
}

// Custom error class for API errors
class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// Create singleton instance
const apiService = new APIService();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { apiService, APIService, APIError };
}
