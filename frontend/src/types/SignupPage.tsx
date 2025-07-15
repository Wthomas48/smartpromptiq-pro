import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

interface SignupPageProps {
  onSignup?: (user: any) => void;
}

export default function SignupPage({ onSignup }: SignupPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const navigate = useNavigate();

  const handleSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful registration
      const mockUser = {
        name: data.name || 'New User',
        email: data.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`
      };

      if (onSignup) {
        onSignup(mockUser);
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
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