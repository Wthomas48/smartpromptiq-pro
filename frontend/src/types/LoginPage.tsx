import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

interface LoginPageProps {
  onLogin?: (user: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  const handleSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful authentication
      const mockUser = {
        name: data.name || 'John Doe',
        email: data.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`
      };

      if (onLogin) {
        onLogin(mockUser);
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError('');
  };

  return (
    <AuthForm
      mode={mode}
      onSubmit={handleSubmit}
      onModeChange={handleModeChange}
      loading={loading}
      error={error}
    />
  );
}