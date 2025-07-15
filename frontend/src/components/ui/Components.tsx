// src/components/ui/toaster.tsx
import React from 'react';

export function Toaster() {
  return (
    <div id="toast-container" className="fixed top-4 right-4 z-50">
      {/* Toast notifications will appear here */}
    </div>
  );
}

export function toast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // Simple toast implementation - in a real app you'd use a proper toast library
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `mb-2 px-4 py-2 rounded-lg shadow-lg text-white transition-all duration-300 transform translate-x-full ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  }`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

// src/components/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/templates', label: 'Templates' },
    { path: '/categories', label: 'Categories' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              SmartPromptIQ
            </Link>
            <div className="ml-6 flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user?.firstName}
                </span>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// src/components/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart <span className="text-indigo-600">PromptIQ</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Generate intelligent, contextual prompts for AI models with our 
            advanced prompt engineering platform.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link to="/dashboard">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/templates">View Templates</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}