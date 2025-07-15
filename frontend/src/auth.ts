// src/types/auth.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'premium';
  avatar?: string;
  subscription?: Subscription;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  expiresAt?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  features: SubscriptionFeature[];
}

export interface SubscriptionFeature {
  name: string;
  limit?: number;
  unlimited?: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  defaultPromptCategory?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  marketing: boolean;
  updates: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  marketingOptIn?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

// JWT Token payload interface
export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: string;
  iat: number; // issued at
  exp: number; // expires at
}

// API Error response
export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}