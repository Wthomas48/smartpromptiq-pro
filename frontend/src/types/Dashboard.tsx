import React from 'react';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';

interface DashboardPageProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onAuthAction?: (action: 'login' | 'signup' | 'logout') => void;
}

export default function DashboardPage({ user, onAuthAction }: DashboardPageProps) {
  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Layout user={user} onAuthAction={onAuthAction}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Please sign in to access your dashboard
            </h1>
            <button
              onClick={() => onAuthAction?.('login')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onAuthAction={onAuthAction}>
      <Dashboard user={user} />
    </Layout>
  );
}