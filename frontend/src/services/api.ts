// Simplified API Service for Smart PromptIQ

// Types first - export them for use in components
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
  usage?: {
    promptsThisMonth: number;
    promptsLimit: number;
  };
  createdAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  usageCount: number;
  rating: number;
  isPopular: boolean;
  isFeatured: boolean;
  promptTemplate: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPrompts: number;
  totalUsage: number;
  favoritePrompts: number;
  thisWeekUsage: number;
}

// Simple API service class
class APIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'https://smartpromptiq-backend.onrender.com/api';
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.makeRequest('/auth/me');
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    return this.makeRequest('/dashboard/stats');
  }

  // Prompt endpoints
  async generatePrompt(data: {
    category: string;
    answers: Record<string, any>;
  }) {
    return this.makeRequest('/prompts/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserPrompts() {
    return this.makeRequest('/prompts');
  }

  // Templates endpoints
  async getTemplates(filters?: any) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/templates${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // Analytics tracking
  async trackEvent(event: { name: string; properties?: Record<string, any> }) {
    try {
      return this.makeRequest('/analytics/track', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Don't fail the app if analytics fail
      console.warn('Analytics tracking failed:', error);
    }
  }
}

// Export singleton instance
export const apiService = new APIService();
export default apiService;