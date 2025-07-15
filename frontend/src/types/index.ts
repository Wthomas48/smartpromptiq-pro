// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  subscription?: 'free' | 'pro' | 'enterprise';
}

// Auth types
export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

// Prompt types
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  usage?: number;
  rating?: number;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables: TemplateVariable[];
  isPublic: boolean;
  createdBy: string;
  usage: number;
  rating: number;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  description: string;
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

// Component props
export interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
  onAuthAction?: (action: 'login' | 'signup' | 'logout') => void;
}

export interface HeaderProps {
  user?: User | null;
  onAuthAction?: (action: 'login' | 'signup' | 'logout') => void;
}

export interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit?: (data: AuthFormData) => Promise<void>;
  onModeChange?: (mode: 'login' | 'signup') => void;
  loading?: boolean;
  error?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard types
export interface DashboardStats {
  totalPrompts: number;
  totalUsage: number;
  averageRating: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'used' | 'shared';
  title: string;
  timestamp: string;
  promptId?: string;
}